import { kv, isKvConfigured } from "./_lib/kv";
import { extractTokenFromHeader, verifyToken } from "./_lib/auth";
import { addChangelogEntry } from "./_lib/changelog";
import { GalleryMeta } from "../../src/app/types/cms";
import { META } from "../../src/app/pages/CollectionPage";

// Helper para obtener las galerías actuales
async function getGalleries(): Promise<GalleryMeta[]> {
  if (isKvConfigured()) {
    try {
      const raw = await kv.get("miluarte:galleries");
      if (raw) {
        return typeof raw === "string" ? JSON.parse(raw) : (raw as any);
      }
    } catch (e) {
      console.warn("KV get galleries error, using fallback:", e);
    }
  }

  // Fallback a los datos estáticos si KV aún no tiene datos
  return Object.entries(META).map(([slug, meta], index) => ({
    slug,
    title: meta.title,
    label: meta.label,
    statement: meta.statement,
    accent: meta.accent,
    twoColumns: meta.twoColumns || false,
    order: index,
    featured: ["ilustracion", "concept-art", "diggin", "animas"].includes(slug),
  }));
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 1. GET: Listar todas las galerías (público / frontend & admin)
  if (req.method === "GET") {
    try {
      const galleries = await getGalleries();
      galleries.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      return res.status(200).json(galleries);
    } catch (error: any) {
      return res.status(500).json({ error: "Error al obtener galerías" });
    }
  }

  // Las operaciones de mutación (POST, PUT, DELETE) requieren autenticación de administrador
  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: "No autorizado. Sesión requerida." });
  }

  // 2. POST: Crear nueva galería
  if (req.method === "POST") {
    try {
      const { title, label, statement, accent, twoColumns, featured } = req.body || {};
      let slug = (req.body?.slug || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      if (!title || !slug) {
        return res.status(400).json({ error: "Título y slug son obligatorios" });
      }

      const galleries = await getGalleries();

      if (galleries.some((g) => g.slug === slug)) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }

      const newGallery: GalleryMeta = {
        slug,
        title: title.trim(),
        label: (label || "Obra artística").trim(),
        statement: (statement || "").trim(),
        accent: accent || "var(--color-brand-blush)",
        twoColumns: Boolean(twoColumns),
        order: galleries.length,
        featured: Boolean(featured),
      };

      galleries.push(newGallery);

      if (isKvConfigured()) {
        await kv.set("miluarte:galleries", JSON.stringify(galleries));
        // Inicializar array de obras vacío para esta galería
        await kv.set(`miluarte:gallery:${slug}`, JSON.stringify([]));
      }

      await addChangelogEntry(`Creó la galería "${newGallery.title}"`, "galleries");

      return res.status(201).json(newGallery);
    } catch (error: any) {
      console.error("Error al crear galería:", error);
      return res.status(500).json({ error: "Error interno al crear galería" });
    }
  }

  // 3. PUT: Actualizar galería o reordenar
  if (req.method === "PUT") {
    try {
      const { slug, slugs, reorder, ...updates } = req.body || {};

      const galleries = await getGalleries();

      // Modo Reordenar
      if (reorder && Array.isArray(slugs)) {
        const slugMap = new Map(galleries.map((g) => [g.slug, g]));
        const reordered: GalleryMeta[] = [];

        slugs.forEach((s, idx) => {
          const item = slugMap.get(s);
          if (item) {
            item.order = idx;
            reordered.push(item);
            slugMap.delete(s);
          }
        });

        // Añadir cualquier galería que no haya estado en el array de reorder
        slugMap.forEach((item) => {
          item.order = reordered.length;
          reordered.push(item);
        });

        if (isKvConfigured()) {
          await kv.set("miluarte:galleries", JSON.stringify(reordered));
        }

        await addChangelogEntry("Reordenó la posición de las galerías", "galleries");
        return res.status(200).json(reordered);
      }

      // Modo Edición individual
      const targetSlug = slug || req.query?.slug;
      if (!targetSlug) {
        return res.status(400).json({ error: "Se requiere slug de la galería a editar" });
      }

      const index = galleries.findIndex((g) => g.slug === targetSlug);
      if (index === -1) {
        return res.status(404).json({ error: "Galería no encontrada" });
      }

      galleries[index] = {
        ...galleries[index],
        ...updates,
      };

      if (isKvConfigured()) {
        await kv.set("miluarte:galleries", JSON.stringify(galleries));
      }

      await addChangelogEntry(`Editó los detalles de la galería "${galleries[index].title}"`, "galleries");

      return res.status(200).json(galleries[index]);
    } catch (error: any) {
      console.error("Error al actualizar galería:", error);
      return res.status(500).json({ error: "Error al actualizar galería" });
    }
  }

  // 4. DELETE: Eliminar galería y sus obras
  if (req.method === "DELETE") {
    try {
      const slug = req.query?.slug || req.body?.slug;
      if (!slug) {
        return res.status(400).json({ error: "Slug de galería requerido" });
      }

      let galleries = await getGalleries();
      const target = galleries.find((g) => g.slug === slug);
      if (!target) {
        return res.status(404).json({ error: "Galería no encontrada" });
      }

      galleries = galleries.filter((g) => g.slug !== slug);
      galleries.forEach((g, i) => {
        g.order = i;
      });

      if (isKvConfigured()) {
        await kv.set("miluarte:galleries", JSON.stringify(galleries));
        await kv.del(`miluarte:gallery:${slug}`);
      }

      await addChangelogEntry(`Eliminó la galería "${target.title}"`, "galleries");

      return res.status(200).json({ success: true, deletedSlug: slug });
    } catch (error: any) {
      console.error("Error al eliminar galería:", error);
      return res.status(500).json({ error: "Error al eliminar galería" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
