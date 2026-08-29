import React, { useState, useRef } from "react";
import {
  Video,
  UploadCloud,
  Loader2,
  Trash2,
  Play,
  Layers,
  AlertCircle,
  Link2,
} from "lucide-react";
import { R2MediaLibraryModal } from "./R2MediaLibraryModal";

interface VideoUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export function VideoUploader({
  value,
  onChange,
  label = "Vídeo Making-Of (MP4 / WebM)",
}: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    const validExtensions = [".mp4", ".webm", ".mov", ".m4v"];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setError("Por favor, sube un archivo de vídeo válido (.mp4 o .webm)");
      return;
    }

    // 30 MB límite
    if (file.size > 30 * 1024 * 1024) {
      setError("El vídeo supera el límite de 30 MB. Comprímelo antes de subir.");
      return;
    }

    setError(null);
    setIsUploading(true);
    setProgressPercent(15);

    try {
      const token = localStorage.getItem("miluarte_token") || "";

      // 1. Obtener Presigned URL
      const resPresigned = await fetch("/api/admin/r2?action=get-upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "video/mp4",
          folder: "videos",
          fileSize: file.size,
        }),
      });

      if (!resPresigned.ok) {
        const errData = await resPresigned.json();
        throw new Error(errData.error || "Error al conectar con Cloudflare R2");
      }

      const { uploadUrl, publicUrl } = await resPresigned.json();
      setProgressPercent(45);

      // 2. Subir directamente a Cloudflare R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "video/mp4",
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Error al transferir el vídeo a Cloudflare R2.");
      }

      setProgressPercent(100);
      onChange(publicUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al subir el vídeo.");
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-brand-bg/80 border border-brand-cream/15">
      <div className="flex items-center justify-between">
        <label className="font-sans text-brand-cream text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
          <Video className="w-4 h-4 text-[#E55427]" />
          <span>{label}</span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMediaModalOpen(true)}
            className="text-[11px] font-sans text-brand-blush hover:text-brand-cream flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Layers className="w-3 h-3" />
            <span>Biblioteca de Renders</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] font-sans text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            title="Pegar URL directa"
          >
            <Link2 className="w-3 h-3" />
            <span>URL</span>
          </button>
        </div>
      </div>

      {showUrlInput && (
        <div className="flex gap-2 mb-2">
          <input
            type="url"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://pub-...r2.dev/videos/... o YouTube/Vimeo"
            className="flex-1 bg-black/40 border border-brand-cream/15 rounded-lg px-3 py-1.5 text-xs text-brand-cream font-mono outline-none focus:border-[#E55427]"
          />
        </div>
      )}

      {/* Si ya hay un video */}
      {value ? (
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-black/40 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-neutral-300 truncate max-w-[80%]">
              {value.split("/").pop()}
            </span>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Quitar</span>
            </button>
          </div>

          <div className="w-full max-h-48 rounded-lg overflow-hidden bg-black/80 flex items-center justify-center">
            <video controls src={value} className="w-full max-h-48 object-contain" />
          </div>
        </div>
      ) : (
        /* Zona de subida de video */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-[#E55427] bg-[#E55427]/10"
              : "border-brand-cream/15 hover:border-brand-cream/30 bg-black/20 hover:bg-black/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2.5 w-full max-w-[240px]">
              <Loader2 className="w-6 h-6 text-[#E55427] animate-spin" />
              <p className="text-xs font-medium text-brand-cream">Subiendo vídeo a Cloudflare R2...</p>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#E55427] to-[#EAA898] h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-[#E55427]/10 flex items-center justify-center text-[#E55427]">
                <UploadCloud className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-brand-cream">
                Arrastra tu vídeo <span className="text-[#E55427] font-mono">.mp4</span> aquí
              </p>
              <p className="text-[10px] text-neutral-400">
                Se guardará directamente en Cloudflare R2 (máx. 30 MB)
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Modal de Biblioteca de Renders */}
      <R2MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        filterType="videos"
        title="Biblioteca de Renders (Vídeos)"
        onSelect={(url) => {
          onChange(url);
          setIsMediaModalOpen(false);
        }}
      />
    </div>
  );
}
