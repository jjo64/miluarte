import { extractTokenFromHeader, verifyToken } from "./_lib/auth";
import { generateUploadSignature } from "./_lib/cloudinary";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  // Verificar JWT
  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const folder = (req.query?.folder || "miluarte").toString().replace(/[^a-zA-Z0-9_\-\/]/g, "");
    const signatureData = generateUploadSignature(folder);

    return res.status(200).json(signatureData);
  } catch (error: any) {
    console.error("Error al generar firma de Cloudinary:", error);
    return res.status(500).json({ error: "Error al generar firma de subida" });
  }
}
