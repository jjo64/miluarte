import { kv, isKvConfigured } from "./kv";
import { ChangelogEntry } from "../../../src/app/types/cms";
import { nanoid } from "nanoid";

export async function addChangelogEntry(
  action: string,
  section: ChangelogEntry["section"]
): Promise<string | null> {
  if (!isKvConfigured()) return null;

  try {
    const snapshotId = `snap-${Date.now()}-${nanoid(4)}`;

    // 1. Capturar snapshot del estado actual antes del cambio (para permitir rollback)
    try {
      const [galleries, renders, texts, social] = await Promise.all([
        kv.get("miluarte:galleries"),
        kv.get("miluarte:renders"),
        kv.get("miluarte:texts"),
        kv.get("miluarte:social"),
      ]);

      const snapshotData: Record<string, any> = {
        galleries,
        renders,
        texts,
        social,
        works: {},
      };

      if (galleries) {
        const galleriesArr = typeof galleries === "string" ? JSON.parse(galleries) : (galleries as any);
        if (Array.isArray(galleriesArr)) {
          await Promise.all(
            galleriesArr.map(async (g: any) => {
              snapshotData.works[g.slug] = await kv.get(`miluarte:gallery:${g.slug}`);
            })
          );
        }
      }

      // Guardar snapshot en KV
      await kv.set(`miluarte:snapshot:${snapshotId}`, JSON.stringify(snapshotData));
    } catch (snapErr) {
      console.warn("No se pudo capturar snapshot de seguridad:", snapErr);
    }

    // 2. Registrar en el changelog
    const raw = await kv.get("miluarte:changelog");
    let entries: ChangelogEntry[] = [];
    if (typeof raw === "string") {
      entries = JSON.parse(raw || "[]");
    } else if (Array.isArray(raw)) {
      entries = raw as any;
    }

    const newEntry: ChangelogEntry = {
      id: nanoid(),
      timestamp: new Date().toISOString(),
      action,
      section,
      snapshotId,
      canRollback: true,
    };

    entries.unshift(newEntry);
    if (entries.length > 50) {
      entries = entries.slice(0, 50);
    }

    await kv.set("miluarte:changelog", JSON.stringify(entries));
    return snapshotId;
  } catch (error) {
    console.error("Error al registrar en changelog:", error);
    return null;
  }
}

export async function rollbackToSnapshot(snapshotId: string): Promise<boolean> {
  if (!isKvConfigured()) return false;

  try {
    const rawSnapshot = await kv.get(`miluarte:snapshot:${snapshotId}`);
    if (!rawSnapshot) return false;

    const snapshot = typeof rawSnapshot === "string" ? JSON.parse(rawSnapshot) : rawSnapshot;

    // Obtener galerías actuales para limpiar las que se hayan creado con posterioridad
    const currentGalleriesRaw = await kv.get("miluarte:galleries");
    const currentGalleries = Array.isArray(currentGalleriesRaw)
      ? currentGalleriesRaw
      : typeof currentGalleriesRaw === "string"
      ? JSON.parse(currentGalleriesRaw || "[]")
      : [];

    const snapshotGalleries = Array.isArray(snapshot.galleries)
      ? snapshot.galleries
      : typeof snapshot.galleries === "string"
      ? JSON.parse(snapshot.galleries || "[]")
      : [];

    const snapshotSlugs = new Set(snapshotGalleries.map((g: any) => g.slug));

    // Eliminar claves de galerías creadas después
    for (const g of currentGalleries) {
      if (!snapshotSlugs.has(g.slug)) {
        await kv.del(`miluarte:gallery:${g.slug}`);
      }
    }

    // Restaurar colecciones principales
    if (snapshot.galleries) {
      await kv.set("miluarte:galleries", typeof snapshot.galleries === "string" ? snapshot.galleries : JSON.stringify(snapshot.galleries));
    }
    if (snapshot.renders) {
      await kv.set("miluarte:renders", typeof snapshot.renders === "string" ? snapshot.renders : JSON.stringify(snapshot.renders));
    }
    if (snapshot.texts) {
      await kv.set("miluarte:texts", typeof snapshot.texts === "string" ? snapshot.texts : JSON.stringify(snapshot.texts));
    }
    if (snapshot.social) {
      await kv.set("miluarte:social", typeof snapshot.social === "string" ? snapshot.social : JSON.stringify(snapshot.social));
    }

    // Restaurar obras por galería del snapshot
    if (snapshot.works) {
      for (const [slug, worksData] of Object.entries(snapshot.works)) {
        if (worksData) {
          await kv.set(`miluarte:gallery:${slug}`, typeof worksData === "string" ? worksData : JSON.stringify(worksData));
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error al revertir snapshot:", error);
    return false;
  }
}
