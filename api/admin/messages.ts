import { kv, isKvConfigured } from "./_lib/kv";
import { extractTokenFromHeader, verifyToken } from "./_lib/auth";
import { addChangelogEntry } from "./_lib/changelog";
import { ContactMessage } from "../../src/app/types/cms";

async function getMessages(type: "contact" | "booking"): Promise<ContactMessage[]> {
  if (!isKvConfigured()) return [];

  try {
    const key = `miluarte:messages:${type}`;
    const raw = await kv.get(key);
    if (raw) {
      return typeof raw === "string" ? JSON.parse(raw) : (raw as any);
    }
  } catch (e) {
    console.warn(`Error al leer mensajes de ${type}:`, e);
  }
  return [];
}

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

  // Todas las operaciones de mensajes requieren autenticación de administrador
  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const type = (req.query?.type || req.body?.type || "contact") === "booking" ? "booking" : "contact";

  // 1. GET: Listar mensajes con filtros y orden temporal
  if (req.method === "GET") {
    try {
      const messages = await getMessages(type);
      messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Conteo de no leídos de ambos tipos
      const contactMsgs = await getMessages("contact");
      const bookingMsgs = await getMessages("booking");

      const unreadCount = {
        contact: contactMsgs.filter((m) => !m.read).length,
        booking: bookingMsgs.filter((m) => !m.read).length,
        total: contactMsgs.filter((m) => !m.read).length + bookingMsgs.filter((m) => !m.read).length,
      };

      return res.status(200).json({
        messages,
        unreadCount,
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Error al obtener mensajes" });
    }
  }

  // 2. PUT: Marcar como leído / no leído o marcar todos como leídos
  if (req.method === "PUT") {
    try {
      const { id, read = true, markAll = false } = req.body || {};
      let messages = await getMessages(type);

      if (markAll) {
        messages = messages.map((m) => ({ ...m, read: true }));
      } else if (id) {
        const index = messages.findIndex((m) => m.id === id);
        if (index !== -1) {
          messages[index].read = Boolean(read);
        }
      }

      if (isKvConfigured()) {
        await kv.set(`miluarte:messages:${type}`, JSON.stringify(messages));
      }

      return res.status(200).json({ success: true, messages });
    } catch (error: any) {
      console.error("Error al actualizar estado del mensaje:", error);
      return res.status(500).json({ error: "Error al actualizar mensaje" });
    }
  }

  // 3. DELETE: Eliminar mensaje
  if (req.method === "DELETE") {
    try {
      const id = req.query?.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ error: "ID de mensaje requerido" });
      }

      let messages = await getMessages(type);
      messages = messages.filter((m) => m.id !== id);

      if (isKvConfigured()) {
        await kv.set(`miluarte:messages:${type}`, JSON.stringify(messages));
      }

      await addChangelogEntry(`Eliminó un mensaje de la bandeja (${type})`, "messages");

      return res.status(200).json({ success: true, deletedId: id });
    } catch (error: any) {
      console.error("Error al eliminar mensaje:", error);
      return res.status(500).json({ error: "Error al eliminar mensaje" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
