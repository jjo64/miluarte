import { META, WORKS_BY_SLUG } from "../app/pages/CollectionPage";
import { RENDERS } from "../app/pages/RendersPage";
import { translations } from "../app/locales/translations";
import { GalleryMeta, Work, RenderItem, SiteTexts, SocialLinks, ChangelogEntry } from "../app/types/cms";
import * as fs from "fs";
import * as path from "path";

// Usamos el cliente KV
import { kv, isKvConfigured } from "../../api/admin/_lib/kv";

async function runMigration() {
  console.log("🚀 Iniciando migración de datos para Miluarte CMS...\n");

  // 1. Transformar galerías
  const galleries: GalleryMeta[] = Object.entries(META).map(([slug, meta], index) => ({
    slug,
    title: meta.title,
    label: meta.label,
    statement: meta.statement,
    accent: meta.accent,
    twoColumns: meta.twoColumns || false,
    order: index,
    featured: ["ilustracion", "concept-art", "diggin", "animas"].includes(slug),
  }));

  // 2. Transformar obras por galería
  const worksByGallery: Record<string, Work[]> = {};
  for (const [slug, works] of Object.entries(WORKS_BY_SLUG)) {
    worksByGallery[slug] = works.map((w, index) => ({
      id: String(w.id),
      title: w.title,
      year: w.year,
      technique: w.technique,
      size: w.size,
      price: w.price,
      available: w.available,
      img: w.img,
      imgPos: w.imgPos || "50% 50%",
      gridCol: w.gridCol || "md:col-span-1",
      aspect: w.aspect || "1/1",
      order: index,
      featured: index < 2, // Primeras 2 obras marcadas como destacadas inicialmente
    }));
  }

  // 3. Transformar renders 3D
  const renders: RenderItem[] = RENDERS.map((r, index) => ({
    id: r.id,
    title: r.title,
    client: r.client,
    year: r.year,
    badge: r.badge,
    software: r.software,
    delivery: r.delivery,
    description: r.description,
    img: r.img,
    videoSrcMp4: r.videoSrcMp4,
    videoSrcWebm: r.videoSrcWebm,
    process: r.process || [],
    makingOfVideoMp4: r.makingOfVideoMp4,
    makingOfVideoWebm: r.makingOfVideoWebm,
    order: index,
  }));

  // 4. Transformar textos del sitio
  const texts: SiteTexts = {
    es: translations.es,
    en: translations.en,
  };

  // 5. Redes sociales
  const social: SocialLinks = {
    instagram: "https://www.instagram.com/naraneko13/",
    linkedin: "https://www.linkedin.com/in/nerealucaspajares4815162342/",
    behance: "",
    tiktok: "",
    twitter: "",
  };

  // 6. Changelog inicial
  const changelog: ChangelogEntry[] = [
    {
      id: "init-1",
      timestamp: new Date().toISOString(),
      action: "Sistema CMS inicializado y datos migrados correctamente",
      section: "system",
    },
  ];

  // Backup / snapshot local siempre generado como respaldo
  const snapshot = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    galleries,
    works: worksByGallery,
    renders,
    texts,
    social,
    changelog,
    messages: {
      contact: [],
      booking: [],
    },
  };

  const seedPath = path.resolve(process.cwd(), "cms-seed-backup.json");
  fs.writeFileSync(seedPath, JSON.stringify(snapshot, null, 2), "utf-8");
  console.log(`📦 Respaldo local de migración guardado en: ${seedPath}`);

  // Si KV está configurado, volcamos a la base de datos
  if (isKvConfigured()) {
    console.log("📡 Conectando con Vercel KV / Upstash Redis...");
    await kv.set("miluarte:galleries", JSON.stringify(galleries));

    for (const [slug, works] of Object.entries(worksByGallery)) {
      await kv.set(`miluarte:gallery:${slug}`, JSON.stringify(works));
      console.log(`  ✓ Galería migrada a KV: ${slug} (${works.length} obras)`);
    }

    await kv.set("miluarte:renders", JSON.stringify(renders));
    console.log(`  ✓ Renders 3D migrados a KV (${renders.length} proyectos)`);

    await kv.set("miluarte:texts", JSON.stringify(texts));
    console.log("  ✓ Textos bilingües migrados a KV");

    await kv.set("miluarte:social", JSON.stringify(social));
    console.log("  ✓ Redes sociales migradas a KV");

    await kv.set("miluarte:changelog", JSON.stringify(changelog));
    console.log("  ✓ Changelog inicial configurado");

    console.log("\n🎉 ¡Migración a Vercel KV completada con éxito!");
  } else {
    console.log(
      "\n⚠️ Variables de Vercel KV no detectadas en el entorno local actual. Los datos quedaron listos en 'cms-seed-backup.json' para ser volcados en cuanto configures el store en Vercel."
    );
  }
}

runMigration().catch((err) => {
  console.error("❌ Error durante la migración:", err);
  process.exit(1);
});
