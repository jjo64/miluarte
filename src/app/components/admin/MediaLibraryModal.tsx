import { useState, useRef, useEffect, useMemo } from "react";
import {
  Images,
  Upload,
  Search,
  Check,
  X,
  ExternalLink,
  Folder,
  FolderOpen,
  RefreshCw,
} from "lucide-react";
import { useAdminApi } from "../../hooks/useAdminApi";
import { useUpload } from "../../hooks/useUpload";
import { getOptimizedImageUrl } from "../../utils/cloudinary";

export interface MediaAsset {
  publicId: string;
  url: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format?: string;
  createdAt?: string;
  folder?: string;
  source?: "cloudinary" | "database";
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, publicId?: string) => void;
  initialSelectedUrl?: string;
  uploadFolder?: string;
  title?: string;
}

const FOLDER_NAMES: Record<string, { label: string; icon?: string }> = {
  all: { label: "Todas las fotos" },
  "miluarte/ilustracion": { label: "Ilustración" },
  "miluarte/concept-art": { label: "Concept Art" },
  "miluarte/animas": { label: "Serie Ánimas" },
  "miluarte/animas-bible": { label: "Biblia de Ánimas" },
  "miluarte/renders": { label: "Renders 3D" },
  "miluarte/about": { label: "Sobre Mí" },
  "miluarte/cv": { label: "Currículum" },
  "miluarte/home": { label: "Inicio & Hero" },
  "miluarte/gallery": { label: "Galerías de Arte" },
  portfolio: { label: "Portafolio General" },
  general: { label: "Archivos Generales" },
};

function formatFolderLabel(folder: string): string {
  if (FOLDER_NAMES[folder]) return FOLDER_NAMES[folder].label;
  const clean = folder.replace(/^miluarte\//, "");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  initialSelectedUrl,
  uploadFolder = "miluarte",
  title = "Biblioteca",
}: MediaLibraryModalProps) {
  const { request } = useAdminApi();
  const { uploadImage } = useUpload();

  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const data = await request<MediaAsset[]>("/api/admin/media");
      if (Array.isArray(data)) {
        setAssets(data);
        if (initialSelectedUrl) {
          const match = data.find(
            (a) => a.secureUrl === initialSelectedUrl || a.url === initialSelectedUrl
          );
          if (match) setSelectedAsset(match);
        }
      }
    } catch (e) {
      console.warn("Error al cargar la biblioteca:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const res = await uploadImage(file, uploadFolder);
      const newAsset: MediaAsset = {
        publicId: res.publicId,
        url: res.secureUrl,
        secureUrl: res.secureUrl,
        folder: uploadFolder,
        source: "cloudinary",
      };
      setAssets((prev) => [newAsset, ...prev]);
      setSelectedAsset(newAsset);
      setActiveTab("library");
    } catch (err: any) {
      alert("Error al subir archivo: " + (err.message || "Error desconocido"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: assets.length };
    for (const a of assets) {
      const f = a.folder || "general";
      counts[f] = (counts[f] || 0) + 1;
    }
    return counts;
  }, [assets]);

  const uniqueFolders = useMemo(() => {
    const list = Object.keys(folderCounts).filter((f) => f !== "all");
    list.sort((a, b) => (folderCounts[b] || 0) - (folderCounts[a] || 0));
    return ["all", ...list];
  }, [folderCounts]);

  const filteredAssets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return assets.filter((item) => {
      const filename = (item.secureUrl || item.url || "").split("/").pop() || "";
      const matchesSearch =
        q === "" ||
        item.publicId.toLowerCase().includes(q) ||
        filename.toLowerCase().includes(q) ||
        (item.folder && item.folder.toLowerCase().includes(q));

      const matchesFolder =
        selectedFolder === "all" || (item.folder || "general") === selectedFolder;

      return matchesSearch && matchesFolder;
    });
  }, [assets, searchQuery, selectedFolder]);

  const handleConfirmSelect = () => {
    if (selectedAsset) {
      onSelect(selectedAsset.secureUrl || selectedAsset.url, selectedAsset.publicId);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-6xl h-[90vh] max-h-[820px] bg-brand-dark border border-brand-cream/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-brand-cream">
        
        <div className="px-6 py-4 border-b border-brand-cream/10 flex items-center justify-between bg-brand-bg/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-blush/20 text-brand-blush flex items-center justify-center border border-brand-blush/30 shadow-xs">
              <Images className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-light text-brand-cream leading-tight">
                  {title}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-blush/10 text-brand-blush border border-brand-blush/20">
                  {assets.length} archivos
                </span>
              </div>
              <p className="font-sans text-[11px] text-brand-cream/50">
                Selecciona cualquier imagen existente del catálogo o sube una nueva
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-brand-bg border border-brand-cream/15">
              <button
                type="button"
                onClick={() => setActiveTab("library")}
                className={`px-4 py-1.5 rounded-lg text-xs font-sans transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "library"
                    ? "bg-brand-blush text-brand-ink font-semibold shadow-xs"
                    : "text-brand-cream/60 hover:text-brand-cream"
                }`}
              >
                <Images className="w-3.5 h-3.5" />
                <span>Explorar ({assets.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`px-4 py-1.5 rounded-lg text-xs font-sans transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "upload"
                    ? "bg-brand-blush text-brand-ink font-semibold shadow-xs"
                    : "text-brand-cream/60 hover:text-brand-cream"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Subir Nueva</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-brand-cream/50 hover:text-brand-cream hover:bg-brand-cream/10 transition-colors cursor-pointer border-none bg-transparent"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeTab === "library" ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            <div className="w-full md:w-60 bg-brand-bg/80 border-r border-brand-cream/10 flex flex-col shrink-0 overflow-hidden">
              <div className="p-3.5 border-b border-brand-cream/10 flex items-center justify-between">
                <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-brand-cream/50 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-brand-blush" />
                  <span>Carpetas ({uniqueFolders.length - 1})</span>
                </span>
                <button
                  onClick={fetchMedia}
                  disabled={loading}
                  className="p-1 text-brand-cream/40 hover:text-brand-cream cursor-pointer rounded hover:bg-brand-cream/5"
                  title="Recargar archivos"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin text-brand-blush" : ""}`} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
                {uniqueFolders.map((f) => {
                  const isFolderActive = selectedFolder === f;
                  const count = folderCounts[f] || 0;
                  const label = formatFolderLabel(f);

                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFolder(f)}
                      className={`w-full px-3 py-2 rounded-xl text-left text-xs font-sans transition-all flex items-center justify-between cursor-pointer border ${
                        isFolderActive
                          ? "bg-brand-blush/15 text-brand-blush border-brand-blush/30 font-semibold shadow-xs"
                          : "text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isFolderActive ? (
                          <FolderOpen className="w-3.5 h-3.5 text-brand-blush shrink-0" />
                        ) : (
                          <Folder className="w-3.5 h-3.5 text-brand-cream/40 shrink-0" />
                        )}
                        <span className="truncate">{label}</span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0 ml-1.5 ${
                          isFolderActive
                            ? "bg-brand-blush text-brand-ink font-semibold"
                            : "bg-brand-dark/80 text-brand-cream/50"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              
              <div className="p-3.5 border-b border-brand-cream/10 bg-brand-bg/30 flex items-center justify-between gap-3 shrink-0">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-brand-cream/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Buscar en ${formatFolderLabel(selectedFolder).toLowerCase()}...`}
                    className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl pl-9 pr-8 py-2 text-xs text-brand-cream focus:border-brand-blush outline-none placeholder:text-brand-cream/30"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-cream/40 hover:text-brand-cream text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                <span className="text-[11px] font-sans text-brand-cream/50 shrink-0 hidden sm:inline-block">
                  Mostrando <strong className="text-brand-cream">{filteredAssets.length}</strong> de {assets.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-brand-cream/50">
                    <div className="w-7 h-7 border-2 border-brand-blush border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-sans">Cargando biblioteca de imágenes...</span>
                  </div>
                ) : filteredAssets.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-brand-cream/40 p-8 text-center">
                    <Images className="w-12 h-12 opacity-30" />
                    <p className="text-sm font-medium text-brand-cream/70">No se encontraron imágenes</p>
                    <p className="text-xs max-w-xs text-brand-cream/40">
                      {searchQuery
                        ? "No hay resultados para tu búsqueda. Prueba con otro término."
                        : `No hay imágenes en la carpeta "${formatFolderLabel(selectedFolder)}".`}
                    </p>
                    <button
                      onClick={() => setActiveTab("upload")}
                      className="mt-2 px-4 py-2 rounded-xl bg-brand-blush text-brand-ink text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-brand-cream transition-colors"
                    >
                      Subir archivo aquí
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
                    {filteredAssets.map((asset) => {
                      const isSelected = selectedAsset?.secureUrl === asset.secureUrl;
                      const displayName = asset.publicId.split("/").pop() || asset.publicId;

                      return (
                        <div
                          key={asset.secureUrl || asset.publicId}
                          onClick={() => setSelectedAsset(asset)}
                          onDoubleClick={() => {
                            setSelectedAsset(asset);
                            onSelect(asset.secureUrl || asset.url, asset.publicId);
                            onClose();
                          }}
                          className={`group relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer bg-brand-bg ${
                            isSelected
                              ? "border-brand-blush ring-2 ring-brand-blush/30 shadow-xl shadow-brand-blush/10 scale-[0.98]"
                              : "border-brand-cream/10 hover:border-brand-cream/30 hover:scale-[1.02]"
                          }`}
                        >
                          <img
                            src={getOptimizedImageUrl(asset.secureUrl || asset.url, 280)}
                            alt={displayName}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />

                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-brand-blush text-brand-ink flex items-center justify-center shadow-lg">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}

                          {asset.folder && (
                            <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[9px] font-mono text-brand-cream/80 truncate max-w-[85%] border border-white/5">
                              {formatFolderLabel(asset.folder)}
                            </span>
                          )}

                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-sans font-semibold text-brand-cream bg-black/60 px-2 py-1 rounded-md backdrop-blur-xs">
                              {isSelected ? "Seleccionada" : "Clic para ver"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full md:w-72 bg-brand-bg/85 p-5 flex flex-col justify-between shrink-0 overflow-y-auto border-t md:border-t-0 md:border-l border-brand-cream/10">
              {selectedAsset ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-brand-cream/10">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-brand-blush font-semibold">
                      Detalle de Imagen
                    </span>
                    <a
                      href={selectedAsset.secureUrl || selectedAsset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-cream/40 hover:text-brand-cream p-1 rounded hover:bg-brand-cream/5"
                      title="Abrir imagen original a tamaño completo"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-brand-cream/15 aspect-square bg-brand-dark shadow-md">
                    <img
                      src={getOptimizedImageUrl(selectedAsset.secureUrl || selectedAsset.url, 500)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col gap-2 font-sans text-xs">
                    <div className="p-2.5 rounded-lg bg-brand-dark/60 border border-brand-cream/10">
                      <p className="text-[10px] text-brand-cream/40 uppercase mb-0.5 font-mono">Nombre / ID</p>
                      <p className="text-brand-cream break-all font-mono text-[11px] leading-tight">
                        {selectedAsset.publicId}
                      </p>
                    </div>

                    {selectedAsset.folder && (
                      <div className="flex items-center justify-between text-brand-cream/70 text-[11px] px-1">
                        <span className="text-brand-cream/40">Carpeta:</span>
                        <span className="font-mono text-brand-blush">{formatFolderLabel(selectedAsset.folder)}</span>
                      </div>
                    )}

                    {selectedAsset.width && selectedAsset.height ? (
                      <div className="flex items-center justify-between text-brand-cream/70 text-[11px] px-1">
                        <span className="text-brand-cream/40">Resolución:</span>
                        <span className="font-mono text-brand-cream">
                          {selectedAsset.width} × {selectedAsset.height} px
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-brand-cream/40 gap-3 py-8">
                  <div className="w-12 h-12 rounded-2xl bg-brand-cream/5 flex items-center justify-center text-brand-cream/30">
                    <Images className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-sans max-w-[180px]">
                    Haz clic en cualquier imagen para previsualizarla y aplicarla
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-brand-cream/10 mt-auto">
                <button
                  type="button"
                  onClick={handleConfirmSelect}
                  disabled={!selectedAsset}
                  className="w-full py-3 rounded-xl bg-brand-blush hover:bg-brand-cream text-brand-ink text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Usar Esta Imagen</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 sm:p-10 flex flex-col items-center justify-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f);
              }}
              accept="image/*"
              className="hidden"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFileUpload(f);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full max-w-lg p-10 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-brand-blush bg-brand-blush/10 scale-102"
                  : "border-brand-cream/20 hover:border-brand-blush/60 bg-brand-bg/50"
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-blush/10 text-brand-blush flex items-center justify-center border border-brand-blush/30">
                {isUploading ? (
                  <div className="w-6 h-6 border-2 border-brand-blush border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </div>

              <div>
                <h3 className="font-serif text-xl font-light text-brand-cream mb-1">
                  {isUploading ? "Subiendo a la biblioteca..." : "Arrastra o haz clic para subir"}
                </h3>
                <p className="font-sans text-xs text-brand-cream/50 max-w-sm">
                  Soporta JPG, PNG, WebP o AVIF en alta resolución. Se optimizará y quedará guardada en la biblioteca para reutilizarla cuando quieras.
                </p>
              </div>

              <div className="px-4 py-2 rounded-xl bg-brand-blush text-brand-ink text-xs font-semibold uppercase tracking-wider shadow-sm">
                Seleccionar archivo local
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
