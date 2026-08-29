import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  CopyObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || "d8bb23b8044866b13b87aaeee6392c88";
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "";
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "miluarte-media";
const publicUrlBase = (process.env.CLOUDFLARE_R2_PUBLIC_URL || "https://pub-e9eb3a9a7c3c422e8324d594fa64b1e2.r2.dev").replace(/\/$/, "");
const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;

export const MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024; // 30 MB límite
export const TOTAL_QUOTA_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB límite gratuito

export function getR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: endpoint,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  });
}

export function isR2Configured(): boolean {
  return Boolean(accessKeyId && secretAccessKey && bucketName);
}

/**
 * Verifica si la IP del cliente está en la whitelist (si está configurada)
 */
export function isIpAllowed(req: any): boolean {
  const whitelistStr = process.env.ADMIN_IP_WHITELIST || "";
  if (!whitelistStr.trim()) {
    return true; // Si no hay whitelist configurada, permite el paso (protegido por JWT)
  }

  const allowedIps = whitelistStr.split(",").map((ip) => ip.trim());
  const clientIp = (
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    ""
  ).split(",")[0].trim();

  return allowedIps.includes(clientIp);
}

/**
 * Genera una URL prefirmada (Presigned URL) para subir archivos directamente a R2 desde el navegador
 */
export async function generatePresignedUploadUrl(
  fileName: string,
  contentType: string,
  folder: string = "models"
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const client = getR2Client();
  const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
  const timestamp = Date.now();
  const key = `${folder}/${timestamp}_${cleanName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  // URL válida durante 15 minutos para la subida directa
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 });
  const publicUrl = `${publicUrlBase}/${key}`;

  return { uploadUrl, publicUrl, key };
}

/**
 * Lista todos los archivos del bucket y calcula la cuota usada
 */
export async function listR2Files(folder?: string) {
  if (!isR2Configured()) {
    return {
      files: [],
      totalSizeBytes: 0,
      totalQuotaBytes: TOTAL_QUOTA_BYTES,
      usedPercentage: 0,
      isConfigured: false,
    };
  }

  const client = getR2Client();
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: folder ? `${folder}/` : undefined,
  });

  const response = await client.send(command);
  const contents = response.Contents || [];

  let totalSizeBytes = 0;
  const files = contents
    .filter((item) => item.Key && !item.Key.endsWith("/"))
    .map((item) => {
      const size = item.Size || 0;
      totalSizeBytes += size;
      const key = item.Key!;
      const isTrash = key.startsWith("trash/");
      return {
        key,
        name: key.split("/").pop() || key,
        folder: key.includes("/") ? key.split("/")[0] : "root",
        size,
        lastModified: item.LastModified,
        publicUrl: `${publicUrlBase}/${key}`,
        isTrash,
      };
    })
    .sort((a, b) => (b.lastModified?.getTime() || 0) - (a.lastModified?.getTime() || 0));

  const usedPercentage = Math.min(100, Number(((totalSizeBytes / TOTAL_QUOTA_BYTES) * 100).toFixed(2)));

  return {
    files,
    totalSizeBytes,
    totalQuotaBytes: TOTAL_QUOTA_BYTES,
    usedPercentage,
    isConfigured: true,
  };
}

/**
 * Mueve un archivo a la papelera (Soft Delete) o lo elimina permanentemente
 */
export async function deleteOrTrashR2File(key: string, permanent: boolean = false) {
  const client = getR2Client();

  if (permanent || key.startsWith("trash/")) {
    // Borrado definitivo
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await client.send(deleteCommand);
    return { status: "deleted", key };
  } else {
    // Mover a papelera (Soft Delete)
    const trashKey = `trash/${key.replace(/\//g, "_")}`;
    const copyCommand = new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${key}`,
      Key: trashKey,
    });
    await client.send(copyCommand);

    const deleteOriginalCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await client.send(deleteOriginalCommand);

    return { status: "trashed", key: trashKey, originalKey: key };
  }
}
