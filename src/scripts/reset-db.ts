import * as fs from "fs";
import * as path from "path";
import { kv } from "../../api/admin/_lib/kv.js";
import { META, WORKS_BY_SLUG, RENDERS, translations, getBaseGalleries } from "../../api/admin/_lib/initialData.js";

// Cargar variables de .env.local manualmente sin dependencias
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

async function resetDatabase() {
  console.log("🧹 Iniciando reseteo y limpieza de la base de datos de producción...\n");

  const galleries = getBaseGalleries();

  // 1. Resetear Galerías
  await kv.set("miluarte:galleries", JSON.stringify(galleries));
  console.log(`  ✓ ${galleries.length} Galerías base restauradas (ilustracion, diggin, concept-art, etc.)`);

  // 2. Resetear Obras
  for (const g of galleries) {
    const works = (WORKS_BY_SLUG[g.slug] || []).map((w, index) => ({
      ...w,
      order: index,
    }));
    await kv.set(`miluarte:gallery:${g.slug}`, JSON.stringify(works));
    console.log(`  ✓ Galería "${g.slug}": ${works.length} obras originales cargadas`);
  }

  // 3. Resetear Renders 3D
  const renders = RENDERS.map((r, index) => ({ ...r, order: index }));
  await kv.set("miluarte:renders", JSON.stringify(renders));
  console.log(`  ✓ ${renders.length} Proyectos 3D originales restaurados`);

  // 4. Resetear Textos del sitio a las traducciones originales
  await kv.set("miluarte:texts", JSON.stringify({
    es: translations.es,
    en: translations.en,
  }));
  console.log("  ✓ Textos oficiales (ES / EN) restaurados a su estado original");

  // 5. Resetear Redes Sociales
  await kv.set("miluarte:social", JSON.stringify({
    instagram: "https://www.instagram.com/naraneko13/",
    linkedin: "https://www.linkedin.com/in/nerealucaspajares4815162342/",
    behance: "",
    tiktok: "",
    twitter: "",
  }));
  console.log("  ✓ Redes sociales oficiales de Nerea restauradas");

  // 6. Limpiar Changelog a un estado limpio de producción
  await kv.set("miluarte:changelog", JSON.stringify([
    {
      id: "init-production",
      timestamp: new Date().toISOString(),
      action: "Sistema CMS inicializado y listo para producción",
      section: "system",
      canRollback: false,
    },
  ]));
  console.log("  ✓ Historial de versiones limpiado (0 versiones de prueba)");

  // 7. Limpiar Bandeja de Mensajes
  await kv.set("miluarte:messages:contact", JSON.stringify([]));
  await kv.set("miluarte:messages:booking", JSON.stringify([]));
  console.log("  ✓ Bandejas de contacto y encargos vaciadas");

  console.log("\n🎉 ¡Base de datos de producción 100% limpia y prístina!");
}

resetDatabase().catch((e) => {
  console.error("Error al resetear la base de datos:", e);
  process.exit(1);
});
