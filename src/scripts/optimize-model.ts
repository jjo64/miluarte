import { NodeIO } from "@gltf-transform/core";
import { dedup, prune, weld, resample, draco, simplify } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";
import { MeshoptSimplifier } from "meshoptimizer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

async function main() {
  const inputPath = path.resolve(process.cwd(), "public/models/Matelec.glb");
  const outputPath = path.resolve(process.cwd(), "public/models/Matelec-optimized.glb");

  console.log("Optimizando para máxima velocidad web y 60 FPS...");
  const io = new NodeIO();
  const document = await io.read(inputPath);
  const root = document.getRoot();

  console.log("Comprimiendo texturas a 512px / 768px WebP ultraligero...");
  const textures = root.listTextures();

  for (let i = 0; i < textures.length; i++) {
    const texture = textures[i];
    const imageBytes = texture.getImage();
    const mimeType = texture.getMimeType();
    const name = texture.getName() || `texture_${i}`;

    if (!imageBytes) continue;

    try {
      const image = sharp(Buffer.from(imageBytes));
      const metadata = await image.metadata();

      // 512px para texturas secundarias, 768px para base
      const maxDim = 640;
      let transformer = sharp(Buffer.from(imageBytes))
        .toColorspace("srgb")
        .resize({
          width: metadata.width && metadata.width > maxDim ? maxDim : undefined,
          height: metadata.height && metadata.height > maxDim ? maxDim : undefined,
          fit: "inside",
          withoutEnlargement: true,
        });

      let optimizedBuffer: Buffer;
      let newMime = "image/webp";

      if (metadata.hasAlpha) {
        optimizedBuffer = await transformer.webp({ quality: 72, effort: 4 }).toBuffer();
        newMime = "image/webp";
      } else {
        optimizedBuffer = await transformer.jpeg({ quality: 75, mozjpeg: true }).toBuffer();
        newMime = "image/jpeg";
      }

      texture.setImage(new Uint8Array(optimizedBuffer));
      texture.setMimeType(newMime);
    } catch (err) {
      console.warn(`   ! Error en ${name}:`, err);
    }
  }

  console.log("Aplicando simplificación agresiva de polígonos (LOD Web)...");
  await document.transform(
    dedup(),
    resample(),
    prune(),
    weld({ tolerance: 0.0002 }),
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.15, error: 0.002 }),
    draco({
      encoder: await draco3d.createEncoderModule(),
      compressionLevel: 7,
    })
  );

  console.log("Guardando modelo optimizado...");
  await io.write(outputPath, document);

  const stats = fs.statSync(outputPath);
  console.log(`\n🚀 ¡MODELO ULTRA RÁPIDO LISTO! Tamaño final: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error("Error en optimización:", err);
  process.exit(1);
});
