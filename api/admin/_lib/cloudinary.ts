import crypto from "crypto";

export interface CloudinarySignatureResult {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  eager: string;
}

export function generateUploadSignature(folder: string = "miluarte"): CloudinarySignatureResult {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "doznr2qm4";
  const apiKey = process.env.CLOUDINARY_API_KEY || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

  const timestamp = Math.round(Date.now() / 1000);
  const eager = "q_auto:good,f_auto";

  // Cloudinary requiere ordenar alfabéticamente los parámetros antes de hashear
  // eager, folder, timestamp
  const paramsToSign = `eager=${eager}&folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + apiSecret)
    .digest("hex");

  return {
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder,
    eager,
  };
}
