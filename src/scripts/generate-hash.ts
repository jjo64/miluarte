import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.log("\n❌ Por favor proporciona una contraseña:");
  console.log("👉 Ejemplo de uso: npm run hash-password MiContraseñaSegura123\n");
  process.exit(1);
}

const salt = bcrypt.genSaltSync(12);
const hash = bcrypt.hashSync(password, salt);

console.log("\n========================================================");
console.log("🔐 HASH GENERADO PARA VERCEL (ADMIN_PASSWORD_HASH):");
console.log("========================================================");
console.log(`\n${hash}\n`);
console.log("========================================================");
console.log("📋 Copia este valor y pégalo en ADMIN_PASSWORD_HASH en Vercel y en tu .env.local");
console.log("========================================================\n");
