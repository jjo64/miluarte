import { useState, useCallback } from "react";
import { useAdminApi } from "./useAdminApi";

export interface UploadResult {
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export function useUpload() {
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const { request } = useAdminApi();

  const uploadImage = useCallback(
    async (file: File, folder: string = "miluarte"): Promise<UploadResult> => {
      setUploading(true);
      setProgress(0);
      setError(null);

      // 1. Validación de tamaño en cliente (máx 10MB según plan de Cloudinary)
      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        setUploading(false);
        const err = "La imagen supera el límite máximo permitido de 10MB";
        setError(err);
        throw new Error(err);
      }

      // 2. Validación de tipo
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
      if (!validTypes.includes(file.type)) {
        setUploading(false);
        const err = "Formato no válido. Usa JPG, PNG, WebP o GIF";
        setError(err);
        throw new Error(err);
      }

      try {
        // 3. Obtener firma segura desde backend
        const signatureData = await request(`/api/admin/upload?folder=${encodeURIComponent(folder)}`);

        // Si aún no se configuró la API Key en .env.local, usamos fallback para pruebas locales
        if (!signatureData.apiKey || !signatureData.isConfigured) {
          console.info("ℹ️ Cloudinary API Key no detectada en .env.local. Usando modo de prueba local.");
          return new Promise<UploadResult>((resolve) => {
            const reader = new FileReader();
            let p = 0;
            const interval = setInterval(() => {
              p += 25;
              setProgress(Math.min(p, 100));
              if (p >= 100) {
                clearInterval(interval);
                reader.onload = () => {
                  resolve({
                    secureUrl: reader.result as string,
                    publicId: `local-dev-${Date.now()}`,
                    width: 800,
                    height: 800,
                    format: file.type.split("/")[1] || "jpg",
                    bytes: file.size,
                  });
                };
                reader.readAsDataURL(file);
              }
            }, 100);
          });
        }

        // 4. Preparar FormData para Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signatureData.apiKey);
        formData.append("timestamp", String(signatureData.timestamp));
        formData.append("signature", signatureData.signature);
        formData.append("folder", signatureData.folder);
        formData.append("eager", signatureData.eager);

        // 5. Subir a Cloudinary con XMLHttpRequest para obtener progreso en tiempo real
        const uploadPromise = new Promise<UploadResult>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;

          xhr.open("POST", uploadUrl);

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              setProgress(percent);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve({
                  secureUrl: response.secure_url,
                  publicId: response.public_id,
                  width: response.width,
                  height: response.height,
                  format: response.format,
                  bytes: response.bytes,
                });
              } catch (e) {
                reject(new Error("Respuesta de subida inválida"));
              }
            } else {
              try {
                const errorResp = JSON.parse(xhr.responseText);
                reject(new Error(errorResp?.error?.message || "Error al subir a Cloudinary"));
              } catch (e) {
                reject(new Error(`Fallo en la subida (${xhr.status})`));
              }
            }
          };

          xhr.onerror = () => {
            reject(new Error("Error de conexión al subir la imagen"));
          };

          xhr.send(formData);
        });

        const result = await uploadPromise;
        setProgress(100);
        return result;
      } catch (err: any) {
        const msg = err.message || "Error al procesar la subida";
        setError(msg);
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [request]
  );

  return {
    uploadImage,
    uploading,
    progress,
    error,
    resetProgress: () => setProgress(0),
  };
}
