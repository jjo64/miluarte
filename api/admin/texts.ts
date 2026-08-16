import { kv, isKvConfigured } from "./_lib/kv.js";
import { extractTokenFromHeader, verifyToken } from "./_lib/auth.js";
import { createPreSnapshot, recordChangelog } from "./_lib/changelog.js";
import { SiteTexts, translations } from "./_lib/initialData.js";

function deepMerge(target: any, source: any): any {
  if (typeof target !== "object" || target === null) return source;
  if (typeof source !== "object" || source === null) return target;

  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (!(key in target)) {
        Object.assign(output, { [key]: source[key] });
      } else {
        output[key] = deepMerge(target[key], source[key]);
      }
    } else {
      Object.assign(output, { [key]: source[key] });
    }
  }
  return output;
}

async function getTexts(): Promise<SiteTexts> {
  const defaultTexts: SiteTexts = {
    es: translations.es,
    en: translations.en,
  };

  if (isKvConfigured()) {
    try {
      const raw = await kv.get("miluarte:texts");
      if (raw) {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : (raw as any);
        if (parsed && (parsed.es || parsed.en)) {
          return {
            es: deepMerge(defaultTexts.es, parsed.es || {}),
            en: deepMerge(defaultTexts.en, parsed.en || {}),
          };
        }
      }
    } catch (e) {
      console.warn("KV get texts error, using default translations:", e);
    }
  }

  return defaultTexts;
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

  // 1. GET: Obtener todos los textos del sitio (ES + EN)
  if (req.method === "GET") {
    try {
      const texts = await getTexts();
      return res.status(200).json(texts);
    } catch (error: any) {
      console.warn("Falling back to default static translations on GET /api/admin/texts:", error);
      return res.status(200).json({
        es: translations.es,
        en: translations.en,
      });
    }
  }

  // 2. PUT: Actualizar textos
  if (req.method === "PUT") {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: "No autorizado" });
    }

    try {
      const updates = req.body || {};
      const currentTexts = await getTexts();

      // Capturar pre-snapshot ANTES de mutar
      const preSnapId = await createPreSnapshot();

      // Deep merge con los textos existentes para no sobrescribir claves no modificadas
      const merged = deepMerge(currentTexts, updates);

      if (isKvConfigured()) {
        await kv.set("miluarte:texts", JSON.stringify(merged));
      }

      await recordChangelog("Actualizó textos del sitio web (ES/EN)", "texts", preSnapId);

      return res.status(200).json(merged);
    } catch (error: any) {
      console.error("Error al guardar textos:", error);
      return res.status(500).json({ error: "Error al guardar textos del sitio" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
