import React, { useState, useRef } from "react";
import {
  Box,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Sparkles,
  RefreshCw,
  Eye,
  Layers,
} from "lucide-react";
import { optimizeGlbInBrowser, OptimizationResult } from "../../utils/modelOptimizer";
import { ModelViewer3D } from "../ModelViewer3D";
import { R2MediaLibraryModal } from "./R2MediaLibraryModal";

interface ModelUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  onOpenMediaLibrary?: () => void;
}

export function ModelUploader({
  value,
  onChange,
  onOpenMediaLibrary,
}: ModelUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [optResult, setOptResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1) + " MB";

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".glb") && !file.name.toLowerCase().endsWith(".gltf")) {
      setError("Por favor, sube un archivo 3D en formato .glb");
      return;
    }

    setError(null);
    setIsProcessing(true);
    setStatusText("Iniciando optimizador...");
    setProgressPercent(5);

    try {
      // 1. Optimizar en el navegador si es mayor de 3 MB o tiene texturas
      let fileToUpload = file;
      let result: OptimizationResult | null = null;

      if (file.size > 3 * 1024 * 1024) {
        result = await optimizeGlbInBrowser(file, (msg, pct) => {
          setStatusText(msg);
          setProgressPercent(pct);
        });
        fileToUpload = result.file;
        setOptResult(result);
      }

      setStatusText("Obteniendo enlace seguro de Cloudflare R2...");
      setProgressPercent(85);

      const token = localStorage.getItem("miluarte_token") || "";
      const resPresigned = await fetch("/api/admin/r2?action=get-upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: fileToUpload.name,
          contentType: "model/gltf-binary",
          folder: "models",
          fileSize: fileToUpload.size,
        }),
      });

      if (!resPresigned.ok) {
        const errData = await resPresigned.json();
        throw new Error(errData.error || "Error al conectar con Cloudflare R2");
      }

      const { uploadUrl, publicUrl } = await resPresigned.json();

      setStatusText("Subiendo a la nube...");
      setProgressPercent(95);

      // 2. Subida directa a R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "model/gltf-binary",
        },
        body: fileToUpload,
      });

      if (!uploadRes.ok) {
        throw new Error("Error al transferir el archivo a Cloudflare R2.");
      }

      setProgressPercent(100);
      setStatusText("¡Modelo 3D subido con éxito!");
      onChange(publicUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al procesar y subir el archivo 3D.");
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Si ya hay un modelo configurado */}
      {value ? (
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-black/40 border border-brand-cream/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-brand-cream truncate max-w-[70%]">
              <Box className="w-4 h-4 text-[#E55427] shrink-0" />
              <span className="truncate font-mono">{value.split("/").pop()}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                title="Mostrar/Ocultar 3D"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{showPreview ? "Ocultar" : "Ver"}</span>
              </button>

              <button
                type="button"
                onClick={() => onChange("")}
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                title="Quitar modelo"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Quitar</span>
              </button>
            </div>
          </div>

          {/* Previsualización 3D dentro del CMS */}
          {showPreview && (
            <div className="w-full h-[280px] rounded-lg overflow-hidden border border-white/5 bg-black/60 relative">
              <ModelViewer3D modelUrl={value} className="w-full h-full" autoRotateDefault={true} />
            </div>
          )}

          {optResult && (
            <div className="flex items-center justify-between text-[11px] px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-green-400" />
                <span>
                  Optimizado: {formatMB(optResult.originalSizeBytes)} ➔ {formatMB(optResult.optimizedSizeBytes)}
                </span>
              </div>
              <span className="font-bold">-{optResult.reductionPercentage}%</span>
            </div>
          )}
        </div>
      ) : (
        /* Zona de subida */
        <div className="flex flex-col gap-2">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-[#E55427] bg-[#E55427]/10"
                : "border-brand-cream/15 hover:border-brand-cream/30 bg-black/20 hover:bg-black/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb,.gltf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              disabled={isProcessing}
            />

            {isProcessing ? (
              <div className="flex flex-col items-center gap-3 w-full max-w-[280px]">
                <Loader2 className="w-7 h-7 text-[#E55427] animate-spin" />
                <p className="text-xs font-medium text-brand-cream">{statusText}</p>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#E55427] to-[#EAA898] h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">{progressPercent}%</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#E55427]/10 flex items-center justify-center text-[#E55427] mb-1">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-brand-cream">
                  Arrastra tu archivo <span className="text-[#E55427] font-mono">.glb</span> de Blender aquí
                </p>
                <p className="text-[10px] text-neutral-400">
                  Se optimizará automáticamente antes de subir a Cloudflare R2
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMediaModalOpen(true)}
            className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/5"
          >
            <Layers className="w-3.5 h-3.5 text-[#E55427]" />
            <span>Elegir modelo de la Biblioteca de Renders</span>
          </button>
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
        filterType="models"
        title="Biblioteca de Renders (Modelos 3D)"
        onSelect={(url) => {
          onChange(url);
          setIsMediaModalOpen(false);
        }}
      />
    </div>
  );
}
