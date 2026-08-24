import { extractTokenFromHeader, verifyToken } from "./_lib/auth.js";
import { kv, isKvConfigured } from "./_lib/kv.js";
import { WORKS_BY_SLUG, RENDERS, getBaseGalleries, translations } from "./_lib/initialData.js";

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

  // 1. Intentar consultar la API de Cloudinary si las credenciales están configuradas
  if (apiKey && apiSecret) {
    try {
      const authHeader = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`;
      
      // A. Consultar Cloudinary Search API (trae todos los recursos de la cuenta ordenados por fecha)
      try {
        const searchRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/search`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            expression: "resource_type:image",
            max_results: 500,
            sort_by: [{ created_at: "desc" }],
          }),
        });

        if (searchRes.ok) {
          const sData = await searchRes.json();
          if (Array.isArray(sData?.resources)) {
            for (const item of sData.resources) {
              const secureUrl = item.secure_url || item.url;
              if (secureUrl) {
                const folder = item.folder || (item.public_id.includes("/") ? item.public_id.split("/").slice(0, -1).join("/") : "general");
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
        }
      } catch (searchErr) {
        console.warn("Cloudinary search API error, intentando Admin API:", searchErr);
      }

      // B. Consultar Admin API para todas las imágenes (con paginación para traer todas las carpetas)
      let nextCursor: string | undefined = undefined;
      let iterations = 0;
      do {
        iterations++;
        const params = new URLSearchParams({
          max_results: "500",
        });
        if (nextCursor) {
          params.set("next_cursor", nextCursor);
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
              const secureUrl = item.secure_url || item.url;
              if (secureUrl && !assetsMap.has(secureUrl)) {
                const folder = item.folder || (item.public_id.includes("/") ? item.public_id.split("/").slice(0, -1).join("/") : "general");
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
          nextCursor = cData.next_cursor;
        } else {
          break;
        }
      } while (nextCursor && iterations < 5);

    } catch (err) {
      console.warn("No se pudo consultar la API de Cloudinary, usando base de datos:", err);
    }
  }

  // 2. Extraer todas las imágenes registradas en la base de datos (KV / local / estáticos)
  try {
    const urlsToHarvest = new Set<string>();

    // A. Galerías y obras
    const galleries = getBaseGalleries();
    for (const g of galleries) {
      let works: any[] = [];
      if (isKvConfigured()) {
        try {
          const raw = await kv.get(`miluarte:gallery:${g.slug}`);
          if (raw) works = typeof raw === "string" ? JSON.parse(raw) : raw;
        } catch {}
      }
      if (!works || works.length === 0) {
        works = WORKS_BY_SLUG[g.slug] || [];
      }
      for (const w of works) {
        if (w.img && typeof w.img === "string") urlsToHarvest.add(w.img);
      }
    }

    // B. Renders
    let renders: any[] = [];
    if (isKvConfigured()) {
      try {
        const raw = await kv.get("miluarte:renders");
        if (raw) renders = typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {}
    }
    if (!renders || renders.length === 0) {
      renders = RENDERS;
    }
    for (const r of renders) {
      if (r.img && typeof r.img === "string") urlsToHarvest.add(r.img);
      if (Array.isArray(r.process)) {
        for (const p of r.process) {
          if (p.img && typeof p.img === "string") urlsToHarvest.add(p.img);
        }
      }
    }

    // C. Textos (Hero, Slider, Servicios, CV, Sobre Mí)
    let texts: any = {};
    if (isKvConfigured()) {
      try {
        const raw = await kv.get("miluarte:texts");
        if (raw) texts = typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {}
    }
    if (texts.resumePhoto) urlsToHarvest.add(texts.resumePhoto);
    if (texts.aboutPhoto) urlsToHarvest.add(texts.aboutPhoto);
    if (texts.aboutMusaeImg) urlsToHarvest.add(texts.aboutMusaeImg);
    if (texts.heroImage) urlsToHarvest.add(texts.heroImage);
    if (texts.featuredImage) urlsToHarvest.add(texts.featuredImage);
    if (texts.sketchImg) urlsToHarvest.add(texts.sketchImg);
    if (texts.finalImg) urlsToHarvest.add(texts.finalImg);
    if (texts.servicesImages && typeof texts.servicesImages === "object") {
      for (const imgUrl of Object.values(texts.servicesImages)) {
        if (typeof imgUrl === "string") urlsToHarvest.add(imgUrl);
      }
    }
    if (Array.isArray(texts.animasSlides)) {
      for (const s of texts.animasSlides) {
        if (s.img) urlsToHarvest.add(s.img);
      }
    }

    // Convertir URLs recolectadas en assets
    for (const u of urlsToHarvest) {
      if (!u || !u.startsWith("http")) continue;
      if (!assetsMap.has(u)) {
        // Extraer publicId aproximado de la URL de Cloudinary
        let publicId = u;
        let folder = "portfolio";
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
    }
  } catch (e) {
    console.warn("Error al procesar imágenes de base de datos:", e);
  }

  const assetsList = Array.from(assetsMap.values());
  // Ordenar: primero las de cloudinary más recientes o por orden alfabético
  assetsList.sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.publicId.localeCompare(b.publicId);
  });

  return res.status(200).json(assetsList);
}
