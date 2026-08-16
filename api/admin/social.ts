import { kv, isKvConfigured } from "./_lib/kv.js";
import { extractTokenFromHeader, verifyToken } from "./_lib/auth.js";
import { createPreSnapshot, recordChangelog } from "./_lib/changelog.js";
import { SocialLinks } from "../../src/app/types/cms";

async function getSocialLinks(): Promise<SocialLinks> {
  if (isKvConfigured()) {
    try {
      const raw = await kv.get("miluarte:social");
      if (raw) {
        return typeof raw === "string" ? JSON.parse(raw) : (raw as any);
      }
    } catch (e) {
      console.warn("KV get social error, using fallback:", e);
    }
  }

  // Fallback
  return {
    instagram: "https://www.instagram.com/naraneko13/",
    linkedin: "https://www.linkedin.com/in/nerealucaspajares4815162342/",
    behance: "",
    tiktok: "",
    twitter: "",
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 1. GET: Enlaces de redes sociales (público para el footer y admin)
  if (req.method === "GET") {
    try {
      const social = await getSocialLinks();
      return res.status(200).json(social);
    } catch (error: any) {
      return res.status(500).json({ error: "Error al obtener redes sociales" });
    }
  }

  // 2. PUT: Actualizar redes sociales
  if (req.method === "PUT") {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: "No autorizado" });
    }

    try {
      const current = await getSocialLinks();
      const preSnapId = await createPreSnapshot();

      const updated: SocialLinks = {
        ...current,
        ...(req.body || {}),
      };

      if (isKvConfigured()) {
        await kv.set("miluarte:social", JSON.stringify(updated));
      }

      await recordChangelog("Actualizó los enlaces de redes sociales", "social", preSnapId);

      return res.status(200).json(updated);
    } catch (error: any) {
      console.error("Error al actualizar redes:", error);
      return res.status(500).json({ error: "Error al actualizar redes sociales" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
