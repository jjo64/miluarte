import { kv, isKvConfigured } from "./_lib/kv.js";
import { extractTokenFromHeader, verifyToken } from "./_lib/auth.js";
import { rollbackToSnapshot, addChangelogEntry } from "./_lib/changelog.js";
import { ChangelogEntry } from "./_lib/initialData.js";

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
      canRollback: false,
    },
  ];
}

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

  // 1. GET: Obtener historial
  if (req.method === "GET") {
    try {
      const entries = await getChangelog();
      entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return res.status(200).json(entries);
    } catch (error: any) {
      return res.status(500).json({ error: "Error al obtener historial de cambios" });
    }
  }

  // 2. POST: Revertir al snapshot especificado (Rollback)
  if (req.method === "POST") {
    try {
      const { snapshotId, entryTitle } = req.body || {};

      if (!snapshotId) {
        return res.status(400).json({ error: "ID de snapshot requerido para restaurar" });
      }

      const success = await rollbackToSnapshot(snapshotId);

      if (!success) {
        return res.status(404).json({
          error: "No se encontró el punto de restauración o no se pudo revertir.",
        });
      }

      // Registrar la acción de restauración en el changelog
      await addChangelogEntry(
        `Restauró la página al punto anterior: "${entryTitle || snapshotId}"`,
        "system"
      );

      return res.status(200).json({
        success: true,
        message: "Página restaurada exitosamente a la versión seleccionada",
      });
    } catch (error: any) {
      console.error("Error en rollback handler:", error);
      return res.status(500).json({ error: "Error al revertir a la versión seleccionada" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
