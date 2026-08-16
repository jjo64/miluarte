import { createClient } from "@vercel/kv";
import * as fs from "fs";
import * as path from "path";

// Memoria global compartida durante el ciclo de vida del contenedor serverless
declare global {
  var __CMS_MEMORY_STORE__: Record<string, any> | undefined;
}

if (!globalThis.__CMS_MEMORY_STORE__) {
  globalThis.__CMS_MEMORY_STORE__ = {};
}

// Rutas seguras para local y /tmp en Serverless
const isVercelServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const localDbPath = isVercelServerless
  ? path.resolve("/tmp", "cms-local-db.json")
  : path.resolve(process.cwd(), "cms-local-db.json");

const seedPath = path.resolve(process.cwd(), "cms-seed-backup.json");

function getLocalStore(): Record<string, any> {
  // 1. Intentar memoria RAM primero
  const mem = globalThis.__CMS_MEMORY_STORE__ || {};
  if (Object.keys(mem).length > 0) {
    return mem;
  }

  // 2. Intentar leer de archivo local
  try {
    if (fs.existsSync(localDbPath)) {
      const data = JSON.parse(fs.readFileSync(localDbPath, "utf-8"));
      globalThis.__CMS_MEMORY_STORE__ = data;
      return data;
    }
  } catch (e) {
    // Ignorar si no se puede leer el archivo
  }

  // 3. Inicializar desde el seed backup si existe
  try {
    if (fs.existsSync(seedPath)) {
      const seed = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
      const store: Record<string, any> = {
        "miluarte:galleries": seed.galleries || [],
        "miluarte:renders": seed.renders || [],
        "miluarte:texts": seed.texts || { es: {}, en: {} },
        "miluarte:social": seed.social || {},
        "miluarte:changelog": seed.changelog || [],
        "miluarte:messages:contact": seed.messages?.contact || [],
        "miluarte:messages:booking": seed.messages?.booking || [],
      };

      if (seed.works) {
        for (const [slug, works] of Object.entries(seed.works)) {
          store[`miluarte:gallery:${slug}`] = works;
        }
      }

      globalThis.__CMS_MEMORY_STORE__ = store;

      try {
        fs.writeFileSync(localDbPath, JSON.stringify(store, null, 2), "utf-8");
      } catch {
        // Ignorar si filesystem es read-only
      }

      return store;
    }
  } catch (e) {
    // Ignorar
  }

  return globalThis.__CMS_MEMORY_STORE__ || {};
}

function saveLocalStore(store: Record<string, any>) {
  globalThis.__CMS_MEMORY_STORE__ = store;
  try {
    fs.writeFileSync(localDbPath, JSON.stringify(store, null, 2), "utf-8");
  } catch {
    // En Vercel Serverless `/tmp` suele ser escribible, pero si falla no crashea
  }
}

let cachedRemoteClient: any = null;
let lastUrl: string | undefined = undefined;
let lastToken: string | undefined = undefined;

function getRemoteClient() {
  const url =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.STORAGE_KV_REST_API_URL;
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.STORAGE_KV_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  if (cachedRemoteClient && lastUrl === url && lastToken === token) {
    return cachedRemoteClient;
  }

  try {
    cachedRemoteClient = createClient({ url, token });
    lastUrl = url;
    lastToken = token;
    return cachedRemoteClient;
  } catch (e) {
    console.warn("Error initializing remote KV client:", e);
    return null;
  }
}

// Proxy compatible con la API de Vercel KV
export const kv = {
  async get<T = any>(key: string): Promise<T | null> {
    const remoteClient = getRemoteClient();
    if (remoteClient) {
      try {
        const res: any = await remoteClient.get(key);
        if (res !== null && res !== undefined) {
          return typeof res === "string" ? JSON.parse(res) : res;
        }
      } catch (e) {
        console.warn(`Remote KV error on get(${key}), falling back to local:`, e);
      }
    }
    const store = getLocalStore();
    const val = store[key];
    return val !== undefined ? val : null;
  },

  async set(key: string, value: any): Promise<any> {
    const stringified = typeof value === "string" ? value : JSON.stringify(value);
    const remoteClient = getRemoteClient();
    if (remoteClient) {
      try {
        await remoteClient.set(key, stringified);
      } catch (e) {
        console.warn(`Remote KV error on set(${key}), falling back to local:`, e);
      }
    }
    const store = getLocalStore();
    try {
      store[key] = typeof value === "string" ? JSON.parse(value) : value;
    } catch {
      store[key] = value;
    }
    saveLocalStore(store);
    return "OK";
  },

  async del(key: string): Promise<number> {
    const remoteClient = getRemoteClient();
    if (remoteClient) {
      try {
        await remoteClient.del(key);
      } catch (e) {
        console.warn(`Remote KV error on del(${key}), falling back to local:`, e);
      }
    }
    const store = getLocalStore();
    if (key in store) {
      delete store[key];
      saveLocalStore(store);
      return 1;
    }
    return 0;
  },

  async incr(key: string): Promise<number> {
    const remoteClient = getRemoteClient();
    if (remoteClient) {
      try {
        return await remoteClient.incr(key);
      } catch (e) {
        // fallback
      }
    }
    const store = getLocalStore();
    const current = Number(store[key] || 0) + 1;
    store[key] = current;
    saveLocalStore(store);
    return current;
  },

  async expire(key: string, seconds: number): Promise<number> {
    const remoteClient = getRemoteClient();
    if (remoteClient) {
      try {
        return await remoteClient.expire(key, seconds);
      } catch (e) {
        // fallback
      }
    }
    return 1;
  },
};

export function isKvConfigured(): boolean {
  return true; // Siempre activo gracias al fallback local/memoria y KV remoto
}
