import { kv } from "./_lib/kv";
import { extractTokenFromHeader, verifyToken } from "./_lib/auth";
import { GalleryMeta, Work, CmsBackup } from "../../src/app/types/cms";

function parseJsonSafe<T = any>(val: any, fallback: T): T {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
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

  // Verificar JWT
  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const [
      galleriesRaw,
      rendersRaw,
      textsRaw,
      socialRaw,
      changelogRaw,
      contactRaw,
      bookingRaw,
    ] = await Promise.all([
      kv.get("miluarte:galleries"),
      kv.get("miluarte:renders"),
      kv.get("miluarte:texts"),
      kv.get("miluarte:social"),
      kv.get("miluarte:changelog"),
      kv.get("miluarte:messages:contact"),
      kv.get("miluarte:messages:booking"),
    ]);

    const galleries: GalleryMeta[] = parseJsonSafe(galleriesRaw, []);
    const renders: any[] = parseJsonSafe(rendersRaw, []);
    const texts: any = parseJsonSafe(textsRaw, { es: {}, en: {} });
    const social: any = parseJsonSafe(socialRaw, {});
    const changelog: any[] = parseJsonSafe(changelogRaw, []);
    const contactMsgs: any[] = parseJsonSafe(contactRaw, []);
    const bookingMsgs: any[] = parseJsonSafe(bookingRaw, []);

    const works: Record<string, Work[]> = {};

    // Cargar obras de cada galería
    if (Array.isArray(galleries)) {
      await Promise.all(
        galleries.map(async (g) => {
          const rawWorks = await kv.get(`miluarte:gallery:${g.slug}`);
          works[g.slug] = parseJsonSafe(rawWorks, []);
        })
      );
    }

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
        contact: contactMsgs,
        booking: bookingMsgs,
      },
    };

    const filename = `miluarte-backup-${new Date().toISOString().slice(0, 10)}.json`;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).json(backup);
  } catch (error: any) {
    console.error("Error en export handler:", error);
    return res.status(500).json({ error: "Error al generar backup" });
  }
}
