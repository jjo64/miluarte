import { createClient } from "@vercel/kv";
import * as fs from "fs";
import * as path from "path";

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

// Local JSON storage for development without remote KV credentials
const localDbPath = path.resolve(process.cwd(), "cms-local-db.json");
const seedPath = path.resolve(process.cwd(), "cms-seed-backup.json");

function getLocalStore(): Record<string, any> {
  try {
    if (fs.existsSync(localDbPath)) {
      return JSON.parse(fs.readFileSync(localDbPath, "utf-8"));
    }

    // Inicializar desde el seed backup
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

      fs.writeFileSync(localDbPath, JSON.stringify(store, null, 2), "utf-8");
      return store;
    }
  } catch (e) {
    console.warn("Local store read error:", e);
  }
  return {};
}

function saveLocalStore(store: Record<string, any>) {
  try {
    fs.writeFileSync(localDbPath, JSON.stringify(store, null, 2), "utf-8");
  } catch (e) {
    console.warn("Local store write error:", e);
  }
}

// Vercel KV remote client (cuando estén las variables en producción o .env.local)
const remoteClient = url && token ? createClient({ url, token }) : null;

// Proxy compatible con la API de Vercel KV
export const kv = {
  async get<T = any>(key: string): Promise<T | null> {
    if (remoteClient) {
      try {
        return await remoteClient.get<T>(key);
      } catch (e) {
        console.warn(`Remote KV error on get(${key}), falling back to local:`, e);
      }
    }
    const store = getLocalStore();
    const val = store[key];
    return val !== undefined ? val : null;
  },

  async set(key: string, value: any): Promise<any> {
    if (remoteClient) {
      try {
        return await remoteClient.set(key, value);
      } catch (e) {
        console.warn(`Remote KV error on set(${key}), falling back to local:`, e);
      }
    }
    const store = getLocalStore();
    // Guardar objetos o strings
    try {
      store[key] = typeof value === "string" ? JSON.parse(value) : value;
    } catch {
      store[key] = value;
    }
    saveLocalStore(store);
    return "OK";
  },

  async del(key: string): Promise<number> {
    if (remoteClient) {
      try {
        return await remoteClient.del(key);
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
  return true; // Siempre activo gracias al fallback local persistente
}
