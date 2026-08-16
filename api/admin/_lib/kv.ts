import { createClient } from "@vercel/kv";

// Si las variables de entorno están presentes, inicializa KV.
// También soporta fallback a variables genéricas de Upstash Redis si se usa la integración directa.
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const kv = createClient({
  url: url || "",
  token: token || "",
});

export function isKvConfigured(): boolean {
  return Boolean(url && token);
}
