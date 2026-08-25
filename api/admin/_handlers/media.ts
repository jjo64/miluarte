import { extractTokenFromHeader, verifyToken } from "../_lib/auth.js";
import { kv, isKvConfigured } from "../_lib/kv.js";
import { WORKS_BY_SLUG, RENDERS, getBaseGalleries, translations } from "../_lib/initialData.js";

export interface MediaAsset {
  publicId: string;
  url: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format?: string;
  createdAt?: string;
  folder?: string;
  source?: "cloudinary" | "database";
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PATCH,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Requiere autenticación de administrador
  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "doznr2qm4";
  const apiKey = process.env.CLOUDINARY_API_KEY || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

  // ── PATCH / POST: Renombrar imagen directamente en Cloudinary y sincronizar BD ──
  if (req.method === "PATCH" || (req.method === "POST" && req.url?.includes("rename"))) {
    if (!apiKey || !apiSecret) {
      return res.status(400).json({ error: "Credenciales de Cloudinary no configuradas en el servidor" });
    }

    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      const fromPublicId = (body.fromPublicId || body.from_public_id || "").trim();
      let toPublicId = (body.toPublicId || body.to_public_id || "").trim();
      const newFilename = (body.newFilename || "").trim();

      // Si nos pasan un nuevo nombre de archivo simple, preservar la carpeta
      if (!toPublicId && newFilename && fromPublicId) {
        const folderParts = fromPublicId.split("/");
        if (folderParts.length > 1) {
          const folder = folderParts.slice(0, -1).join("/");
          // Sanitizar nuevo nombre de archivo (letras, números, guiones y guiones bajos)
          const cleanName = newFilename.replace(/[^a-zA-Z0-9_\-\s]/g, "").replace(/\s+/g, "_");
          toPublicId = `${folder}/${cleanName}`;
        } else {
          toPublicId = newFilename;
        }
      }

      if (!fromPublicId || !toPublicId) {
        return res.status(400).json({ error: "Parámetros 'fromPublicId' y 'toPublicId' requeridos" });
      }

      if (fromPublicId === toPublicId) {
        return res.status(200).json({ message: "El nombre no ha cambiado", publicId: toPublicId });
      }

      // Validar que pertenezca a miluarte
      if (!fromPublicId.startsWith("miluarte") || !toPublicId.startsWith("miluarte")) {
        return res.status(403).json({ error: "Solo se permite renombrar archivos dentro de la carpeta 'miluarte'" });
      }

      const authHeader = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`;
      const renameUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/rename`;

      const formData = new URLSearchParams();
      formData.append("from_public_id", fromPublicId);
      formData.append("to_public_id", toPublicId);
      formData.append("overwrite", "true");

      const cRes = await fetch(renameUrl, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!cRes.ok) {
        const errorData = await cRes.json().catch(() => ({}));
        return res.status(cRes.status).json({
          error: "Error de Cloudinary al renombrar: " + (errorData.error?.message || cRes.statusText),
        });
      }

      const cData = await cRes.json();
      const newSecureUrl = cData.secure_url || cData.url;

      // Actualizar referencias en la base de datos KV si está disponible
      if (isKvConfigured() && newSecureUrl) {
        try {
          const galleries = getBaseGalleries();
          for (const g of galleries) {
            const raw = await kv.get(`miluarte:gallery:${g.slug}`);
            const works = typeof raw === "string" ? JSON.parse(raw) : raw;
            if (Array.isArray(works)) {
              let updated = false;
              const newWorks = works.map((w: any) => {
                if (w.img && (w.img.includes(fromPublicId) || (w.publicId && w.publicId === fromPublicId))) {
                  updated = true;
                  return { ...w, img: newSecureUrl, publicId: toPublicId };
                }
                return w;
              });
              if (updated) {
                await kv.set(`miluarte:gallery:${g.slug}`, newWorks);
              }
            }
          }
        } catch (kvErr) {
          console.warn("No se pudieron actualizar referencias en KV tras renombrar:", kvErr);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Imagen renombrada exitosamente en Cloudinary",
        asset: {
          publicId: cData.public_id,
          url: cData.url,
          secureUrl: cData.secure_url,
          width: cData.width,
          height: cData.height,
          format: cData.format,
          folder: toPublicId.includes("/") ? toPublicId.split("/").slice(0, -1).join("/") : "miluarte",
          source: "cloudinary",
        },
      });
    } catch (err: any) {
      console.error("Error al renombrar imagen:", err);
      return res.status(500).json({ error: "Error en el servidor al renombrar: " + err.message });
    }
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const assetsMap = new Map<string, MediaAsset>();

  // 1. Consultar la API de Cloudinary en tiempo real
  if (apiKey && apiSecret) {
    try {
      const authHeader = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`;
      
      // A. Consultar Cloudinary Search API filtrando estrictamente por la carpeta 'miluarte'
      let nextCursor: string | undefined = undefined;
      let iterations = 0;
      do {
        iterations++;
        const requestBody: any = {
          expression: "resource_type:image AND (folder:miluarte* OR public_id:miluarte*)",
          max_results: 500,
          sort_by: [{ created_at: "desc" }],
        };
        if (nextCursor) {
          requestBody.next_cursor = nextCursor;
        }

        const searchRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/search`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (searchRes.ok) {
          const sData = await searchRes.json();
          if (Array.isArray(sData?.resources)) {
            for (const item of sData.resources) {
              const publicId = (item.public_id || "").toLowerCase();
              const itemFolder = (item.folder || item.asset_folder || "").toLowerCase();
              
              // Excluir estrictamente otros proyectos
              if (publicId.startsWith("cinevault") || itemFolder.startsWith("cinevault")) continue;
              if (!publicId.startsWith("miluarte") && !itemFolder.startsWith("miluarte")) continue;

              const secureUrl = item.secure_url || item.url;
              if (secureUrl) {
                const folder =
                  item.folder ||
                  item.asset_folder ||
                  (item.public_id && item.public_id.includes("/")
                    ? item.public_id.split("/").slice(0, -1).join("/")
                    : "miluarte");

                assetsMap.set(secureUrl, {
                  publicId: item.public_id,
                  url: item.url,
                  secureUrl: item.secure_url,
                  width: item.width,
                  height: item.height,
                  format: item.format,
                  createdAt: item.created_at,
                  folder,
                  source: "cloudinary",
                });
              }
            }
          }
          nextCursor = sData.next_cursor;
        } else {
          break;
        }
      } while (nextCursor && iterations < 10);

      // B. Si la Search API no devolvió resultados o está indexando, consultar Admin API
      if (assetsMap.size === 0) {
        let adminCursor: string | undefined = undefined;
        let adminIterations = 0;
        do {
          adminIterations++;
          const params = new URLSearchParams({
            max_results: "500",
            prefix: "miluarte/",
          });
          if (adminCursor) {
            params.set("next_cursor", adminCursor);
          }

          const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?${params.toString()}`;
          const cRes = await fetch(url, {
            headers: {
              Authorization: authHeader,
            },
          });

          if (cRes.ok) {
            const cData = await cRes.json();
            if (Array.isArray(cData?.resources)) {
              for (const item of cData.resources) {
                const publicId = (item.public_id || "").toLowerCase();
                const itemFolder = (item.folder || item.asset_folder || "").toLowerCase();
                
                // Excluir estrictamente otros proyectos
                if (publicId.startsWith("cinevault") || itemFolder.startsWith("cinevault")) continue;
                if (!publicId.startsWith("miluarte") && !itemFolder.startsWith("miluarte")) continue;

                const secureUrl = item.secure_url || item.url;
                if (secureUrl && !assetsMap.has(secureUrl)) {
                  const folder =
                    item.folder ||
                    item.asset_folder ||
                    (item.public_id && item.public_id.includes("/")
                      ? item.public_id.split("/").slice(0, -1).join("/")
                      : "miluarte");

                  assetsMap.set(secureUrl, {
                    publicId: item.public_id,
                    url: item.url,
                    secureUrl: item.secure_url,
                    width: item.width,
                    height: item.height,
                    format: item.format,
                    createdAt: item.created_at,
                    folder,
                    source: "cloudinary",
                  });
                }
              }
            }
            adminCursor = cData.next_cursor;
          } else {
            break;
          }
        } while (adminCursor && adminIterations < 10);
      }
    } catch (err) {
      console.warn("No se pudo consultar la API de Cloudinary:", err);
    }
  }

  // 2. Solo si Cloudinary no devolvió nada (ej. entorno local sin credenciales API), usar datos de KV
  if (assetsMap.size === 0 && isKvConfigured()) {
    try {
      const urlsToHarvest = new Set<string>();

      // Galerías activas en base de datos KV
      const galleries = getBaseGalleries();
      for (const g of galleries) {
        try {
          const raw = await kv.get(`miluarte:gallery:${g.slug}`);
          const works = typeof raw === "string" ? JSON.parse(raw) : raw;
          if (Array.isArray(works)) {
            for (const w of works) {
              if (w.img && typeof w.img === "string") urlsToHarvest.add(w.img);
            }
          }
        } catch {}
      }

      // Renders en KV
      try {
        const raw = await kv.get("miluarte:renders");
        const dbRenders = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (Array.isArray(dbRenders)) {
          for (const r of dbRenders) {
            if (r.img && typeof r.img === "string") urlsToHarvest.add(r.img);
            if (Array.isArray(r.process)) {
              for (const p of r.process) {
                if (p.src && typeof p.src === "string") urlsToHarvest.add(p.src);
              }
            }
          }
        }
      } catch {}

      // Textos en KV
      try {
        const raw = await kv.get("miluarte:texts");
        const texts = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (texts?.resumePhoto) urlsToHarvest.add(texts.resumePhoto);
        if (texts?.aboutPhoto) urlsToHarvest.add(texts.aboutPhoto);
        if (texts?.aboutMusaeImg) urlsToHarvest.add(texts.aboutMusaeImg);
        if (texts?.heroImage) urlsToHarvest.add(texts.heroImage);
        if (texts?.featuredImage) urlsToHarvest.add(texts.featuredImage);
        if (texts?.sketchImg) urlsToHarvest.add(texts.sketchImg);
        if (texts?.finalImg) urlsToHarvest.add(texts.finalImg);
      } catch {}

      for (const u of urlsToHarvest) {
        if (!u || !u.startsWith("http")) continue;
        let publicId = u;
        let folder = "general";
        if (u.includes("/image/upload/")) {
          const parts = u.split("/image/upload/");
          if (parts[1]) {
            const sub = parts[1].replace(/^v\d+\//, "");
            publicId = sub.substring(0, sub.lastIndexOf(".")) || sub;
            if (publicId.includes("/")) {
              folder = publicId.split("/").slice(0, -1).join("/");
            }
          }
        }

        assetsMap.set(u, {
          publicId,
          url: u,
          secureUrl: u,
          folder,
          source: "database",
        });
      }
    } catch (e) {
      console.warn("Error en fallback de base de datos:", e);
    }
  }

  const assetsList = Array.from(assetsMap.values());
  // Ordenar por fecha de creación (más recientes primero) o por nombre
  assetsList.sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.publicId.localeCompare(b.publicId);
  });

  return res.status(200).json(assetsList);
}
