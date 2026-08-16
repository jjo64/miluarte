import { kv, isKvConfigured } from "./_lib/kv";
import { extractTokenFromHeader, verifyToken } from "./_lib/auth";
import { ChangelogEntry } from "../../src/app/types/cms";

async function getChangelog(): Promise<ChangelogEntry[]> {
  if (isKvConfigured()) {
    try {
      const raw = await kv.get("miluarte:changelog");
      if (raw) {
        return typeof raw === "string" ? JSON.parse(raw) : (raw as any);
      }
    } catch (e) {
      console.warn("KV get changelog error, using fallback:", e);
    }
  }

  // Fallback
  return [
    {
      id: "init-1",
      timestamp: new Date().toISOString(),
      action: "Sistema CMS inicializado y configurado correctamente",
      section: "system",
    },
  ];
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

  // Requiere autenticación
  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const entries = await getChangelog();
    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return res.status(200).json(entries);
  } catch (error: any) {
    return res.status(500).json({ error: "Error al obtener historial de cambios" });
  }
}
