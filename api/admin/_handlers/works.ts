import { kv, isKvConfigured } from "../_lib/kv.js";
import { extractTokenFromHeader, verifyToken } from "../_lib/auth.js";
import { createPreSnapshot, recordChangelog } from "../_lib/changelog.js";
import { Work, WORKS_BY_SLUG } from "../_lib/initialData.js";
import { nanoid } from "nanoid";

// Helper para obtener las obras actuales de una galería
async function getWorksForGallery(slug: string): Promise<Work[]> {
  const activeSlug = slug === "ilustracion" ? "musae" : slug;
  if (isKvConfigured()) {
    try {
      const raw = await kv.get(`miluarte:gallery:${activeSlug}`);
      if (raw) {
        return typeof raw === "string" ? JSON.parse(raw) : (raw as any);
      }
    } catch (e) {
      console.warn(`KV get works for ${slug} error, using fallback:`, e);
    }
  }

  // Fallback estático
  const staticWorks = WORKS_BY_SLUG[activeSlug] || [];
  return staticWorks.map((w, index) => ({
    ...w,
    order: index,
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

  const slug = req.query?.slug || req.body?.slug;

  // 1. GET: Listar obras de una galería (público / frontend & admin)
  if (req.method === "GET") {
    if (!slug) {
      return res.status(400).json({ error: "Slug de galería requerido" });
    }

    try {
      const works = await getWorksForGallery(slug.toString());
      works.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      return res.status(200).json(works);
    } catch (error: any) {
      console.warn(`Fallback on GET /api/admin/works for ${slug}:`, error);
      const fallbackWorks = (WORKS_BY_SLUG[slug.toString()] || []).map((w, i) => ({ ...w, order: i }));
      return res.status(200).json(fallbackWorks);
    }
  }

  // Las operaciones de mutación requieren autenticación
  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: "No autorizado" });
  }

  if (!slug) {
    return res.status(400).json({ error: "Slug de galería requerido para operar" });
  }

  const gallerySlug = slug.toString();

  // 2. POST: Agregar obra a la galería
  if (req.method === "POST") {
    try {
      const {
        title,
        year,
        technique,
        size,
        price,
        available,
        img,
        publicId,
        imgPos,
        gridCol,
        aspect,
        featured,
      } = req.body || {};

      if (!img) {
        return res.status(400).json({ error: "La URL de la imagen es obligatoria" });
      }

      const works = await getWorksForGallery(gallerySlug);

      const newWork: Work = {
        id: nanoid(8),
        title: (title || "Sin título").trim(),
        year: (year || new Date().getFullYear().toString()).trim(),
        technique: (technique || "Arte digital").trim(),
        size: (size || "Digital").trim(),
        price: (price || "Disponible").trim(),
        available: available !== undefined ? Boolean(available) : true,
        img: img.trim(),
        publicId: publicId || "",
        imgPos: imgPos || "50% 50%",
        gridCol: gridCol || "md:col-span-1",
        aspect: aspect || "1/1",
        order: works.length,
        featured: Boolean(featured),
      };

      const preSnapId = await createPreSnapshot();

      works.push(newWork);

      if (isKvConfigured()) {
        await kv.set(`miluarte:gallery:${gallerySlug}`, JSON.stringify(works));
      }

      await recordChangelog(`Subió la obra "${newWork.title}" en la galería "${gallerySlug}"`, "works", preSnapId);

      return res.status(201).json(newWork);
    } catch (error: any) {
      console.error("Error al agregar obra:", error);
      return res.status(500).json({ error: "Error al agregar obra" });
    }
  }

  // 3. PUT: Actualizar obra, guardar lote completo o reordenar
  if (req.method === "PUT") {
    try {
      const { id, ids, reorder, works: batchWorks, ...updates } = req.body || {};
      const works = await getWorksForGallery(gallerySlug);

      // Modo Guardar lote completo (Diseño interactivo de puzzle)
      if (Array.isArray(batchWorks)) {
        const preSnapId = await createPreSnapshot();
        if (isKvConfigured()) {
          await kv.set(`miluarte:gallery:${gallerySlug}`, JSON.stringify(batchWorks));
        }
        await recordChangelog(`Actualizó el diseño y tamaños de la galería "${gallerySlug}"`, "works", preSnapId);
        return res.status(200).json(batchWorks);
      }

      // Modo Reordenar
      if (reorder && Array.isArray(ids)) {
        const preSnapId = await createPreSnapshot();
        const workMap = new Map(works.map((w) => [w.id, w]));
        const reordered: Work[] = [];

        ids.forEach((workId, idx) => {
          const item = workMap.get(workId);
          if (item) {
            item.order = idx;
            reordered.push(item);
            workMap.delete(workId);
          }
        });

        workMap.forEach((item) => {
          item.order = reordered.length;
          reordered.push(item);
        });

        if (isKvConfigured()) {
          await kv.set(`miluarte:gallery:${gallerySlug}`, JSON.stringify(reordered));
        }

        await recordChangelog(`Reordenó las obras de la galería "${gallerySlug}"`, "works", preSnapId);
        return res.status(200).json(reordered);
      }

      // Modo Edición individual
      const workId = id || req.query?.id;
      if (!workId) {
        return res.status(400).json({ error: "ID de obra requerido para editar" });
      }

      const index = works.findIndex((w) => String(w.id) === String(workId));
      if (index === -1) {
        return res.status(404).json({ error: "Obra no encontrada" });
      }

      const preSnapId = await createPreSnapshot();

      works[index] = {
        ...works[index],
        ...updates,
      };

      if (isKvConfigured()) {
        await kv.set(`miluarte:gallery:${gallerySlug}`, JSON.stringify(works));
      }

      await recordChangelog(`Editó la obra "${works[index].title}" en "${gallerySlug}"`, "works", preSnapId);

      return res.status(200).json(works[index]);
    } catch (error: any) {
      console.error("Error al actualizar obra:", error);
      return res.status(500).json({ error: "Error al actualizar obra" });
    }
  }

  // 4. DELETE: Eliminar obra
  if (req.method === "DELETE") {
    try {
      const workId = req.query?.id || req.body?.id;
      if (!workId) {
        return res.status(400).json({ error: "ID de obra requerido para eliminar" });
      }

      let works = await getWorksForGallery(gallerySlug);
      const target = works.find((w) => String(w.id) === String(workId));

      if (!target) {
        return res.status(404).json({ error: "Obra no encontrada" });
      }

      const preSnapId = await createPreSnapshot();

      works = works.filter((w) => String(w.id) !== String(workId));
      works.forEach((w, idx) => {
        w.order = idx;
      });

      if (isKvConfigured()) {
        await kv.set(`miluarte:gallery:${gallerySlug}`, JSON.stringify(works));
      }

      await recordChangelog(`Eliminó la obra "${target.title}" de "${gallerySlug}"`, "works", preSnapId);

      return res.status(200).json({ success: true, deletedId: workId });
    } catch (error: any) {
      console.error("Error al eliminar obra:", error);
      return res.status(500).json({ error: "Error al eliminar obra" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
