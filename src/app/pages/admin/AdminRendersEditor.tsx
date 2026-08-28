import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  ArrowUpDown,
  Check,
  X,
  Edit3,
  Trash2,
  Box,
  Video,
  Layers,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  EyeOff,
  Camera,
  Play,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DragSortableList } from "../../components/admin/DragSortableList";
import { ImageUploader } from "../../components/admin/ImageUploader";
import { TagEditor } from "../../components/admin/TagEditor";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { MediaLibraryModal } from "../../components/admin/MediaLibraryModal";
import { Toast } from "../../components/admin/Toast";
import { RenderItem, RenderProcessStep } from "../../types/cms";
import { useAdminApi } from "../../hooks/useAdminApi";
import { useUpload } from "../../hooks/useUpload";
import { getOptimizedImageUrl } from "../../utils/cloudinary";

type DeviceView = "desktop" | "tablet" | "mobile";
type Lang = "es" | "en";

export function AdminRendersEditor() {
  const [renders, setRenders] = useState<RenderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Lang>("es");
  const [device, setDevice] = useState<DeviceView>("desktop");
  const [cleanPreview, setCleanPreview] = useState(false);
  const [viewMode, setViewMode] = useState<"live" | "list">("live");
  const [isReordering, setIsReordering] = useState(false);

  // Modal Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRender, setEditingRender] = useState<RenderItem | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [stepMediaModalIndex, setStepMediaModalIndex] = useState<number | null>(null);
  const [renderForm, setRenderForm] = useState<Partial<RenderItem>>({
    title: "",
    client: "",
    year: new Date().getFullYear().toString(),
    badge: "STAND · FERIA",
    software: ["Blender", "SketchUp", "AutoCAD"],
    delivery: "Planos técnicos + Renders fotorrealistas",
    description: "",
    img: "",
    videoSrcMp4: "",
    makingOfVideoMp4: "",
    process: [],
  });

  // Modal Borrar
  const [deletingRender, setDeletingRender] = useState<RenderItem | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; open: boolean }>({
    message: "",
    type: "success",
    open: false,
  });

  const { request } = useAdminApi();
  const { uploadImage } = useUpload();
  const [isSaving, setIsSaving] = useState(false);

  const fetchRenders = async () => {
    try {
      setLoading(true);
      const data = await request<RenderItem[]>("/api/admin/renders");
      setRenders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setToast({
        message: "Error al cargar proyectos 3D: " + (err.message || "Fallo de conexión"),
        type: "error",
        open: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenders();
  }, []);

  const handleOpenCreate = () => {
    setEditingRender(null);
    setPendingFile(null);
    setRenderForm({
      title: "",
      client: "Cliente independiente",
      year: new Date().getFullYear().toString(),
      badge: "STAND · FERIA",
      software: ["Blender", "SketchUp", "AutoCAD"],
      delivery: "Planos técnicos + Renders fotorrealistas",
      description: "",
      img: "",
      videoSrcMp4: "",
      makingOfVideoMp4: "",
      process: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: RenderItem) => {
    setEditingRender(item);
    setPendingFile(null);
    setRenderForm({ ...item });
    setIsModalOpen(true);
  };

  const handleSaveRender = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!renderForm.img && !pendingFile) {
      setToast({ message: "Debes asignar una imagen de portada al proyecto 3D", type: "error", open: true });
      return;
    }

    try {
      setIsSaving(true);
      let finalImg = renderForm.img;

      if (pendingFile) {
        const uploadRes = await uploadImage(pendingFile, "miluarte/renders");
        finalImg = uploadRes.secureUrl;
      }

      const payload = {
        ...renderForm,
        img: finalImg,
      };

      if (editingRender) {
        await request("/api/admin/renders", {
          method: "PUT",
          body: JSON.stringify({
            id: editingRender.id,
            ...payload,
          }),
        });
        setToast({ message: "Proyecto 3D actualizado con éxito", type: "success", open: true });
      } else {
        await request("/api/admin/renders", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setToast({ message: "Nuevo proyecto 3D añadido al portfolio", type: "success", open: true });
      }

      setPendingFile(null);
      setIsModalOpen(false);
      fetchRenders();
    } catch (err: any) {
      setToast({ message: err.message || "Error al guardar proyecto 3D", type: "error", open: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRender = async () => {
    if (!deletingRender) return;
    try {
      await request(`/api/admin/renders?id=${deletingRender.id}`, {
        method: "DELETE",
      });
      setToast({ message: `Proyecto "${deletingRender.title}" eliminado`, type: "success", open: true });
      fetchRenders();
    } catch (err: any) {
      setToast({ message: err.message || "Error al eliminar proyecto", type: "error", open: true });
    } finally {
      setDeletingRender(null);
    }
  };

  const handleReorder = async (reordered: RenderItem[]) => {
    const updated = reordered.map((r, idx) => ({ ...r, order: idx }));
    setRenders(updated);
    try {
      await request("/api/admin/renders", {
        method: "PUT",
        body: JSON.stringify({
          reorder: true,
          ids: updated.map((r) => r.id),
        }),
      });
      setToast({ message: "Orden de proyectos 3D actualizado", type: "success", open: true });
    } catch (err: any) {
      setToast({ message: "Error al guardar orden", type: "error", open: true });
      fetchRenders();
    }
  };

  // Helper para añadir paso de proceso
  const handleAddProcessStep = () => {
    const newStep: RenderProcessStep = {
      label: `Paso ${(renderForm.process?.length || 0) + 1}`,
      src: renderForm.img || "",
    };
    setRenderForm((prev) => ({
      ...prev,
      process: [...(prev.process || []), newStep],
    }));
  };

  const headerActions = (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      {/* Selector de idioma */}
      <div className="flex items-center p-1 rounded-xl bg-brand-bg border border-brand-cream/15">
        <button
          type="button"
          onClick={() => setLang("es")}
          className={`px-3 py-1 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            lang === "es"
              ? "bg-brand-blush text-brand-ink shadow-xs font-semibold"
              : "text-brand-cream/60 hover:text-brand-cream"
          }`}
        >
          <span>🇪🇸</span>
          <span>Español</span>
        </button>
        <button
          type="button"
          onClick={() => setLang("en")}
          className={`px-3 py-1 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            lang === "en"
              ? "bg-brand-blush text-brand-ink shadow-xs font-semibold"
              : "text-brand-cream/60 hover:text-brand-cream"
          }`}
        >
          <span>🇬🇧</span>
          <span>English</span>
        </button>
      </div>

      {/* Selector de modo: Live Preview vs Lista */}
      <div className="flex items-center p-1 rounded-xl bg-brand-bg border border-brand-cream/15">
        <button
          type="button"
          onClick={() => setViewMode("live")}
          className={`px-3 py-1 rounded-lg text-xs font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            viewMode === "live"
              ? "bg-brand-blush text-brand-ink font-semibold shadow-xs"
              : "text-brand-cream/60 hover:text-brand-cream"
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Vista Live</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode("list")}
          className={`px-3 py-1 rounded-lg text-xs font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            viewMode === "list"
              ? "bg-brand-blush text-brand-ink font-semibold shadow-xs"
              : "text-brand-cream/60 hover:text-brand-cream"
          }`}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Reordenar</span>
        </button>
      </div>

      {/* Selector de dispositivo */}
      <div className="hidden lg:flex items-center p-1 rounded-xl bg-brand-bg border border-brand-cream/15">
        <button
          type="button"
          onClick={() => setDevice("desktop")}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            device === "desktop" ? "bg-brand-cream/15 text-brand-blush" : "text-brand-cream/50 hover:text-brand-cream"
          }`}
          title="Vista Desktop"
        >
          <Monitor className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setDevice("tablet")}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            device === "tablet" ? "bg-brand-cream/15 text-brand-blush" : "text-brand-cream/50 hover:text-brand-cream"
          }`}
          title="Vista Tablet"
        >
          <Tablet className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setDevice("mobile")}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            device === "mobile" ? "bg-brand-cream/15 text-brand-blush" : "text-brand-cream/50 hover:text-brand-cream"
          }`}
          title="Vista Móvil"
        >
          <Smartphone className="w-4 h-4" />
        </button>
      </div>

      {/* Botón Vista Limpia */}
      <button
        type="button"
        onClick={() => setCleanPreview(!cleanPreview)}
        className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
          cleanPreview
            ? "bg-brand-cream/20 border-brand-cream text-brand-cream font-semibold shadow-xs"
            : "border-brand-cream/15 text-brand-cream/70 hover:text-brand-cream"
        }`}
        title={cleanPreview ? "Mostrar controles" : "Ocultar controles para ver resultado limpio"}
      >
        {cleanPreview ? <EyeOff className="w-3.5 h-3.5 text-brand-blush" /> : <Eye className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{cleanPreview ? "Editar" : "Vista Limpia"}</span>
      </button>

      <a
        href="/renders"
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5 flex items-center gap-1.5 transition-colors no-underline hidden sm:flex"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        <span>Ver pública</span>
      </a>

      <button
        onClick={handleOpenCreate}
        className="px-4 py-1.5 rounded-xl bg-brand-blush hover:bg-brand-cream text-brand-ink text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-md"
      >
        <Plus className="w-4 h-4" />
        <span>Nuevo Proyecto 3D</span>
      </button>
    </div>
  );

  return (
    <AdminLayout
      title="Renders 3D & Stands"
      subtitle={`${renders.length} proyectos 3D · Previsualiza y edita en tiempo real`}
      actions={headerActions}
    >
      {/* Barra informativa */}
      {!cleanPreview && (
        <div className="w-full flex items-center justify-between px-5 py-3 mb-6 bg-brand-dark/90 border border-brand-cream/10 rounded-2xl text-xs font-sans text-brand-cream/70 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-brand-cream">
              Live Preview 3D: Pasa el ratón sobre cualquier proyecto para editar sus datos, vídeos de making-of o pasos de proceso técnico.
            </span>
          </div>
          <span className="font-mono text-[11px] text-brand-blush bg-brand-blush/10 px-2 py-0.5 rounded border border-brand-blush/20">
            Dispositivo: {device.toUpperCase()}
          </span>
        </div>
      )}

      {/* Viewport Responsivo */}
      <div
        className={`w-full mx-auto transition-all duration-300 ${
          device === "mobile"
            ? "max-w-[420px]"
            : device === "tablet"
            ? "max-w-[768px]"
            : "w-full"
        }`}
      >
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[16/9] rounded-2xl bg-brand-dark/50 border border-brand-cream/5 animate-pulse" />
            ))}
          </div>
        ) : renders.length === 0 ? (
          <div className="text-center py-20 bg-brand-dark/50 border border-dashed border-brand-cream/10 rounded-2xl p-8">
            <p className="font-serif italic text-brand-wall text-lg mb-4">No hay proyectos 3D registrados</p>
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 rounded-xl bg-brand-blush text-brand-ink text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              Crear primer proyecto 3D
            </button>
          </div>
        ) : viewMode === "live" ? (
          /* ── MODO 1: Live Preview Grid ── */
          <div
            className={`grid gap-6 ${
              device === "mobile"
                ? "grid-cols-1"
                : device === "tablet"
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 md:grid-cols-2"
            }`}
          >
            {renders.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="group/render relative rounded-2xl overflow-hidden bg-brand-dark border border-brand-cream/15 hover:border-brand-blush/60 shadow-xl transition-all"
              >
                {/* Thumbnail / Portada */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40">
                  <img
                    src={getOptimizedImageUrl(item.img, 800)}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/render:scale-105"
                  />

                  {/* Badge en esquina */}
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-brand-cream/15 text-[9px] font-sans tracking-wider uppercase text-brand-blush">
                    {item.badge || "STAND · 3D"}
                  </div>

                  {/* Video indicator */}
                  {item.makingOfVideoMp4 && (
                    <div className="absolute top-3 right-3 bg-brand-blush text-brand-ink p-1.5 rounded-full shadow-lg pointer-events-none">
                      <Play className="w-3 h-3 fill-brand-ink" />
                    </div>
                  )}

                  {/* Overlay en Hover con Acciones (Ocultable con Vista Limpia) */}
                  {!cleanPreview && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-xs opacity-0 group-hover/render:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="px-4 py-2 rounded-xl bg-brand-blush text-brand-ink font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg hover:bg-brand-cream transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar Proyecto</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingRender(item)}
                        className="p-2 rounded-xl bg-brand-orange/80 hover:bg-brand-orange text-white cursor-pointer shadow-lg transition-colors"
                        title="Eliminar proyecto 3D"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Info Card */}
                <div className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-sans text-brand-cream/50 mb-1.5">
                      <span>{item.client || "Cliente"}</span>
                      <span>{item.year || "2026"}</span>
                    </div>

                    <h3 className="font-serif text-xl text-brand-cream font-light mb-2">
                      {item.title}
                    </h3>

                    <p className="font-sans text-xs text-brand-cream/60 line-clamp-2 leading-relaxed mb-4">
                      {item.description || "Sin descripción"}
                    </p>
                  </div>

                  {/* Software tags */}
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-brand-cream/10">
                    {(item.software || []).map((soft, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-bg text-brand-cream/60 border border-brand-cream/10"
                      >
                        {soft}
                      </span>
                    ))}
                    {item.process && item.process.length > 0 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-blush/15 text-brand-blush border border-brand-blush/25 ml-auto">
                        {item.process.length} pasos técnicos
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* ── MODO 2: Lista Reordenar Drag and Drop ── */
          <DragSortableList
            items={renders}
            enableDrag={true}
            onReorder={handleReorder}
            gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            renderItem={(item) => (
              <div className="rounded-2xl bg-brand-dark border border-brand-cream/15 p-4 flex flex-col justify-between">
                <div>
                  <div className="aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-black/40">
                    <img src={getOptimizedImageUrl(item.img, 400)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-serif text-lg text-brand-cream mb-1">{item.title}</h4>
                  <p className="font-sans text-xs text-brand-cream/50">{item.client} · {item.year}</p>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-brand-cream/10">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="flex-1 py-1.5 rounded-lg bg-brand-cream/10 hover:bg-brand-blush text-brand-cream hover:text-brand-ink text-xs font-semibold uppercase transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeletingRender(item)}
                    className="p-1.5 rounded-lg border border-brand-orange/20 text-brand-orange hover:bg-brand-orange/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          />
        )}
      </div>

      {/* Modal Slide-in Crear / Editar Proyecto 3D */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: 440 }}
                animate={{ x: 0 }}
                exit={{ x: 440 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="w-screen max-w-lg bg-brand-dark border-l border-brand-cream/15 p-6 md:p-8 flex flex-col justify-between overflow-y-auto text-brand-cream shadow-2xl"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-brand-cream/10">
                    <div>
                      <span className="font-sans text-[10px] text-brand-blush uppercase tracking-widest">
                        Renders 3D & Stands
                      </span>
                      <h3 className="font-serif text-2xl text-brand-cream font-light">
                        {editingRender ? "Editar Proyecto 3D" : "Nuevo Proyecto 3D"}
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="p-1 text-brand-cream/40 hover:text-brand-cream cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form id="render-form" onSubmit={handleSaveRender} className="flex flex-col gap-4">
                    {/* Imagen de Portada */}
                    <ImageUploader
                      folder="miluarte/renders"
                      currentImageUrl={renderForm.img}
                      onUploadSuccess={(res) => {
                        setRenderForm((prev) => ({
                          ...prev,
                          img: res.secureUrl,
                        }));
                      }}
                      onFileSelect={(file) => {
                        setPendingFile(file);
                        const localPreview = URL.createObjectURL(file);
                        setRenderForm((prev) => ({
                          ...prev,
                          img: localPreview,
                        }));
                      }}
                    />

                    {/* Título */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                        Título del Proyecto 3D *
                      </label>
                      <input
                        type="text"
                        value={renderForm.title}
                        onChange={(e) => setRenderForm({ ...renderForm, title: e.target.value })}
                        placeholder="Ej: Stand Casa Pasiva"
                        required
                        className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-sm focus:border-brand-blush outline-none"
                      />
                    </div>

                    {/* Cliente y Año */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                          Cliente
                        </label>
                        <input
                          type="text"
                          value={renderForm.client}
                          onChange={(e) => setRenderForm({ ...renderForm, client: e.target.value })}
                          placeholder="Ej: Biopasiv"
                          className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-3 py-2 text-brand-cream text-sm focus:border-brand-blush outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                          Año
                        </label>
                        <input
                          type="text"
                          value={renderForm.year}
                          onChange={(e) => setRenderForm({ ...renderForm, year: e.target.value })}
                          placeholder="2026"
                          className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-3 py-2 text-brand-cream text-sm focus:border-brand-blush outline-none"
                        />
                      </div>
                    </div>

                    {/* Badge y Entrega */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                          Etiqueta / Badge
                        </label>
                        <input
                          type="text"
                          value={renderForm.badge}
                          onChange={(e) => setRenderForm({ ...renderForm, badge: e.target.value })}
                          placeholder="STAND · FERIA"
                          className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-3 py-2 text-brand-cream text-sm focus:border-brand-blush outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                          Tipo de Entrega
                        </label>
                        <input
                          type="text"
                          value={renderForm.delivery}
                          onChange={(e) => setRenderForm({ ...renderForm, delivery: e.target.value })}
                          placeholder="Planos técnicos + Renders"
                          className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-3 py-2 text-brand-cream text-sm focus:border-brand-blush outline-none"
                        />
                      </div>
                    </div>

                    {/* Software Tags */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                        Software Empleado
                      </label>
                      <TagEditor
                        tags={renderForm.software || []}
                        onChange={(tags) => setRenderForm({ ...renderForm, software: tags })}
                        placeholder="Escribe el programa y pulsa Enter (ej: Blender)"
                      />
                    </div>

                    {/* URL de Video Making-Of */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                        URL Vídeo Making-Of (MP4 en Cloudinary)
                      </label>
                      <input
                        type="url"
                        value={renderForm.makingOfVideoMp4 || ""}
                        onChange={(e) => setRenderForm({ ...renderForm, makingOfVideoMp4: e.target.value })}
                        placeholder="https://res.cloudinary.com/.../video.mp4"
                        className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-xs font-mono focus:border-brand-blush outline-none"
                      />
                    </div>

                    {/* Descripción */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                        Descripción del Proyecto
                      </label>
                      <textarea
                        rows={3}
                        value={renderForm.description}
                        onChange={(e) => setRenderForm({ ...renderForm, description: e.target.value })}
                        placeholder="Detalles sobre el diseño del espacio, modelado y requerimientos del cliente..."
                        className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-xs leading-relaxed focus:border-brand-blush outline-none resize-y"
                      />
                    </div>

                    {/* Pasos del Proceso Técnico */}
                    <div className="pt-3 border-t border-brand-cream/10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-sans text-xs uppercase tracking-wider font-medium text-brand-blush">
                          Pasos de Proceso ({renderForm.process?.length || 0})
                        </span>
                        <button
                          type="button"
                          onClick={handleAddProcessStep}
                          className="px-2.5 py-1 rounded-lg bg-brand-cream/10 hover:bg-brand-blush text-brand-cream hover:text-brand-ink text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Añadir Paso</span>
                        </button>
                      </div>

                      <div className="flex flex-col gap-3">
                        {(renderForm.process || []).map((step, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-brand-bg border border-brand-cream/10 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs text-brand-blush font-semibold">Paso {idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setRenderForm((prev) => ({
                                    ...prev,
                                    process: prev.process?.filter((_, i) => i !== idx),
                                  }));
                                }}
                                className="text-brand-orange hover:text-red-400 text-xs p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={step.label}
                              onChange={(e) => {
                                const next = [...(renderForm.process || [])];
                                next[idx] = { ...next[idx], label: e.target.value };
                                setRenderForm({ ...renderForm, process: next });
                              }}
                              placeholder="Nombre del paso (ej: Modelado 3D de la estructura)"
                              className="bg-brand-dark px-3 py-1.5 rounded-lg border border-brand-cream/10 text-xs text-brand-cream outline-none focus:border-brand-blush"
                            />
                            <div className="flex gap-2 items-center">
                              <input
                                type="url"
                                value={step.src}
                                onChange={(e) => {
                                  const next = [...(renderForm.process || [])];
                                  next[idx] = { ...next[idx], src: e.target.value };
                                  setRenderForm({ ...renderForm, process: next });
                                }}
                                placeholder="URL de la imagen del paso en Cloudinary"
                                className="flex-1 bg-brand-dark px-3 py-1.5 rounded-lg border border-brand-cream/10 text-xs text-brand-cream/70 outline-none focus:border-brand-blush font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => setStepMediaModalIndex(idx)}
                                className="px-2.5 py-1.5 rounded-lg bg-brand-cream/10 hover:bg-brand-blush text-brand-cream hover:text-brand-ink text-[10.5px] font-sans font-medium shrink-0 cursor-pointer transition-colors"
                              >
                                Biblioteca
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </form>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-brand-cream/10 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/70 hover:text-brand-cream cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    form="render-form"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-brand-blush hover:bg-brand-cream text-brand-ink text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-brand-ink border-t-transparent rounded-full animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <span>{editingRender ? "Guardar Cambios" : "Publicar Proyecto 3D"}</span>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmación Borrar */}
      <ConfirmDialog
        isOpen={Boolean(deletingRender)}
        onClose={() => setDeletingRender(null)}
        onConfirm={handleDeleteRender}
        title="¿Eliminar este proyecto 3D?"
        description={`¿Estás segura de que deseas eliminar permanentemente "${deletingRender?.title || "este proyecto"}" del catálogo de renders?`}
        confirmText="Eliminar Proyecto"
        destructive={true}
      />

      {/* Modal Biblioteca para Pasos de Proceso */}
      <MediaLibraryModal
        isOpen={stepMediaModalIndex !== null}
        onClose={() => setStepMediaModalIndex(null)}
        onSelect={(selectedUrl) => {
          if (stepMediaModalIndex !== null) {
            const next = [...(renderForm.process || [])];
            next[stepMediaModalIndex] = { ...next[stepMediaModalIndex], src: selectedUrl };
            setRenderForm({ ...renderForm, process: next });
            setStepMediaModalIndex(null);
          }
        }}
        uploadFolder="miluarte/renders"
        title="Biblioteca"
      />

      <Toast
        isOpen={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </AdminLayout>
  );
}
