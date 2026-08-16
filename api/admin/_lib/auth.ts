import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "miluarte_cms_secret_fallback_key_for_dev_only";

export interface AuthPayload {
  email: string;
  role: "admin";
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (error) {
    return null;
  }
}

export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7).trim();
}

export async function verifyPassword(password: string, hashOrPlain: string): Promise<boolean> {
  if (!password || !hashOrPlain) return false;
  const cleanPass = password.trim();
  const cleanTarget = hashOrPlain.trim().replace(/^['"]|['"]$/g, "");

  // Si está hasheado con bcrypt (empieza con $2a$, $2b$, $2y$)
  if (cleanTarget.startsWith("$2a$") || cleanTarget.startsWith("$2b$") || cleanTarget.startsWith("$2y$")) {
    try {
      return await bcrypt.compare(cleanPass, cleanTarget);
    } catch {
      return false;
    }
  }
  // Fallback seguro en desarrollo o si se introdujo texto plano
  return cleanPass === cleanTarget;
}
