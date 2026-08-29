import { extractTokenFromHeader, verifyToken } from "../_lib/auth.js";
import {
  generatePresignedUploadUrl,
  listR2Files,
  deleteOrTrashR2File,
  isR2Configured,
  isIpAllowed,
  MAX_FILE_SIZE_BYTES,
} from "../_lib/r2.js";

export default async function r2Handler(req: any, res: any) {
  // 1. Validar IP Whitelist si está activa
  if (!isIpAllowed(req)) {
    return res.status(403).json({ error: "Acceso no autorizado desde esta dirección IP." });
  }

  // 2. Validar autenticación JWT
  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: "No autorizado. Inicie sesión nuevamente." });
  }

  // Comprobar si R2 está configurado
  if (!isR2Configured()) {
    return res.status(503).json({
      error: "Cloudflare R2 no está configurado en las variables de entorno (.env.local).",
    });
  }

  try {
    const action = req.query?.action || req.body?.action;

    // A. Obtener Presigned URL para subida directa desde el navegador
    if (req.method === "POST" && action === "get-upload-url") {
      const { fileName, contentType, folder, fileSize } = req.body || {};

      if (!fileName || !contentType) {
        return res.status(400).json({ error: "fileName y contentType son requeridos." });
      }

      // Validar límite máximo de 30 MB
      if (fileSize && fileSize > MAX_FILE_SIZE_BYTES) {
        return res.status(400).json({
          error: `El archivo supera el límite máximo permitido de ${(MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB.`,
        });
      }

      const safeFolder = folder === "videos" ? "videos" : "models";
      const presignedData = await generatePresignedUploadUrl(fileName, contentType, safeFolder);

      return res.status(200).json({
        success: true,
        ...presignedData,
      });
    }

    // B. Listar archivos y cuota usada
    if (req.method === "GET" || action === "list") {
      const folder = req.query?.folder as string | undefined;
      const data = await listR2Files(folder);
      return res.status(200).json(data);
    }

    // C. Eliminar o mover a papelera (Soft delete)
    if (req.method === "DELETE" || action === "delete") {
      const key = req.query?.key || req.body?.key;
      const permanent = req.query?.permanent === "true" || req.body?.permanent === true;

      if (!key) {
        return res.status(400).json({ error: "El parámetro 'key' del archivo es requerido." });
      }

      const result = await deleteOrTrashR2File(key, permanent);
      return res.status(200).json({ success: true, ...result });
    }

    return res.status(400).json({ error: `Acción no soportada en R2 handler.` });
  } catch (error: any) {
    console.error("Error en R2 Handler:", error);
    return res.status(500).json({
      error: error.message || "Error interno del servidor al procesar Cloudflare R2.",
    });
  }
}
