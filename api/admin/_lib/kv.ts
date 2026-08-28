import { createClient } from "@vercel/kv";
import * as fs from "fs";
import * as path from "path";
import { getBaseGalleries, WORKS_BY_SLUG, DEFAULT_SOCIAL_LINKS } from "./initialData.js";

// Memoria global compartida durante el ciclo de vida del contenedor serverless
declare global {
  var __CMS_MEMORY_STORE__: Record<string, any> | undefined;
}

if (!globalThis.__CMS_MEMORY_STORE__) {
  globalThis.__CMS_MEMORY_STORE__ = {};
}

// Rutas seguras para local y /tmp en Serverless
const isVercelServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const tmpDbPath = path.resolve("/tmp", "cms-local-db.json");
const bundledDbPath = path.resolve(process.cwd(), "cms-local-db.json");
const seedPath = path.resolve(process.cwd(), "cms-seed-backup.json");

function getLocalStore(): Record<string, any> {
  // 1. En Serverless, si ya tenemos datos en memoria RAM, usarlos
  const mem = globalThis.__CMS_MEMORY_STORE__ || {};
  if (Object.keys(mem).length > 0) {
    return mem;
  }

  // 2. Intentar leer de /tmp en serverless si ya se escribió antes
  try {
    if (isVercelServerless && fs.existsSync(tmpDbPath)) {
      const data = JSON.parse(fs.readFileSync(tmpDbPath, "utf-8"));
      if (data && Object.keys(data).length > 0) {
        globalThis.__CMS_MEMORY_STORE__ = data;
        return data;
      }
    }
  } catch {}

  // 3. Leer de cms-local-db.json empaquetado en el despliegue
  try {
    if (fs.existsSync(bundledDbPath)) {
      const data = JSON.parse(fs.readFileSync(bundledDbPath, "utf-8"));
      if (data && Object.keys(data).length > 0) {
        globalThis.__CMS_MEMORY_STORE__ = data;
        return data;
      }
    }
  } catch {}

  // 4. Leer de cms-seed-backup.json
  try {
    if (fs.existsSync(seedPath)) {
      const data = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
      if (data && Object.keys(data).length > 0) {
        const store: Record<string, any> = { ...data };
        if (data.galleries) store["miluarte:galleries"] = data.galleries;
        if (data.renders) store["miluarte:renders"] = data.renders;
        if (data.texts) store["miluarte:texts"] = data.texts;
        if (data.social) store["miluarte:social"] = data.social;
        if (data.works) {
          for (const [slug, works] of Object.entries(data.works)) {
            store[`miluarte:gallery:${slug}`] = works;
          }
        }
        globalThis.__CMS_MEMORY_STORE__ = store;
        return store;
      }
    }
  } catch {}

  // 5. Fallback final usando initialData
  const fallbackStore: Record<string, any> = {
    "miluarte:galleries": getBaseGalleries(),
    "miluarte:renders": [],
    "miluarte:texts": { es: {}, en: {} },
    "miluarte:social": DEFAULT_SOCIAL_LINKS,
    "miluarte:changelog": [],
    "miluarte:messages:contact": [],
    "miluarte:messages:booking": [],
  };
  for (const [slug, works] of Object.entries(WORKS_BY_SLUG)) {
    fallbackStore[`miluarte:gallery:${slug}`] = works;
  }

  globalThis.__CMS_MEMORY_STORE__ = fallbackStore;
  return fallbackStore;
}

function saveLocalStore(store: Record<string, any>) {
  globalThis.__CMS_MEMORY_STORE__ = store;
  const targetPath = isVercelServerless ? tmpDbPath : bundledDbPath;
  try {
    fs.writeFileSync(targetPath, JSON.stringify(store, null, 2), "utf-8");
  } catch (e) {
    // Si falla el filesystem en serverless, la memoria RAM retiene el estado
  }
}

let cachedRemoteClient: any = null;
let lastUrl: string | null = null;
let lastToken: string | null = null;

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
    return (store[key] as T) ?? null;
  },

  async set(key: string, value: any): Promise<string | null> {
    const remoteClient = getRemoteClient();
    if (remoteClient) {
      try {
        const payload = typeof value === "string" ? value : JSON.stringify(value);
        await remoteClient.set(key, payload);
      } catch (e) {
        console.warn(`Remote KV error on set(${key}), saving to local:`, e);
      }
    }

    const store = getLocalStore();
    store[key] = value;
    saveLocalStore(store);
    return "OK";
  },

  async del(key: string): Promise<number> {
    const remoteClient = getRemoteClient();
    if (remoteClient) {
      try {
        await remoteClient.del(key);
      } catch (e) {
        console.warn(`Remote KV error on del(${key}), deleting from local:`, e);
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

export function isRemoteKvConfigured(): boolean {
  const url =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.STORAGE_KV_REST_API_URL;
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.STORAGE_KV_REST_API_TOKEN;
  return Boolean(url && token);
}

export function isKvConfigured(): boolean {
  // El sistema de almacenamiento KV (remoto o local vía cms-local-db.json) siempre está activo
  return true;
}
