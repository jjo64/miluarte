import { kv, isKvConfigured } from "./_lib/kv";
import { signToken, verifyToken, extractTokenFromHeader, verifyPassword } from "./_lib/auth";

export default async function handler(req: any, res: any) {
  // Configurar headers CORS básicos
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 1. Endpoint de verificación: GET /api/admin/auth
  if (req.method === "GET") {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({ valid: false, error: "No se proporcionó token de sesión" });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ valid: false, error: "Token inválido o expirado" });
    }

    return res.status(200).json({ valid: true, email: payload.email });
  }

  // 2. Endpoint de login: POST /api/admin/auth
  if (req.method === "POST") {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({ error: "Email y contraseña requeridos" });
      }

      // Rate Limiting anti-fuerza bruta si KV está configurado
      const ip = (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1").toString().split(",")[0].trim();
      const rateLimitKey = `ratelimit:auth:${ip}`;

      if (isKvConfigured()) {
        try {
          const attempts = await kv.incr(rateLimitKey);
          if (attempts === 1) {
            await kv.expire(rateLimitKey, 900); // 15 minutos de TTL
          }
          if (attempts > 5) {
            return res.status(429).json({
              error: "Demasiados intentos fallidos. Por seguridad, la cuenta está bloqueada durante 15 minutos."
            });
          }
        } catch (kvErr) {
          console.warn("Rate limiting KV warning:", kvErr);
        }
      }

      // Credenciales esperadas
      const adminEmail = process.env.ADMIN_EMAIL || "miluartedenara@gmail.com";
      const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || "$2a$10$eE6s9bZ0/4N8p/8f0hF4s.nQf/mG3uV7N4W7Z8K.6c7l1v8"; // default o env

      const isEmailValid = email.toLowerCase().trim() === adminEmail.toLowerCase().trim();
      let isPassValid = false;

      if (isEmailValid) {
        isPassValid = await verifyPassword(password, adminPasswordHash);
      }

      if (!isEmailValid || !isPassValid) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
      }

      // Si el login es exitoso, reseteamos el contador de rate limit
      if (isKvConfigured()) {
        try {
          await kv.del(rateLimitKey);
        } catch (e) {
          // ignore
        }
      }

      // Generar JWT
      const token = signToken({ email: adminEmail, role: "admin" });

      return res.status(200).json({
        token,
        expiresIn: "7d",
        user: {
          email: adminEmail,
          role: "admin",
        }
      });
    } catch (error: any) {
      console.error("Error en login handler:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
