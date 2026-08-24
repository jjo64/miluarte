import { kv, isKvConfigured } from "../_lib/kv.js";
import { extractTokenFromHeader, verifyToken } from "../_lib/auth.js";
import { addChangelogEntry } from "../_lib/changelog.js";
import { ContactMessage } from "../_lib/initialData.js";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,DELETE,OPTIONS");
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

  const type = req.query?.type === "booking" ? "booking" : "contact";
  const kvKey = `miluarte:messages:${type}`;

  // 1. GET: Listar mensajes
  if (req.method === "GET") {
    try {
      if (isKvConfigured()) {
        const raw = await kv.get(kvKey);
        let messages: ContactMessage[] = [];
        if (raw) {
          messages = typeof raw === "string" ? JSON.parse(raw) : (raw as any);
        }
        return res.status(200).json(messages);
      }
      return res.status(200).json([]);
    } catch (error: any) {
      return res.status(500).json({ error: "Error al obtener mensajes" });
    }
  }

  // 2. PUT: Marcar como leído o actualizar
  if (req.method === "PUT") {
    try {
      const { id, read, all } = req.body || {};

      if (isKvConfigured()) {
        const raw = await kv.get(kvKey);
        let messages: ContactMessage[] = raw ? (typeof raw === "string" ? JSON.parse(raw) : (raw as any)) : [];

        if (all) {
          // Marcar todos como leídos
          messages = messages.map((m) => ({ ...m, read: true }));
        } else if (id) {
          const idx = messages.findIndex((m) => m.id === id);
          if (idx !== -1) {
            messages[idx].read = read !== undefined ? Boolean(read) : true;
          }
        }

        await kv.set(kvKey, JSON.stringify(messages));
        return res.status(200).json(messages);
      }
      return res.status(200).json([]);
    } catch (error: any) {
      return res.status(500).json({ error: "Error al actualizar mensaje" });
    }
  }

  // 3. DELETE: Eliminar mensaje
  if (req.method === "DELETE") {
    try {
      const id = req.query?.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ error: "ID de mensaje requerido para eliminar" });
      }

      if (isKvConfigured()) {
        const raw = await kv.get(kvKey);
        let messages: ContactMessage[] = raw ? (typeof raw === "string" ? JSON.parse(raw) : (raw as any)) : [];
        messages = messages.filter((m) => m.id !== id);
        await kv.set(kvKey, JSON.stringify(messages));
      }

      return res.status(200).json({ success: true, deletedId: id });
    } catch (error: any) {
      return res.status(500).json({ error: "Error al eliminar mensaje" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
