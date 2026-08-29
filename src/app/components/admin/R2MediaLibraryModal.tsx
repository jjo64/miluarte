import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Video,
  FileBox,
  Search,
  Check,
  X,
  Trash2,
  Copy,
  ExternalLink,
  UploadCloud,
  Loader2,
  RefreshCw,
  Eye,
  HardDrive,
  Cloud,
  Layers,
} from "lucide-react";
import { useAdminApi } from "../../hooks/useAdminApi";
import { ModelViewer3D } from "../ModelViewer3D";

export interface R2FileItem {
  key: string;
  name: string;
  folder: string;
  size: number;
  lastModified?: string;
  publicUrl: string;
  isTrash?: boolean;
}

interface R2MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (url: string, file: R2FileItem) => void;
  filterType?: "all" | "models" | "videos";
  title?: string;
}

export function R2MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  filterType = "all",
  title = "Biblioteca de Renders",
}: R2MediaLibraryModalProps) {
  const { request } = useAdminApi();
  const [activeFilter, setActiveFilter] = useState<"all" | "models" | "videos">(filterType);
  const [files, setFiles] = useState<R2FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<R2FileItem | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [stats, setStats] = useState<{ totalSizeBytes: number; usedPercentage: number } | null>(null);

  useEffect(() => {
    setActiveFilter(filterType);
  }, [filterType]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await request<{
        files: R2FileItem[];
        totalSizeBytes: number;
        usedPercentage: number;
      }>("/api/admin/r2?action=list");

      if (data && Array.isArray(data.files)) {
        setFiles(data.files);
        setStats({
          totalSizeBytes: data.totalSizeBytes || 0,
          usedPercentage: data.usedPercentage || 0,
        });
      }
    } catch (err) {
      console.error("Error al cargar archivos de R2:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFiles();
      setSelectedKey(null);
      setPreviewItem(null);
    }
  }, [isOpen]);

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      // Filtro de carpeta / tipo
      const isModel = file.key.endsWith(".glb") || file.key.endsWith(".gltf") || file.folder === "models";
      const isVid = file.key.endsWith(".mp4") || file.key.endsWith(".webm") || file.folder === "videos";

      if (activeFilter === "models" && !isModel) return false;
      if (activeFilter === "videos" && !isVid) return false;

      // Filtro de búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return file.name.toLowerCase().includes(q) || file.key.toLowerCase().includes(q);
      }

      return true;
    });
  }, [files, activeFilter, searchQuery]);

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }
    return (bytes / 1024).toFixed(0) + " KB";
  };

  const handleCopyUrl = (file: R2FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(file.publicUrl);
    setCopiedKey(file.key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDelete = async (file: R2FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`¿Seguro que deseas mover "${file.name}" a la papelera?`)) {
      return;
    }

    try {
      setDeletingKey(file.key);
      await request(`/api/admin/r2?action=delete&key=${encodeURIComponent(file.key)}`, {
        method: "DELETE",
      });
      setFiles((prev) => prev.filter((f) => f.key !== file.key));
      if (previewItem?.key === file.key) setPreviewItem(null);
    } catch (err: any) {
      alert("Error al eliminar archivo: " + (err.message || "Fallo"));
    } finally {
      setDeletingKey(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-brand-dark border border-brand-cream/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-brand-cream z-10">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-cream/10 bg-brand-dark/95">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E55427]/10 flex items-center justify-center text-[#E55427]">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-normal text-brand-cream">{title}</h3>
              <p className="font-sans text-[11px] text-brand-cream/50">
                {stats ? `${formatSize(stats.totalSizeBytes)} usados de 10 GB (${stats.usedPercentage}%)` : "Archivos en la nube"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadFiles}
              disabled={loading}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors cursor-pointer"
              title="Recargar archivos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filtros y Buscador */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3 border-b border-brand-cream/10 bg-[#120D0B]">
          {/* Pestañas de Filtro */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeFilter === "all"
                  ? "bg-[#E55427] text-white"
                  : "bg-white/5 text-neutral-400 hover:text-white"
              }`}
            >
              Todos ({files.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("models")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeFilter === "models"
                  ? "bg-[#E55427] text-white"
                  : "bg-white/5 text-neutral-400 hover:text-white"
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Modelos 3D (.glb)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("videos")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeFilter === "videos"
                  ? "bg-[#E55427] text-white"
                  : "bg-white/5 text-neutral-400 hover:text-white"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos (.mp4)</span>
            </button>
          </div>

          {/* Buscador */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Buscar archivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-black/40 border border-brand-cream/15 rounded-lg text-xs text-brand-cream outline-none focus:border-[#E55427]"
            />
          </div>
        </div>

        {/* Cuerpo: Grid de Archivos + Previsualización */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
          {/* Listado de archivos */}
          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-400">
                <Loader2 className="w-8 h-8 animate-spin text-[#E55427]" />
                <p className="text-xs">Cargando archivos de Cloudflare R2...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-white/10 rounded-2xl p-6">
                <FileBox className="w-12 h-12 text-neutral-600 mb-2" />
                <p className="text-sm font-medium text-brand-cream mb-1">No hay archivos en esta categoría</p>
                <p className="text-xs text-neutral-500">
                  {searchQuery ? "No se encontraron coincidencias para la búsqueda" : "Los archivos que subas aparecerán aquí"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {filteredFiles.map((file) => {
                  const isModel = file.key.endsWith(".glb") || file.key.endsWith(".gltf");
                  const isVid = file.key.endsWith(".mp4") || file.key.endsWith(".webm");
                  const isSelected = selectedKey === file.key;

                  return (
                    <div
                      key={file.key}
                      onClick={() => {
                        setSelectedKey(file.key);
                        setPreviewItem(file);
                      }}
                      className={`group relative p-3.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#E55427]/15 border-[#E55427] shadow-lg"
                          : "bg-black/30 border-white/10 hover:border-white/25 hover:bg-black/50"
                      }`}
                    >
                      <div>
                        {/* Icono del tipo de archivo */}
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-white/5 text-[#E55427]">
                              {isModel ? <Box className="w-4 h-4" /> : isVid ? <Video className="w-4 h-4" /> : <FileBox className="w-4 h-4" />}
                            </div>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-neutral-300">
                              {file.folder}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={(e) => handleCopyUrl(file, e)}
                              className="p-1.5 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white"
                              title="Copiar URL pública"
                            >
                              {copiedKey === file.key ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDelete(file, e)}
                              disabled={deletingKey === file.key}
                              className="p-1.5 rounded-md hover:bg-red-500/20 text-neutral-400 hover:text-red-400"
                              title="Eliminar archivo"
                            >
                              {deletingKey === file.key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Nombre del archivo */}
                        <p className="text-xs font-medium text-brand-cream truncate mb-1" title={file.name}>
                          {file.name}
                        </p>
                      </div>

                      {/* Detalles inferiores */}
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5 text-[11px] text-neutral-500 font-mono">
                        <span>{formatSize(file.size)}</span>
                        {onSelect && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect(file.publicUrl, file);
                              onClose();
                            }}
                            className="text-[10px] px-2.5 py-1 rounded-md bg-[#E55427] hover:bg-[#E55427]/80 text-white font-sans font-semibold transition-colors"
                          >
                            Seleccionar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Panel Lateral de Previsualización */}
          {previewItem && (
            <div className="w-full lg:w-80 p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col justify-between shrink-0">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <div className="flex items-center gap-2 text-xs font-medium text-brand-cream truncate">
                    <Eye className="w-4 h-4 text-[#E55427] shrink-0" />
                    <span className="truncate">{previewItem.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewItem(null)}
                    className="p-1 text-neutral-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Visor de Previsualización */}
                <div className="w-full h-56 rounded-xl overflow-hidden bg-black/80 border border-white/5 relative mb-4">
                  {previewItem.key.endsWith(".glb") || previewItem.folder === "models" ? (
                    <ModelViewer3D modelUrl={previewItem.publicUrl} className="w-full h-full" autoRotateDefault={true} />
                  ) : previewItem.key.endsWith(".mp4") || previewItem.key.endsWith(".webm") || previewItem.folder === "videos" ? (
                    <video controls src={previewItem.publicUrl} className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-xs text-neutral-500">
                      Sin vista previa disponible
                    </div>
                  )}
                </div>

                {/* Metadatos */}
                <div className="flex flex-col gap-2 text-xs text-neutral-400 font-mono mb-4">
                  <div className="flex justify-between">
                    <span>Tamaño:</span>
                    <span className="text-brand-cream">{formatSize(previewItem.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carpeta:</span>
                    <span className="text-brand-cream">{previewItem.folder}</span>
                  </div>
                </div>
              </div>

              {/* Botón de acción */}
              {onSelect && (
                <button
                  type="button"
                  onClick={() => {
                    onSelect(previewItem.publicUrl, previewItem);
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#E55427] hover:bg-[#E55427]/80 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Check className="w-4 h-4" />
                  <span>Usar en el Proyecto</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
