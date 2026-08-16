import { kv, isKvConfigured } from "./kv";
import { ChangelogEntry } from "../../../src/app/types/cms";
import { nanoid } from "nanoid";

/**
 * Crea un snapshot del estado actual EXACTO del sistema antes de aplicar cualquier mutación.
 */
export async function createPreSnapshot(): Promise<string | null> {
  if (!isKvConfigured()) return null;

  try {
    const snapshotId = `snap-${Date.now()}-${nanoid(4)}`;

    const [galleriesRaw, rendersRaw, textsRaw, socialRaw] = await Promise.all([
      kv.get("miluarte:galleries"),
      kv.get("miluarte:renders"),
      kv.get("miluarte:texts"),
      kv.get("miluarte:social"),
    ]);

    const snapshotData: Record<string, any> = {
      galleries: galleriesRaw,
      renders: rendersRaw,
      texts: textsRaw,
      social: socialRaw,
      works: {},
    };

    if (galleriesRaw) {
      const galleriesArr = typeof galleriesRaw === "string" ? JSON.parse(galleriesRaw) : galleriesRaw;
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
    return snapshotId;
  } catch (snapErr) {
    console.warn("No se pudo capturar pre-snapshot de seguridad:", snapErr);
    return null;
  }
}

/**
 * Registra una acción en el changelog vinculándola al pre-snapshot capturado antes del cambio.
 */
export async function recordChangelog(
  action: string,
  section: ChangelogEntry["section"],
  snapshotId: string | null
): Promise<void> {
  if (!isKvConfigured()) return;

  try {
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
      snapshotId: snapshotId || undefined,
      canRollback: Boolean(snapshotId),
    };

    entries.unshift(newEntry);
    if (entries.length > 50) {
      entries = entries.slice(0, 50);
    }

    await kv.set("miluarte:changelog", JSON.stringify(entries));
  } catch (error) {
    console.error("Error al registrar en changelog:", error);
  }
}

// Mantener compatibilidad con llamadas directas
export async function addChangelogEntry(
  action: string,
  section: ChangelogEntry["section"]
): Promise<string | null> {
  const snapshotId = await createPreSnapshot();
  await recordChangelog(action, section, snapshotId);
  return snapshotId;
}

/**
 * Revierte el estado del sitio completo exactamente a como estaba en el snapshotId.
 */
export async function rollbackToSnapshot(snapshotId: string): Promise<boolean> {
  if (!isKvConfigured()) return false;

  try {
    const rawSnapshot = await kv.get(`miluarte:snapshot:${snapshotId}`);
    if (!rawSnapshot) return false;

    const snapshot = typeof rawSnapshot === "string" ? JSON.parse(rawSnapshot) : rawSnapshot;

    // 1. Obtener galerías actuales para eliminar las creadas después
    const currentGalleriesRaw = await kv.get("miluarte:galleries");
    const currentGalleries: any[] = Array.isArray(currentGalleriesRaw)
      ? currentGalleriesRaw
      : typeof currentGalleriesRaw === "string"
      ? JSON.parse(currentGalleriesRaw || "[]")
      : [];

    const snapshotGalleries: any[] = Array.isArray(snapshot.galleries)
      ? snapshot.galleries
      : typeof snapshot.galleries === "string"
      ? JSON.parse(snapshot.galleries || "[]")
      : [];

    const snapshotSlugs = new Set(snapshotGalleries.map((g: any) => g.slug));

    // 2. Borrar claves de obras de galerías que no existían en este snapshot
    for (const g of currentGalleries) {
      if (!snapshotSlugs.has(g.slug)) {
        await kv.del(`miluarte:gallery:${g.slug}`);
      }
    }

    // 3. Restaurar galerías
    await kv.set("miluarte:galleries", JSON.stringify(snapshotGalleries));

    // 4. Restaurar obras por galería
    if (snapshot.works) {
      for (const [slug, worksData] of Object.entries(snapshot.works)) {
        const worksArr = Array.isArray(worksData)
          ? worksData
          : typeof worksData === "string"
          ? JSON.parse(worksData || "[]")
          : [];
        await kv.set(`miluarte:gallery:${slug}`, JSON.stringify(worksArr));
      }
    }

    // 5. Restaurar renders 3D
    if (snapshot.renders) {
      const rendersArr = Array.isArray(snapshot.renders)
        ? snapshot.renders
        : typeof snapshot.renders === "string"
        ? JSON.parse(snapshot.renders || "[]")
        : snapshot.renders;
      await kv.set("miluarte:renders", JSON.stringify(rendersArr));
    }

    // 6. Restaurar textos
    if (snapshot.texts) {
      const textsObj = typeof snapshot.texts === "string" ? JSON.parse(snapshot.texts) : snapshot.texts;
      await kv.set("miluarte:texts", JSON.stringify(textsObj));
    }

    // 7. Restaurar redes sociales
    if (snapshot.social) {
      const socialObj = typeof snapshot.social === "string" ? JSON.parse(snapshot.social) : snapshot.social;
      await kv.set("miluarte:social", JSON.stringify(socialObj));
    }

    return true;
  } catch (error) {
    console.error("Error al revertir snapshot:", error);
    return false;
  }
}
