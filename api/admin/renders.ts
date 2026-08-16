import { kv, isKvConfigured } from "./_lib/kv";
import { extractTokenFromHeader, verifyToken } from "./_lib/auth";
import { addChangelogEntry } from "./_lib/changelog";
import { RenderItem } from "../../src/app/types/cms";
import { RENDERS } from "../../src/app/pages/RendersPage";
import { nanoid } from "nanoid";

async function getRenders(): Promise<RenderItem[]> {
  if (isKvConfigured()) {
    try {
      const raw = await kv.get("miluarte:renders");
      if (raw) {
        return typeof raw === "string" ? JSON.parse(raw) : (raw as any);
      }
    } catch (e) {
      console.warn("KV get renders error, using fallback:", e);
    }
  }

  // Fallback estático
  return RENDERS.map((r, idx) => ({
    id: r.id,
    title: r.title,
    client: r.client,
    year: r.year,
    badge: r.badge,
    software: r.software,
    delivery: r.delivery,
    description: r.description,
    img: r.img,
    videoSrcMp4: r.videoSrcMp4,
    videoSrcWebm: r.videoSrcWebm,
    process: r.process || [],
    makingOfVideoMp4: r.makingOfVideoMp4,
    makingOfVideoWebm: r.makingOfVideoWebm,
    order: idx,
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

  // 1. GET: Listar todos los proyectos 3D (público / frontend & admin)
  if (req.method === "GET") {
    try {
      const renders = await getRenders();
      renders.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      return res.status(200).json(renders);
    } catch (error: any) {
      return res.status(500).json({ error: "Error al obtener proyectos 3D" });
    }
  }

  // Las operaciones de mutación requieren autenticación
  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: "No autorizado" });
  }

  // 2. POST: Crear nuevo proyecto 3D
  if (req.method === "POST") {
    try {
      const {
        title,
        client,
        year,
        badge,
        software,
        delivery,
        description,
        img,
        publicId,
        videoSrcMp4,
        videoSrcWebm,
        process,
        makingOfVideoMp4,
        makingOfVideoWebm,
      } = req.body || {};

      if (!title || !img) {
        return res.status(400).json({ error: "Título e imagen principal son obligatorios" });
      }

      const renders = await getRenders();

      let slug = (req.body?.id || title)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      if (!slug || renders.some((r) => r.id === slug)) {
        slug = `${slug || "project"}-${nanoid(4)}`;
      }

      const newRender: RenderItem = {
        id: slug,
        title: title.trim(),
        client: (client || "Cliente independiente").trim(),
        year: (year || new Date().getFullYear().toString()).trim(),
        badge: (badge || "STAND · FERIA").trim(),
        software: Array.isArray(software) ? software : ["Blender", "Photoshop"],
        delivery: (delivery || "Renders fotorrealistas").trim(),
        description: (description || "").trim(),
        img: img.trim(),
        publicId: publicId || "",
        videoSrcMp4: videoSrcMp4 || "",
        videoSrcWebm: videoSrcWebm || "",
        process: Array.isArray(process) ? process : [],
        makingOfVideoMp4: makingOfVideoMp4 || "",
        makingOfVideoWebm: makingOfVideoWebm || "",
        order: renders.length,
      };

      renders.push(newRender);

      if (isKvConfigured()) {
        await kv.set("miluarte:renders", JSON.stringify(renders));
      }

      await addChangelogEntry(`Creó el proyecto 3D "${newRender.title}"`, "renders");

      return res.status(201).json(newRender);
    } catch (error: any) {
      console.error("Error al crear render 3D:", error);
      return res.status(500).json({ error: "Error al crear proyecto 3D" });
    }
  }

  // 3. PUT: Actualizar proyecto 3D o reordenar
  if (req.method === "PUT") {
    try {
      const { id, ids, reorder, ...updates } = req.body || {};
      const renders = await getRenders();

      // Modo Reordenar
      if (reorder && Array.isArray(ids)) {
        const renderMap = new Map(renders.map((r) => [r.id, r]));
        const reordered: RenderItem[] = [];

        ids.forEach((renderId, idx) => {
          const item = renderMap.get(renderId);
          if (item) {
            item.order = idx;
            reordered.push(item);
            renderMap.delete(renderId);
          }
        });

        renderMap.forEach((item) => {
          item.order = reordered.length;
          reordered.push(item);
        });

        if (isKvConfigured()) {
          await kv.set("miluarte:renders", JSON.stringify(reordered));
        }

        await addChangelogEntry("Reordenó los proyectos 3D", "renders");
        return res.status(200).json(reordered);
      }

      // Modo Edición individual
      const renderId = id || req.query?.id;
      if (!renderId) {
        return res.status(400).json({ error: "ID de proyecto requerido" });
      }

      const index = renders.findIndex((r) => r.id === renderId);
      if (index === -1) {
        return res.status(404).json({ error: "Proyecto 3D no encontrado" });
      }

      renders[index] = {
        ...renders[index],
        ...updates,
      };

      if (isKvConfigured()) {
        await kv.set("miluarte:renders", JSON.stringify(renders));
      }

      await addChangelogEntry(`Editó el proyecto 3D "${renders[index].title}"`, "renders");

      return res.status(200).json(renders[index]);
    } catch (error: any) {
      console.error("Error al actualizar render 3D:", error);
      return res.status(500).json({ error: "Error al actualizar proyecto 3D" });
    }
  }

  // 4. DELETE: Eliminar proyecto 3D
  if (req.method === "DELETE") {
    try {
      const renderId = req.query?.id || req.body?.id;
      if (!renderId) {
        return res.status(400).json({ error: "ID de proyecto requerido para eliminar" });
      }

      let renders = await getRenders();
      const target = renders.find((r) => r.id === renderId);
      if (!target) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }

      renders = renders.filter((r) => r.id !== renderId);
      renders.forEach((r, idx) => {
        r.order = idx;
      });

      if (isKvConfigured()) {
        await kv.set("miluarte:renders", JSON.stringify(renders));
      }

      await addChangelogEntry(`Eliminó el proyecto 3D "${target.title}"`, "renders");

      return res.status(200).json({ success: true, deletedId: renderId });
    } catch (error: any) {
      console.error("Error al eliminar render 3D:", error);
      return res.status(500).json({ error: "Error al eliminar proyecto 3D" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
