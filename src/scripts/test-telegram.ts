import * as fs from "fs";
import * as path from "path";

// Función simple para leer variables de .env.local / .env sin requerir dependencias externas
function loadEnvFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const firstEq = trimmed.indexOf("=");
          const key = trimmed.slice(0, firstEq).trim();
          let val = trimmed.slice(firstEq + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch {}
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));
loadEnvFile(path.resolve(process.cwd(), ".env"));

const botToken = process.argv[2] || process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.argv[3] || process.env.TELEGRAM_CHAT_ID;

async function sendTest() {
  console.log("\n🚀 ========================================");
  console.log("   PROBADOR DE NOTIFICACIONES TELEGRAM");
  console.log("========================================\n");

  if (!botToken || !chatId) {
    console.error("❌ Faltan credenciales.");
    console.log("   Uso 1 (Variables de entorno): Configura TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID en .env.local");
    console.log("   Uso 2 (Argumentos directos):  npx tsx src/scripts/test-telegram.ts <BOT_TOKEN> <CHAT_ID>\n");
    process.exit(1);
  }

  console.log(`🔑 Bot Token: ${botToken.substring(0, 10)}...`);
  console.log(`💬 Chat ID:   ${chatId}\n`);

  const bookingSample =
    `🌿 <b>NUEVO ENCARGO EN MILUARTE</b> 🌿\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🏷️ <b>Tipo:</b> 💼 Comercial (Prioridad)\n` +
    `👤 <b>Cliente:</b> Prueba de Sistema\n` +
    `✉️ <b>Email:</b> <code>cliente.prueba@ejemplo.com</code> (<a href="mailto:cliente.prueba@ejemplo.com">Responder</a>)\n` +
    `💰 <b>Presupuesto:</b> 1.200 € - 2.000 €\n` +
    `⏰ <b>Plazo estimado:</b> 15 de Noviembre 2026\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📝 <b>Descripción de la idea:</b>\n` +
    `<blockquote>¡Hola! Esto es una prueba de notificación para el sistema de encargos de Miluarte. La plantilla se ve limpia, formateada y profesional con enlaces directos.</blockquote>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `✨ <i>Gestiona este encargo en <a href="https://miluartedenara.com/admin">miluartedenara.com/admin</a></i>`;

  console.log("📤 Enviando notificación de prueba...");

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: bookingSample,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const data = (await res.json()) as any;

    if (data.ok) {
      console.log("\n✅ ¡ÉXITO! Mensaje enviado correctamente a tu Telegram.");
      console.log("📱 Revisa tu aplicación de Telegram en tu móvil o PC.\n");
    } else {
      console.error("\n❌ Error devuelto por Telegram API:", data.description);
      console.log("💡 Verifica que el BOT_TOKEN sea correcto y que hayas iniciado el bot con /start antes de enviar mensajes.\n");
    }
  } catch (err: any) {
    console.error("\n❌ Error de conexión:", err.message);
  }
}

sendTest();
