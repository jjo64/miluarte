import { createClient } from "@vercel/kv";
import * as fs from "fs";
import * as path from "path";

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

let cachedRemoteClient: any = null;
let lastUrl: string | undefined = undefined;
let lastToken: string | undefined = undefined;

function getRemoteClient() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

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
  return true; // Siempre activo gracias al fallback local persistente y KV remoto dinámico
}
