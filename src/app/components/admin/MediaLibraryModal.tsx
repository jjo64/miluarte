import { useState, useEffect, useRef } from "react";
import {
  X,
  Search,
  Upload,
  Images,
  Check,
  Folder,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
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
  onSelect: (selectedUrl: string, publicId?: string) => void;
  initialSelectedUrl?: string;
  uploadFolder?: string;
  title?: string;
}

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  initialSelectedUrl,
  uploadFolder = "miluarte",
  title = "Biblioteca de Medios",
}: MediaLibraryModalProps) {
  const { request } = useAdminApi();
  const { uploadImage } = useUpload();

  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  // Subida
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
          const match = data.find((a) => a.secureUrl === initialSelectedUrl || a.url === initialSelectedUrl);
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
      // Seleccionar automáticamente y cambiar a pestaña biblioteca
      setActiveTab("library");
    } catch (err: any) {
      alert("Error al subir archivo: " + (err.message || "Error desconocido"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  // Extraer carpetas únicas para el filtro
  const folders = Array.from(new Set(assets.map((a) => a.folder || "general").filter(Boolean)));

  // Filtrar activos
  const filteredAssets = assets.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
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

  const handleConfirmSelect = () => {
    if (selectedAsset) {
      onSelect(selectedAsset.secureUrl || selectedAsset.url, selectedAsset.publicId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-5xl h-[85vh] max-h-[780px] bg-brand-dark border border-brand-cream/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-brand-cream">
        
        {/* ── Modal Header ── */}
        <div className="px-6 py-4 border-b border-brand-cream/10 flex items-center justify-between bg-brand-bg/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-blush/20 text-brand-blush flex items-center justify-center border border-brand-blush/30">
              <Images className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-light text-brand-cream leading-tight">
                {title}
              </h2>
              <p className="font-sans text-[10px] text-brand-cream/50 uppercase tracking-widest">
                Reutiliza imágenes existentes o sube un archivo nuevo
              </p>
            </div>
          </div>

          {/* Selector de pestañas */}
          <div className="flex items-center p-1 rounded-xl bg-brand-bg border border-brand-cream/15">
            <button
              type="button"
              onClick={() => setActiveTab("library")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "library"
                  ? "bg-brand-blush text-brand-ink font-semibold shadow-xs"
                  : "text-brand-cream/60 hover:text-brand-cream"
              }`}
            >
              <Images className="w-3.5 h-3.5" />
              <span>Biblioteca ({assets.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
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
            className="p-1.5 rounded-lg text-brand-cream/50 hover:text-brand-cream hover:bg-brand-cream/10 transition-colors cursor-pointer border-none bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Modal Body ── */}
        {activeTab === "library" ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Left: Gallery Grid + Filters */}
            <div className="flex-1 flex flex-col overflow-hidden border-r border-brand-cream/10">
              
              {/* Search and Filters Bar */}
              <div className="p-4 border-b border-brand-cream/10 bg-brand-bg/30 flex flex-wrap gap-3 items-center justify-between shrink-0">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-brand-cream/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre o carpeta..."
                    className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl pl-9 pr-4 py-2 text-xs text-brand-cream focus:border-brand-blush outline-none"
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

                {/* Folder filter */}
                {folders.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-brand-cream/40" />
                    <select
                      value={selectedFolder}
                      onChange={(e) => setSelectedFolder(e.target.value)}
                      className="bg-brand-bg border border-brand-cream/15 rounded-xl px-3 py-2 text-xs text-brand-cream outline-none focus:border-brand-blush cursor-pointer"
                    >
                      <option value="all">Todas las carpetas</option>
                      {folders.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Grid content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-brand-cream/50">
                    <div className="w-6 h-6 border-2 border-brand-blush border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Cargando biblioteca de imágenes...</span>
                  </div>
                ) : filteredAssets.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-brand-cream/40 p-8 text-center">
                    <Images className="w-10 h-10 opacity-40" />
                    <p className="text-sm font-medium">No se encontraron imágenes</p>
                    <p className="text-xs max-w-xs">
                      {searchQuery
                        ? "Prueba con otro término de búsqueda o limpia el filtro."
                        : "Sube tu primera imagen usando la pestaña 'Subir Nueva'."}
                    </p>
                    <button
                      onClick={() => setActiveTab("upload")}
                      className="mt-2 px-4 py-2 rounded-xl bg-brand-blush text-brand-ink text-xs font-semibold uppercase tracking-wider cursor-pointer"
                    >
                      Subir archivo ahora
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
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
                              ? "border-brand-blush shadow-lg shadow-brand-blush/20 scale-[0.98]"
                              : "border-brand-cream/10 hover:border-brand-cream/30 hover:scale-[1.02]"
                          }`}
                        >
                          <img
                            src={getOptimizedImageUrl(asset.secureUrl || asset.url, 250)}
                            alt={displayName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />

                          {/* Selected check badge */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-brand-blush text-brand-ink flex items-center justify-center shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}

                          {/* Folder badge */}
                          {asset.folder && (
                            <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-mono text-brand-cream/80 truncate max-w-[80%]">
                              {asset.folder.split("/").pop()}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Selected Asset Preview Sidebar */}
            <div className="w-full md:w-72 bg-brand-bg/70 p-5 flex flex-col justify-between shrink-0 overflow-y-auto border-t md:border-t-0 border-brand-cream/10">
              {selectedAsset ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-brand-blush font-semibold">
                      Detalle de Imagen
                    </span>
                    <a
                      href={selectedAsset.secureUrl || selectedAsset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-cream/40 hover:text-brand-cream"
                      title="Abrir imagen original"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Thumbnail preview */}
                  <div className="rounded-xl overflow-hidden border border-brand-cream/15 aspect-square bg-brand-dark">
                    <img
                      src={getOptimizedImageUrl(selectedAsset.secureUrl || selectedAsset.url, 500)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Meta properties */}
                  <div className="flex flex-col gap-2 font-sans text-xs">
                    <div className="p-2.5 rounded-lg bg-brand-dark/50 border border-brand-cream/10">
                      <p className="text-[10px] text-brand-cream/40 uppercase mb-0.5 font-mono">Nombre / ID</p>
                      <p className="text-brand-cream break-all font-mono text-[11px] leading-tight">
                        {selectedAsset.publicId}
                      </p>
                    </div>

                    {selectedAsset.folder && (
                      <div className="flex items-center justify-between text-brand-cream/70 text-[11px]">
                        <span className="text-brand-cream/40">Carpeta:</span>
                        <span className="font-mono">{selectedAsset.folder}</span>
                      </div>
                    )}

                    {selectedAsset.width && selectedAsset.height && (
                      <div className="flex items-center justify-between text-brand-cream/70 text-[11px]">
                        <span className="text-brand-cream/40">Dimensiones:</span>
                        <span className="font-mono">
                          {selectedAsset.width} × {selectedAsset.height} px
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-brand-cream/40 gap-2 py-8">
                  <Images className="w-8 h-8 opacity-30" />
                  <p className="text-xs">Selecciona una imagen para ver sus detalles y aplicarla</p>
                </div>
              )}

              {/* Bottom Apply Action */}
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
          /* ── Tab: Subir Nueva Imagen ── */
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
                  Soporta JPG, PNG, WebP o AVIF en alta resolución. Se optimizará y quedará disponible para reutilizar en cualquier momento.
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
