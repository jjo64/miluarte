import { useState, useRef, useEffect } from "react";
import { UploadCloud, Image as ImageIcon, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useUpload, UploadResult } from "../../hooks/useUpload";
import { getOptimizedImageUrl } from "../../utils/cloudinary";

interface ImageUploaderProps {
  currentImageUrl?: string;
  onUploadSuccess?: (result: UploadResult) => void;
  onFileSelect?: (file: File) => void;
  folder?: string;
  label?: string;
  aspectHint?: string;
  compact?: boolean;
}

export function ImageUploader({
  currentImageUrl,
  onUploadSuccess,
  onFileSelect,
  folder = "miluarte",
  label = "Subir Imagen",
  aspectHint = "Recomendado: JPG, PNG o WebP hasta 10MB",
  compact = false,
}: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading, progress, error } = useUpload();

  // Limpiar previewUrl si currentImageUrl cambia externamente
  useEffect(() => {
    if (!currentImageUrl) {
      setPreviewUrl(null);
    }
  }, [currentImageUrl]);

  const handleFile = async (file: File) => {
    setLocalError(null);

    // 1. Validar tamaño (máx 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setLocalError("La imagen supera el límite de 10MB");
      return;
    }

    // 2. Validar formato
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setLocalError("Formato no válido. Usa JPG, PNG, WebP o GIF");
      return;
    }

    // Generar preview local instantánea
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    if (onFileSelect) {
      // Modo diferido: solo entregamos el archivo al padre para subir al hacer click en Guardar
      onFileSelect(file);
    } else if (onUploadSuccess) {
      // Modo directo: sube inmediatamente
      try {
        const res = await uploadImage(file, folder);
        onUploadSuccess(res);
      } catch (e) {
        setPreviewUrl(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const displayImage = previewUrl || currentImageUrl;
  const activeError = localError || error;

  return (
    <div className="flex flex-col gap-2 w-full select-none">
      {label && (
        <span className="font-sans text-brand-cream/70 text-[11px] tracking-wider uppercase font-medium">
          {label}
        </span>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center ${
          compact ? "p-4 min-h-[140px]" : "p-6 min-h-[190px]"
        } ${
          isDragOver
            ? "border-brand-blush bg-brand-blush/10 scale-[1.01]"
            : "border-brand-cream/15 bg-brand-bg/80 hover:border-brand-cream/30 hover:bg-brand-dark/90"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleChange}
          className="hidden"
          disabled={uploading}
        />

        {/* Si ya hay imagen o preview */}
        {displayImage && !uploading ? (
          <div className="relative w-full h-full min-h-[140px] flex items-center justify-center group">
            <img
              src={displayImage.startsWith("blob:") || displayImage.startsWith("data:") ? displayImage : getOptimizedImageUrl(displayImage, 600)}
              alt="Preview"
              className="max-h-48 rounded-xl object-contain shadow-md"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center gap-2 text-white">
              <RefreshCw className="w-5 h-5 text-brand-blush" />
              <span className="font-sans text-xs font-medium">Click para cambiar imagen</span>
            </div>
          </div>
        ) : uploading ? (
          /* Estado de subida en progreso */
          <div className="w-full flex flex-col items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-full bg-brand-blush/15 border border-brand-blush/30 flex items-center justify-center text-brand-blush animate-pulse">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="font-serif italic text-brand-wall text-xs">Subiendo y optimizando...</p>
            {/* Barra de progreso animada */}
            <div className="w-full max-w-xs h-2 bg-brand-dark rounded-full overflow-hidden border border-brand-cream/10">
              <motion.div
                className="h-full bg-brand-blush"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <span className="font-sans text-[11px] text-brand-cream/60">{progress}%</span>
          </div>
        ) : (
          /* Dropzone vacío */
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-cream/5 border border-brand-cream/10 flex items-center justify-center text-brand-cream/60">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-sans text-xs text-brand-cream font-medium">
                Arrastra una foto aquí o <span className="text-brand-blush underline">explora</span>
              </p>
              <p className="font-sans text-[10px] text-brand-cream/50 mt-1">{aspectHint}</p>
            </div>
          </div>
        )}
      </div>

      {activeError && (
        <div className="flex items-center gap-1.5 text-brand-orange text-[11px] mt-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{activeError}</span>
        </div>
      )}
    </div>
  );
}
