import { kv, isKvConfigured } from "./kv";
import { ChangelogEntry, GalleryMeta } from "../../../src/app/types/cms";
import { nanoid } from "nanoid";
import { META } from "../../../src/app/pages/CollectionPage";

// Slugs de las galerías base de Nerea que NUNCA deben borrarse ni desaparecer
export const BASE_GALLERY_SLUGS = new Set([
  "ilustracion",
  "diggin",
  "concept-art",
  "diseno-grafico",
  "3d-stands",
  "animas",
  "retratos",
  "pasta-ya",
]);

export function getBaseGalleries(): GalleryMeta[] {
  return Object.entries(META).map(([slug, meta], index) => ({
    slug,
    title: meta.title,
    label: meta.label,
    statement: meta.statement,
    accent: meta.accent,
    twoColumns: meta.twoColumns || false,
    order: index,
    featured: ["ilustracion", "concept-art", "diggin", "animas"].includes(slug),
  }));
}

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

    let galleries = galleriesRaw;
    if (!galleries || (Array.isArray(galleries) && galleries.length === 0)) {
      galleries = getBaseGalleries();
    }

    const snapshotData: Record<string, any> = {
      galleries,
      renders: rendersRaw,
      texts: textsRaw,
      social: socialRaw,
      works: {},
    };

    const galleriesArr = typeof galleries === "string" ? JSON.parse(galleries) : galleries;
    if (Array.isArray(galleriesArr)) {
      await Promise.all(
        galleriesArr.map(async (g: any) => {
          snapshotData.works[g.slug] = await kv.get(`miluarte:gallery:${g.slug}`);
        })
      );
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
 * Revierte el estado del sitio completo exactamente a como estaba en el snapshotId,
 * protegiendo SIEMPRE las galerías base y eliminando solo las galerías personalizadas creadas después.
 */
export async function rollbackToSnapshot(snapshotId: string): Promise<boolean> {
  if (!isKvConfigured()) return false;

  try {
    const rawSnapshot = await kv.get(`miluarte:snapshot:${snapshotId}`);
    if (!rawSnapshot) return false;

    const snapshot = typeof rawSnapshot === "string" ? JSON.parse(rawSnapshot) : rawSnapshot;

    // 1. Obtener galerías actuales
    const currentGalleriesRaw = await kv.get("miluarte:galleries");
    const currentGalleries: any[] = Array.isArray(currentGalleriesRaw)
      ? currentGalleriesRaw
      : typeof currentGalleriesRaw === "string"
      ? JSON.parse(currentGalleriesRaw || "[]")
      : [];

    // 2. Parsear galerías del snapshot y asegurar que las base SIEMPRE estén presentes
    let snapshotGalleries: any[] = Array.isArray(snapshot.galleries)
      ? snapshot.galleries
      : typeof snapshot.galleries === "string"
      ? JSON.parse(snapshot.galleries || "[]")
      : [];

    if (snapshotGalleries.length === 0) {
      snapshotGalleries = getBaseGalleries();
    } else {
      // Asegurar que las galerías base que existan no se pierdan
      const baseGalleries = getBaseGalleries();
      const existingSlugs = new Set(snapshotGalleries.map((g: any) => g.slug));
      for (const bg of baseGalleries) {
        if (!existingSlugs.has(bg.slug)) {
          snapshotGalleries.push(bg);
        }
      }
    }

    const snapshotSlugs = new Set(snapshotGalleries.map((g: any) => g.slug));

    // 3. Borrar solo las claves de galerías creadas después que NO sean galerías base
    for (const g of currentGalleries) {
      if (!snapshotSlugs.has(g.slug) && !BASE_GALLERY_SLUGS.has(g.slug)) {
        await kv.del(`miluarte:gallery:${g.slug}`);
      }
    }

    // 4. Restaurar galerías en KV
    await kv.set("miluarte:galleries", JSON.stringify(snapshotGalleries));

    // 5. Restaurar obras por galería
    if (snapshot.works && typeof snapshot.works === "object") {
      for (const [slug, worksData] of Object.entries(snapshot.works)) {
        if (worksData) {
          const worksArr = Array.isArray(worksData)
            ? worksData
            : typeof worksData === "string"
            ? JSON.parse(worksData || "[]")
            : [];
          if (worksArr.length > 0) {
            await kv.set(`miluarte:gallery:${slug}`, JSON.stringify(worksArr));
          }
        }
      }
    }

    // 6. Restaurar renders 3D
    if (snapshot.renders) {
      const rendersArr = Array.isArray(snapshot.renders)
        ? snapshot.renders
        : typeof snapshot.renders === "string"
        ? JSON.parse(snapshot.renders || "[]")
        : snapshot.renders;
      await kv.set("miluarte:renders", JSON.stringify(rendersArr));
    }

    // 7. Restaurar textos
    if (snapshot.texts) {
      const textsObj = typeof snapshot.texts === "string" ? JSON.parse(snapshot.texts) : snapshot.texts;
      await kv.set("miluarte:texts", JSON.stringify(textsObj));
    }

    // 8. Restaurar redes sociales
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
