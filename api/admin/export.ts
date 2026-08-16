import { kv } from "./_lib/kv.js";
import { extractTokenFromHeader, verifyToken } from "./_lib/auth.js";
import { GalleryMeta, Work, CmsBackup, META, WORKS_BY_SLUG, RENDERS, translations, getBaseGalleries } from "./_lib/initialData.js";

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

  try {
    // 1. Obtener galerías (KV con fallback estático)
    const rawGalleries = await kv.get("miluarte:galleries");
    let galleries: GalleryMeta[] = [];
    if (rawGalleries) {
      galleries = typeof rawGalleries === "string" ? JSON.parse(rawGalleries) : (rawGalleries as any);
    }
    if (!galleries || galleries.length === 0) {
      galleries = getBaseGalleries();
    }

    // 2. Obtener obras de cada galería (KV con fallback estático)
    const works: Record<string, Work[]> = {};
    for (const g of galleries) {
      const rawWorks = await kv.get(`miluarte:gallery:${g.slug}`);
      if (rawWorks) {
        works[g.slug] = typeof rawWorks === "string" ? JSON.parse(rawWorks) : (rawWorks as any);
      } else {
        works[g.slug] = (WORKS_BY_SLUG[g.slug] || []).map((w, i) => ({ ...w, order: i }));
      }
    }

    // 3. Obtener renders 3D (KV con fallback estático)
    const rawRenders = await kv.get("miluarte:renders");
    let renders = [];
    if (rawRenders) {
      renders = typeof rawRenders === "string" ? JSON.parse(rawRenders) : (rawRenders as any);
    }
    if (!renders || renders.length === 0) {
      renders = RENDERS.map((r, i) => ({ ...r, order: i }));
    }

    // 4. Obtener textos (KV con fallback estático)
    const rawTexts = await kv.get("miluarte:texts");
    let texts = { es: translations.es, en: translations.en };
    if (rawTexts) {
      texts = typeof rawTexts === "string" ? JSON.parse(rawTexts) : (rawTexts as any);
    }

    // 5. Obtener redes sociales (KV con fallback estático)
    const rawSocial = await kv.get("miluarte:social");
    let social = {
      instagram: "https://www.instagram.com/naraneko13/",
      linkedin: "https://www.linkedin.com/in/nerealucaspajares4815162342/",
      behance: "",
      tiktok: "",
      twitter: "",
    };
    if (rawSocial) {
      social = typeof rawSocial === "string" ? JSON.parse(rawSocial) : (rawSocial as any);
    }

    // 6. Obtener mensajes (bandeja)
    const rawContact = await kv.get("miluarte:messages:contact");
    const contactMessages = rawContact ? (typeof rawContact === "string" ? JSON.parse(rawContact) : rawContact) : [];
    
    const rawBooking = await kv.get("miluarte:messages:booking");
    const bookingMessages = rawBooking ? (typeof rawBooking === "string" ? JSON.parse(rawBooking) : rawBooking) : [];

    // 7. Obtener changelog
    const rawChangelog = await kv.get("miluarte:changelog");
    const changelog = rawChangelog ? (typeof rawChangelog === "string" ? JSON.parse(rawChangelog) : rawChangelog) : [];

    // Construir el snapshot completo
    const backup: CmsBackup = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      galleries,
      works,
      renders,
      texts,
      social,
      changelog,
      messages: {
        contact: contactMessages,
        booking: bookingMessages,
      },
    };

    // Devolver como archivo descargable
    const filename = `miluarte-backup-${new Date().toISOString().split("T")[0]}.json`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(backup, null, 2));
  } catch (error: any) {
    console.error("Error al generar exportación:", error);
    return res.status(500).json({ error: "Error al generar backup completo del sistema" });
  }
}
