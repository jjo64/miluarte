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
  Pencil,
  CornerDownRight,
  Sparkles,
  Layers,
  FileImage,
  AlertCircle,
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

const FOLDER_NAMES: Record<string, string> = {
  all: "Todas las fotos",
  "miluarte/inicio": "Inicio / Portada",
  "miluarte/sobre-mi": "Sobre Mí",
  "miluarte/curriculum": "Currículum",
  "miluarte/musae": "Serie Musae",
  "miluarte/diggin": "Galería Diggin",
  "miluarte/animas": "Serie Ánimas",
  "miluarte/animas/bocetos": "Ánimas ❯ Bocetos",
  "miluarte/animas/slides": "Ánimas ❯ Slides",
  "miluarte/retratos": "Galería Retratos",
  "miluarte/pasta-ya": "Galería Pasta Ya",
  "miluarte/renders": "Renders 3D",
  "miluarte/joyeria": "Joyería & Arcilla",
  "miluarte/concept-art": "Concept Art",
  "miluarte/archivo": "Archivo / Respaldos",
  general: "Archivos Generales",
};

function formatFolderLabel(folder: string): string {
  if (FOLDER_NAMES[folder]) return FOLDER_NAMES[folder];
  if (!folder || folder === "general") return "Archivos Generales";
  if (folder === "all") return "Todas las fotos";

  const clean = folder.replace(/^miluarte\/(?:galerias\/)?/i, "").replace(/^miluarte\//i, "");
  if (!clean) return "Miluarte";

  const parts = clean.split("/").filter(Boolean);
  return parts
    .map((p) => {
      const pKey = `miluarte/${p}`;
      if (FOLDER_NAMES[pKey]) return FOLDER_NAMES[pKey].replace(/^(Galería|Serie)\s+/, "");
      return p
        .replace(/[-_]/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    })
    .join(" ❯ ");
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

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameInput, setRenameInput] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);
  const [renameError, setRenameError] = useState("");
  const [renameSuccess, setRenameSuccess] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedAsset) {
      const currentName = selectedAsset.publicId.split("/").pop() || "";
      setRenameInput(currentName);
      setIsRenaming(false);
      setRenameError("");
      setRenameSuccess(false);
    }
  }, [selectedAsset]);

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
      const destFolder = selectedFolder !== "all" && selectedFolder !== "general" ? selectedFolder : uploadFolder;
      const res = await uploadImage(file, destFolder);
      const newAsset: MediaAsset = {
        publicId: res.publicId,
        url: res.secureUrl,
        secureUrl: res.secureUrl,
        folder: destFolder,
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

  const handleRename = async () => {
    if (!selectedAsset || !renameInput.trim()) return;
    try {
      setRenameLoading(true);
      setRenameError("");
      setRenameSuccess(false);

      const res = await request<{ success: boolean; message?: string; asset: MediaAsset }>("/api/admin/media", {
        method: "PATCH",
        body: JSON.stringify({
          fromPublicId: selectedAsset.publicId,
          newFilename: renameInput.trim(),
        }),
      });

      if (res?.asset) {
        const updated = res.asset;
        setAssets((prev) =>
          prev.map((a) => (a.publicId === selectedAsset.publicId ? { ...a, ...updated } : a))
        );
        setSelectedAsset(updated);
        setIsRenaming(false);
        setRenameSuccess(true);
        setTimeout(() => setRenameSuccess(false), 3000);
      }
    } catch (err: any) {
      setRenameError(err.message || "Error al renombrar imagen en Cloudinary");
    } finally {
      setRenameLoading(false);
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
    list.sort((a, b) => a.localeCompare(b));
    return ["all", ...list];
  }, [folderCounts]);

  const filteredAssets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return assets.filter((item) => {
      const filename = item.publicId.split("/").pop() || "";
      const matchesSearch =
        q === "" ||
        item.publicId.toLowerCase().includes(q) ||
        filename.toLowerCase().includes(q) ||
        (item.folder && item.folder.toLowerCase().includes(q));

      const matchesFolder =
        selectedFolder === "all" ||
        (item.folder || "general") === selectedFolder ||
        (item.folder && item.folder.startsWith(`${selectedFolder}/`));

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
                  {assets.length} fotos en Cloudinary
                </span>
              </div>
              <p className="font-sans text-[11px] text-brand-cream/50">
                Catálogo sincronizado con Cloudinary en tiempo real
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
                <span>Explorar</span>
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
            
            <div className="w-full md:w-64 bg-brand-bg/80 border-r border-brand-cream/10 flex flex-col shrink-0 overflow-hidden">
              <div className="p-3.5 border-b border-brand-cream/10 flex items-center justify-between">
                <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-brand-cream/50 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-brand-blush" />
                  <span>Carpetas ({uniqueFolders.length - 1})</span>
                </span>
                <button
                  onClick={fetchMedia}
                  disabled={loading}
                  className="p-1 text-brand-cream/40 hover:text-brand-cream cursor-pointer rounded hover:bg-brand-cream/5"
                  title="Sincronizar con Cloudinary"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin text-brand-blush" : ""}`} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
                {uniqueFolders.map((f) => {
                  const isFolderActive = selectedFolder === f;
                  const count = folderCounts[f] || 0;
                  const label = formatFolderLabel(f);
                  const isSubfolder = f.replace(/^miluarte\//i, "").includes("/");

                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFolder(f)}
                      className={`w-full px-3 py-2 rounded-xl text-left text-xs font-sans transition-all flex items-center justify-between cursor-pointer border ${
                        isSubfolder ? "pl-5" : ""
                      } ${
                        isFolderActive
                          ? "bg-brand-blush/15 text-brand-blush border-brand-blush/30 font-semibold shadow-xs"
                          : "text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isSubfolder ? (
                          <CornerDownRight className="w-3 h-3 text-brand-blush/70 shrink-0" />
                        ) : isFolderActive ? (
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
                    placeholder={`Buscar por nombre de obra en ${formatFolderLabel(selectedFolder).toLowerCase()}...`}
                    className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl pl-9 pr-8 py-2 text-xs text-brand-cream focus:border-brand-blush outline-none placeholder:text-brand-cream/30"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-cream/40 hover:text-brand-cream text-xs cursor-pointer"
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
                    <span className="text-xs font-sans">Sincronizando con Cloudinary...</span>
                  </div>
                ) : filteredAssets.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-brand-cream/40 p-8 text-center">
                    <Images className="w-12 h-12 opacity-30" />
                    <p className="text-sm font-medium text-brand-cream/70">No se encontraron imágenes</p>
                    <p className="text-xs max-w-xs text-brand-cream/40">
                      {searchQuery
                        ? "No hay resultados para tu búsqueda de nombre. Prueba con otro término."
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
                      const rawFilename = asset.publicId.split("/").pop() || asset.publicId;

                      return (
                        <div
                          key={asset.secureUrl || asset.publicId}
                          onClick={() => setSelectedAsset(asset)}
                          onDoubleClick={() => {
                            setSelectedAsset(asset);
                            onSelect(asset.secureUrl || asset.url, asset.publicId);
                            onClose();
                          }}
                          className={`group relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer bg-brand-bg flex flex-col justify-end ${
                            isSelected
                              ? "border-brand-blush ring-2 ring-brand-blush/30 shadow-xl shadow-brand-blush/10 scale-[0.98]"
                              : "border-brand-cream/10 hover:border-brand-cream/30 hover:scale-[1.02]"
                          }`}
                        >
                          <img
                            src={getOptimizedImageUrl(asset.secureUrl || asset.url, 280)}
                            alt={rawFilename}
                            onError={(e) => {
                              const target = e.currentTarget;
                              const rawUrl = asset.secureUrl || asset.url;
                              if (target.src !== rawUrl) {
                                target.src = rawUrl;
                              }
                            }}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />

                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-brand-blush text-brand-ink flex items-center justify-center shadow-lg z-10 animate-scale-in">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}

                          {asset.folder && (
                            <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-[9px] font-mono text-brand-cream/90 truncate max-w-[70%] border border-white/10 z-10">
                              {asset.folder.split("/").pop()}
                            </span>
                          )}

                          <div className="relative z-10 w-full p-2 bg-gradient-to-t from-black/95 via-black/75 to-transparent flex flex-col">
                            <span
                              className="text-[11px] font-sans font-medium text-brand-cream truncate drop-shadow-sm group-hover:text-brand-blush transition-colors"
                              title={rawFilename}
                            >
                              {rawFilename}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full md:w-80 bg-brand-bg/85 p-5 flex flex-col justify-between shrink-0 overflow-y-auto border-t md:border-t-0 md:border-l border-brand-cream/10">
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
                      title="Abrir imagen original en Cloudinary"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-brand-cream/15 aspect-square bg-brand-dark shadow-md relative group">
                    <img
                      src={getOptimizedImageUrl(selectedAsset.secureUrl || selectedAsset.url, 500)}
                      alt=""
                      onError={(e) => {
                        const target = e.currentTarget;
                        const rawUrl = selectedAsset.secureUrl || selectedAsset.url;
                        if (target.src !== rawUrl) {
                          target.src = rawUrl;
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {renameSuccess && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>¡Nombre actualizado en Cloudinary!</span>
                    </div>
                  )}

                  {renameError && (
                    <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="break-words">{renameError}</span>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-brand-dark/70 border border-brand-cream/15 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-brand-cream/50 uppercase font-mono tracking-wider">
                        Nombre de la obra
                      </span>
                      {!isRenaming ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsRenaming(true);
                            setRenameInput(selectedAsset.publicId.split("/").pop() || "");
                          }}
                          className="text-xs font-sans text-brand-blush hover:text-brand-cream flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Renombrar</span>
                        </button>
                      ) : null}
                    </div>

                    {isRenaming ? (
                      <div className="flex flex-col gap-2 mt-1">
                        <input
                          type="text"
                          value={renameInput}
                          onChange={(e) => setRenameInput(e.target.value)}
                          placeholder="Nuevo nombre de la obra..."
                          className="w-full bg-brand-bg border border-brand-blush/60 rounded-lg px-2.5 py-1.5 text-xs text-brand-cream outline-none focus:ring-1 focus:ring-brand-blush font-sans"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRename();
                            if (e.key === "Escape") setIsRenaming(false);
                          }}
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setIsRenaming(false)}
                            disabled={renameLoading}
                            className="px-2 py-1 rounded text-xs text-brand-cream/60 hover:text-brand-cream hover:bg-brand-cream/5 cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleRename}
                            disabled={renameLoading || !renameInput.trim()}
                            className="px-3 py-1 rounded-lg bg-brand-blush text-brand-ink text-xs font-semibold hover:bg-brand-cream transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                          >
                            {renameLoading ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            <span>Guardar</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-brand-cream font-sans font-medium text-xs break-all leading-tight">
                        {selectedAsset.publicId.split("/").pop()}
                      </p>
                    )}

                    <div className="pt-2 border-t border-brand-cream/10 mt-1 flex flex-col gap-1 text-[11px] text-brand-cream/60">
                      <div className="flex items-center justify-between">
                        <span>Ruta Cloudinary:</span>
                        <span className="font-mono text-[10px] text-brand-cream/80 truncate max-w-[140px]" title={selectedAsset.publicId}>
                          {selectedAsset.publicId}
                        </span>
                      </div>
                      {selectedAsset.folder && (
                        <div className="flex items-center justify-between">
                          <span>Carpeta:</span>
                          <span className="font-mono text-brand-blush truncate max-w-[140px]">
                            {formatFolderLabel(selectedAsset.folder)}
                          </span>
                        </div>
                      )}
                      {selectedAsset.width && selectedAsset.height && (
                        <div className="flex items-center justify-between">
                          <span>Dimensiones:</span>
                          <span className="font-mono text-brand-cream/80">
                            {selectedAsset.width} × {selectedAsset.height} px
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-brand-cream/40 gap-3 py-8">
                  <div className="w-12 h-12 rounded-2xl bg-brand-cream/5 flex items-center justify-center text-brand-cream/30">
                    <Images className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-sans max-w-[180px]">
                    Haz clic en cualquier imagen para previsualizarla, renombrarla en Cloudinary o seleccionarla
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
                  {isUploading ? "Subiendo a Cloudinary..." : "Arrastra o haz clic para subir"}
                </h3>
                <p className="font-sans text-xs text-brand-cream/50 max-w-sm">
                  Se subirá directamente a la carpeta <strong className="text-brand-blush">{formatFolderLabel(selectedFolder !== "all" ? selectedFolder : uploadFolder)}</strong> de Cloudinary y estará disponible para reutilizar en cualquier momento.
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
