import * as fs from "fs";
import * as path from "path";
import { kv, isKvConfigured } from "../../api/admin/_lib/kv";
import { CmsBackup } from "../app/types/cms";

async function restoreBackup() {
  const args = process.argv.slice(2);
  let backupFile = args[0];

  if (!backupFile) {
    // Buscar el archivo de backup más reciente o el seed por defecto
    const defaultFile = path.resolve(process.cwd(), "cms-seed-backup.json");
    if (fs.existsSync(defaultFile)) {
      backupFile = defaultFile;
    } else {
      console.error("❌ Por favor especifica la ruta del archivo de backup JSON a restaurar.");
      console.error("   Uso: npm run restore -- <archivo-backup.json>");
      process.exit(1);
    }
  }

  const resolvedPath = path.isAbsolute(backupFile)
    ? backupFile
    : path.resolve(process.cwd(), backupFile);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ No se encontró el archivo de backup en: ${resolvedPath}`);
    process.exit(1);
  }

  console.log(`📦 Leyendo copia de seguridad desde: ${resolvedPath}\n`);
  const rawData = fs.readFileSync(resolvedPath, "utf-8");
  const backup: CmsBackup = JSON.parse(rawData);

  console.log(`  • Exportado el: ${backup.exportedAt || "Fecha desconocida"}`);
  console.log(`  • Versión del esquema: ${backup.version || "1.0"}`);
  console.log(`  • Galerías a restaurar: ${backup.galleries?.length || 0}`);
  console.log(`  • Proyectos 3D a restaurar: ${backup.renders?.length || 0}\n`);

  if (!isKvConfigured()) {
    console.log("⚠️ Variables de Vercel KV no configuradas en el entorno local.");
    console.log("   Para restaurar en producción, ejecuta este script con las variables de Vercel configuradas.");
    return;
  }

  console.log("📡 Conectando con Vercel KV para restaurar datos...");

  // 1. Galerías
  if (backup.galleries) {
    await kv.set("miluarte:galleries", JSON.stringify(backup.galleries));
    console.log(`  ✓ ${backup.galleries.length} galerías restauradas`);
  }

  // 2. Obras por galería
  if (backup.works) {
    for (const [slug, works] of Object.entries(backup.works)) {
      await kv.set(`miluarte:gallery:${slug}`, JSON.stringify(works));
      console.log(`  ✓ Galería "${slug}": ${works.length} obras restauradas`);
    }
  }

  // 3. Renders 3D
  if (backup.renders) {
    await kv.set("miluarte:renders", JSON.stringify(backup.renders));
    console.log(`  ✓ ${backup.renders.length} proyectos 3D restaurados`);
  }

  // 4. Textos del sitio
  if (backup.texts) {
    await kv.set("miluarte:texts", JSON.stringify(backup.texts));
    console.log("  ✓ Textos bilingües del sitio restaurados");
  }

  // 5. Redes sociales
  if (backup.social) {
    await kv.set("miluarte:social", JSON.stringify(backup.social));
    console.log("  ✓ Enlaces de redes sociales restaurados");
  }

  // 6. Mensajes
  if (backup.messages) {
    if (backup.messages.contact) {
      await kv.set("miluarte:messages:contact", JSON.stringify(backup.messages.contact));
    }
    if (backup.messages.booking) {
      await kv.set("miluarte:messages:booking", JSON.stringify(backup.messages.booking));
    }
    console.log("  ✓ Bandeja de mensajes restaurada");
  }

  // 7. Changelog
  if (backup.changelog) {
    await kv.set("miluarte:changelog", JSON.stringify(backup.changelog));
    console.log("  ✓ Historial de cambios restaurado");
  }

  console.log("\n🎉 ¡Restauración completa realizada con éxito!");
}

restoreBackup().catch((err) => {
  console.error("❌ Error durante la restauración:", err);
  process.exit(1);
});
