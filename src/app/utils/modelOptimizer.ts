import { WebIO } from "@gltf-transform/core";
import { dedup, prune, weld, resample } from "@gltf-transform/functions";

export interface OptimizationResult {
  file: File;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  reductionPercentage: number;
  timeSeconds: number;
}

/**
 * Redimensiona y comprime una imagen a WebP/JPEG en el navegador usando Canvas
 */
async function compressImageInBrowser(
  imageBytes: Uint8Array,
  mimeType: string,
  maxDim: number = 1024
): Promise<{ data: Uint8Array; mimeType: string }> {
  return new Promise((resolve) => {
    try {
      const blob = new Blob([imageBytes], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(url);
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve({ data: imageBytes, mimeType });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Exportar a WebP con calidad 80 (o JPEG si no soporta WebP)
        const targetMime = "image/webp";
        canvas.toBlob(
          async (compressedBlob) => {
            if (!compressedBlob) {
              resolve({ data: imageBytes, mimeType });
              return;
            }
            const buffer = await compressedBlob.arrayBuffer();
            resolve({
              data: new Uint8Array(buffer),
              mimeType: targetMime,
            });
          },
          targetMime,
          0.8
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ data: imageBytes, mimeType });
      };

      img.src = url;
    } catch {
      resolve({ data: imageBytes, mimeType });
    }
  });
}

/**
 * Optimiza un archivo GLB directamente en el navegador de Nerea
 */
export async function optimizeGlbInBrowser(
  file: File,
  onProgress?: (status: string, percent: number) => void
): Promise<OptimizationResult> {
  const startTime = performance.now();
  const originalSizeBytes = file.size;

  onProgress?.("Leyendo archivo 3D...", 10);
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.("Analizando estructura de Blender...", 25);
  const io = new WebIO();
  const document = await io.readBinary(new Uint8Array(arrayBuffer));
  const root = document.getRoot();

  const textures = root.listTextures();
  const totalTextures = textures.length;

  if (totalTextures > 0) {
    for (let i = 0; i < totalTextures; i++) {
      const texture = textures[i];
      const imageBytes = texture.getImage();
      const mimeType = texture.getMimeType();

      if (imageBytes) {
        const percent = Math.round(30 + ((i + 1) / totalTextures) * 35);
        onProgress?.(`Comprimiendo texturas (${i + 1}/${totalTextures})...`, percent);

        const { data, mimeType: newMime } = await compressImageInBrowser(
          imageBytes,
          mimeType,
          1024
        );
        texture.setImage(data);
        texture.setMimeType(newMime);
      }
    }
  }

  onProgress?.("Optimizando mallas y limpiando datos...", 70);
  await document.transform(
    dedup(),
    resample(),
    prune(),
    weld({ tolerance: 0.0001 })
  );

  onProgress?.("Empaquetando modelo final...", 90);
  const glbBytes = await io.writeBinary(document);
  const optimizedBlob = new Blob([glbBytes], { type: "model/gltf-binary" });

  const cleanName = file.name.replace(/\.[^/.]+$/, "") + "-opt.glb";
  const optimizedFile = new File([optimizedBlob], cleanName, {
    type: "model/gltf-binary",
  });

  const optimizedSizeBytes = optimizedFile.size;
  const reductionPercentage = Math.round(
    ((originalSizeBytes - optimizedSizeBytes) / originalSizeBytes) * 100
  );
  const timeSeconds = Number(((performance.now() - startTime) / 1000).toFixed(1));

  onProgress?.("¡Listo!", 100);

  return {
    file: optimizedFile,
    originalSizeBytes,
    optimizedSizeBytes,
    reductionPercentage: Math.max(0, reductionPercentage),
    timeSeconds,
  };
}
