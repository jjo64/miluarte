import { kv, isKvConfigured } from "../_lib/kv.js";
import { extractTokenFromHeader, verifyToken } from "../_lib/auth.js";
import { recordChangelog, createPreSnapshot } from "../_lib/changelog.js";
import { Work, GalleryMeta } from "../_lib/initialData.js";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "doznr2qm4";
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Requiere autenticación
  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const authHeader = `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64")}`;

    // 1. Escanear todos los recursos de Cloudinary en miluarte/
    const allResources: any[] = [];
    let nextCursor: string | null = null;

    do {
      const cursorParam = nextCursor ? `&next_cursor=${nextCursor}` : "";
      const cldRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image?type=upload&prefix=miluarte/&max_results=500${cursorParam}`,
        { headers: { Authorization: authHeader } }
      );
      const cldData = await cldRes.json();
      if (cldData.resources && Array.isArray(cldData.resources)) {
        allResources.push(...cldData.resources);
      }
      nextCursor = cldData.next_cursor || null;
    } while (nextCursor);

    // Mapa de recursos por nombre base y public_id
    const assetMap: Record<string, string> = {};
    for (const r of allResources) {
      const parts = r.public_id.split("/");
      const basename = parts[parts.length - 1];
      const url = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${r.public_id}.${r.format}`;
      assetMap[basename] = url;
      assetMap[r.public_id] = url;
    }

    const preSnap = await createPreSnapshot();
    let updatedWorksCount = 0;
    let updatedGalleriesCount = 0;

    // 2. Sincronizar obras de cada galería
    const gallerySlugs = ["musae", "diggin", "animas", "retratos", "pasta-ya", "concept-art", "diseno-grafico", "3d-stands"];

    for (const slug of gallerySlugs) {
      const worksRaw = await kv.get(`miluarte:gallery:${slug}`);
      if (worksRaw) {
        const works: Work[] = typeof worksRaw === "string" ? JSON.parse(worksRaw) : worksRaw;
        if (Array.isArray(works)) {
          let modified = false;
          const updatedWorks = works.map((w) => {
            const currentImg = w.img || "";
            const match = currentImg.match(/([a-zA-Z0-9_\-%]+)\.(jpg|png|webp|jpeg)/i);
            if (match) {
              const basename = decodeURIComponent(match[1]);
              const correctUrl = assetMap[basename] || assetMap[match[1]];
              if (correctUrl && correctUrl !== currentImg) {
                modified = true;
                updatedWorksCount++;
                return { ...w, img: correctUrl };
              }
            }
            return w;
          });

          if (modified) {
            await kv.set(`miluarte:gallery:${slug}`, updatedWorks);
          }
        }
      }
    }

    // 3. Sincronizar portadas de galerías
    const galleriesRaw = await kv.get("miluarte:galleries");
    if (galleriesRaw) {
      const galleries: GalleryMeta[] = typeof galleriesRaw === "string" ? JSON.parse(galleriesRaw) : galleriesRaw;
      if (Array.isArray(galleries)) {
        let gModified = false;
        const updatedGalleries = galleries.map((g) => {
          if (g.coverImage) {
            const match = g.coverImage.match(/([a-zA-Z0-9_\-%]+)\.(jpg|png|webp|jpeg)/i);
            if (match) {
              const basename = decodeURIComponent(match[1]);
              const correctUrl = assetMap[basename] || assetMap[match[1]];
              if (correctUrl && correctUrl !== g.coverImage) {
                gModified = true;
                updatedGalleriesCount++;
                return { ...g, coverImage: correctUrl };
              }
            }
          }
          return g;
        });

        if (gModified) {
          await kv.set("miluarte:galleries", updatedGalleries);
        }
      }
    }

    await recordChangelog(
      `Sincronización manual con Cloudinary completada (${allResources.length} assets escaneados)`,
      "system",
      preSnap
    );

    return res.status(200).json({
      success: true,
      totalAssetsFound: allResources.length,
      updatedWorks: updatedWorksCount,
      updatedGalleries: updatedGalleriesCount,
      message: `Sincronización exitosa con Cloudinary (${allResources.length} archivos verificados).`,
    });
  } catch (error: any) {
    console.error("Error en sincronización con Cloudinary:", error);
    return res.status(500).json({ error: "Error al sincronizar con Cloudinary: " + error.message });
  }
}
