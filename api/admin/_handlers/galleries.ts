import { kv, isKvConfigured } from "../_lib/kv.js";
import { extractTokenFromHeader, verifyToken } from "../_lib/auth.js";
import { createPreSnapshot, recordChangelog } from "../_lib/changelog.js";
import { GalleryMeta, getBaseGalleries, BASE_GALLERY_SLUGS, WORKS_BY_SLUG } from "../_lib/initialData.js";

// Helper para obtener las galerías actuales
async function getGalleries(): Promise<GalleryMeta[]> {
  const baseGalleries = getBaseGalleries();

  if (isKvConfigured()) {
    try {
      const raw = await kv.get("miluarte:galleries");
      if (raw) {
        const parsed: GalleryMeta[] = typeof raw === "string" ? JSON.parse(raw) : (raw as any);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Asegurar que las galerías base NUNCA desaparezcan
          const existingSlugs = new Set(parsed.map((g) => g.slug));
          for (const bg of baseGalleries) {
            if (!existingSlugs.has(bg.slug)) {
              parsed.push(bg);
            }
          }
          return parsed.filter((g) => g.slug !== "ilustracion");
        }
      }
    } catch (e) {
      console.warn("KV get galleries error, using fallback:", e);
    }
  }

  // Fallback a los datos estáticos si KV aún no tiene datos o está vacío
  return baseGalleries;
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

  // 1. GET: Listar todas las galerías con conteo de obras real
  if (req.method === "GET") {
    try {
      const galleries = await getGalleries();
      galleries.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const SLUG_TO_FOLDER: Record<string, string> = {
  musae: "miluarte/musae",
  diggin: "miluarte/diggin",
  animas: "miluarte/animas",
  retratos: "miluarte/retratos",
  "pasta-ya": "miluarte/pasta-ya",
  "3d-stands": "miluarte/renders",
  "concept-art": "miluarte/renders",
  "diseno-grafico": "miluarte/musae",
};

function normalizeCoverUrl(url: string, slug: string): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  const targetFolder = SLUG_TO_FOLDER[slug] || `miluarte/${slug}`;
  if (url.includes(`/${targetFolder}/`)) return url;
  const match = url.match(/([a-zA-Z0-9_\-%]+\.[a-zA-Z0-9]+)$/i);
  if (match) {
    return `https://res.cloudinary.com/doznr2qm4/image/upload/${targetFolder}/${match[1]}`;
  }
  return url;
}

            const enriched = await Promise.all(
        galleries.map(async (g) => {
          let count = (WORKS_BY_SLUG[g.slug] || []).length;
          let cover = g.coverImage || (WORKS_BY_SLUG[g.slug] && WORKS_BY_SLUG[g.slug][0]?.img) || "";
          
          if (isKvConfigured()) {
            try {
              const raw = await kv.get(`miluarte:gallery:${g.slug}`);
              if (raw) {
                const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
                if (Array.isArray(parsed)) {
                  count = parsed.length;
                  if (!g.coverImage && parsed.length > 0 && parsed[0].img) {
                    cover = parsed[0].img;
                  }
                }
              }
            } catch (e) {}
          }
          return {
            ...g,
            worksCount: count,
            coverImage: normalizeCoverUrl(cover, g.slug),
          };
        })
      );

      return res.status(200).json(enriched);
    } catch (error: any) {
      console.warn("Fallback to static galleries on GET /api/admin/galleries:", error);
      const fallback = getBaseGalleries().map((g) => ({
        ...g,
        worksCount: (WORKS_BY_SLUG[g.slug] || []).length,
      }));
      return res.status(200).json(fallback);
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

      // Capturar pre-snapshot ANTES de modificar la base de datos
      const preSnapId = await createPreSnapshot();

      galleries.push(newGallery);

      if (isKvConfigured()) {
        await kv.set("miluarte:galleries", JSON.stringify(galleries));
        // Inicializar array de obras vacío para esta galería
        await kv.set(`miluarte:gallery:${slug}`, JSON.stringify([]));
      }

      await recordChangelog(`Creó la galería "${newGallery.title}"`, "galleries", preSnapId);

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
        const preSnapId = await createPreSnapshot();
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

        await recordChangelog("Reordenó la posición de las galerías", "galleries", preSnapId);
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

      const preSnapId = await createPreSnapshot();

      galleries[index] = {
        ...galleries[index],
        ...updates,
      };

      if (isKvConfigured()) {
        await kv.set("miluarte:galleries", JSON.stringify(galleries));
      }

      await recordChangelog(`Editó los detalles de la galería "${galleries[index].title}"`, "galleries", preSnapId);

      return res.status(200).json(galleries[index]);
    } catch (error: any) {
      console.error("Error al actualizar galería:", error);
      return res.status(500).json({ error: "Error al actualizar galería" });
    }
  }

  // 4. DELETE: Eliminar galería y sus obras (solo galerías personalizadas)
  if (req.method === "DELETE") {
    try {
      const slug = req.query?.slug || req.body?.slug;
      if (!slug) {
        return res.status(400).json({ error: "Slug de galería requerido" });
      }

      if (BASE_GALLERY_SLUGS.has(slug)) {
        return res.status(400).json({ error: "Las colecciones originales del portafolio no pueden eliminarse del sistema." });
      }

      let galleries = await getGalleries();
      const target = galleries.find((g) => g.slug === slug);
      if (!target) {
        return res.status(404).json({ error: "Galería no encontrada" });
      }

      const preSnapId = await createPreSnapshot();

      galleries = galleries.filter((g) => g.slug !== slug);
      galleries.forEach((g, i) => {
        g.order = i;
      });

      if (isKvConfigured()) {
        await kv.set("miluarte:galleries", JSON.stringify(galleries));
        await kv.del(`miluarte:gallery:${slug}`);
      }

      await recordChangelog(`Eliminó la galería "${target.title}"`, "galleries", preSnapId);

      return res.status(200).json({ success: true, deletedSlug: slug });
    } catch (error: any) {
      console.error("Error al eliminar galería:", error);
      return res.status(500).json({ error: "Error al eliminar galería" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
