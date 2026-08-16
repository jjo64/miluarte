import { extractTokenFromHeader, verifyToken } from "./_lib/auth.js";
import { generateUploadSignature } from "./_lib/cloudinary.js";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  // Requiere autenticación de administrador
  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const { folder = "miluarte", tags = "cms" } = req.body || {};

    const signatureData = generateUploadSignature({
      folder,
      tags: typeof tags === "string" ? tags : tags.join(","),
    });

    return res.status(200).json(signatureData);
  } catch (error: any) {
    console.error("Error al generar firma de Cloudinary:", error);
    return res.status(500).json({ error: "Error al generar firma de subida segura" });
  }
}
