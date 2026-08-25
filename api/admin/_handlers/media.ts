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
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  // Requiere autenticación de administrador
  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "doznr2qm4";
  const apiKey = process.env.CLOUDINARY_API_KEY || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

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
