import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Plus,
  ArrowUpDown,
  Check,
  X,
  ExternalLink,
  Star,
  Edit3,
  Trash2,
  LayoutGrid,
  Save,
  RotateCcw,
  Sparkles,
  Maximize2,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { WorkCard } from "../../components/admin/WorkCard";
import { DragSortableList } from "../../components/admin/DragSortableList";
import { ImageUploader } from "../../components/admin/ImageUploader";
import { CardResizer } from "../../components/admin/CardResizer";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { Toast } from "../../components/admin/Toast";
import { GalleryMeta, Work } from "../../types/cms";
import { useAdminApi } from "../../hooks/useAdminApi";
import { useUpload } from "../../hooks/useUpload";
import { getOptimizedImageUrl } from "../../utils/cloudinary";

const COL_OPTIONS = [
  { value: "md:col-span-1", span: 1, label: "1 Col" },
  { value: "md:col-span-2", span: 2, label: "2 Col" },
  { value: "md:col-span-3", span: 3, label: "3 Col" },
];

const ASPECT_OPTIONS = [
  { value: "3/4", label: "3:4", icon: RectangleVertical },
  { value: "1/1", label: "1:1", icon: Square },
  { value: "3/2", label: "3:2", icon: RectangleHorizontal },
  { value: "16/9", label: "16:9", icon: Maximize2 },
];

export function AdminGalleryEditor() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { request } = useAdminApi();

  const [gallery, setGallery] = useState<GalleryMeta | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [serverWorks, setServerWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"puzzle" | "list">("puzzle");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSavingBatch, setIsSavingBatch] = useState(false);

  // Panel lateral de edición / creación
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [workForm, setWorkForm] = useState<Partial<Work>>({
    title: "",
    year: new Date().getFullYear().toString(),
    technique: "Acrílico sobre lienzo",
    size: "50 × 70 cm",
    img: "",
    publicId: "",
    imgPos: "50% 30%",
    gridCol: "md:col-span-1",
    aspect: "3/4",
    featured: false,
  });

  // Modal borrar obra
  const [deletingWork, setDeletingWork] = useState<Work | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; open: boolean }>({
    message: "",
    type: "success",
    open: false,
  });

  const fetchGalleryAndWorks = async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const [allGalleries, worksData] = await Promise.all([
        request<GalleryMeta[]>("/api/admin/galleries"),
        request<Work[]>(`/api/admin/works?slug=${slug}`),
      ]);

      const current = allGalleries.find((g) => g.slug === slug);
      setGallery(current || null);
      const safeWorks = Array.isArray(worksData) ? worksData : [];
      setWorks(safeWorks);
      setServerWorks(safeWorks);
      setHasChanges(false);
    } catch (err: any) {
      setToast({
        message: "Error al cargar obras: " + (err.message || "Fallo de conexión"),
        type: "error",
        open: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryAndWorks();
  }, [slug]);

  // Actualizar tamaño (col-span y aspect) de una obra directamente en el mosaico en vivo
  const handleUpdateWorkLayout = (workId: string, updates: { gridCol?: string; aspect?: string; imgPos?: string; featured?: boolean }) => {
    setWorks((prev) =>
      prev.map((w) => {
        if (w.id === workId) {
          return { ...w, ...updates };
        }
        return w;
      })
    );
    setHasChanges(true);
  };

  // Guardar todo el diseño del puzzle en la base de datos
  const handleSaveBatchLayout = async () => {
    if (!slug) return;
    try {
      setIsSavingBatch(true);
      await request(`/api/admin/works?slug=${slug}`, {
        method: "PUT",
        body: JSON.stringify({ works }),
      });
      setServerWorks(JSON.parse(JSON.stringify(works)));
      setHasChanges(false);
      setToast({
        message: "¡Diseño de mosaico guardado y publicado en el portafolio!",
        type: "success",
        open: true,
      });
    } catch (err: any) {
      setToast({
        message: err.message || "Error al guardar el diseño de la galería",
        type: "error",
        open: true,
      });
    } finally {
      setIsSavingBatch(false);
    }
  };

  // Descartar cambios de tamaño
  const handleDiscardChanges = () => {
    setWorks(JSON.parse(JSON.stringify(serverWorks)));
    setHasChanges(false);
    setToast({
      message: "Cambios de tamaño descartados.",
      type: "success",
      open: true,
    });
  };

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { uploadImage } = useUpload();

  const handleOpenAdd = () => {
    setEditingWork(null);
    setPendingFile(null);
    setWorkForm({
      title: "",
      year: new Date().getFullYear().toString(),
      technique: "Acrílico sobre lienzo",
      size: "50 × 70 cm",
      img: "",
      publicId: "",
      imgPos: "50% 30%",
      gridCol: "md:col-span-1",
      aspect: "3/4",
      featured: false,
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (work: Work) => {
    setEditingWork(work);
    setPendingFile(null);
    setWorkForm({ ...work });
    setIsDrawerOpen(true);
  };

  const handleSaveWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;

    if (!workForm.img && !pendingFile) {
      setToast({ message: "Debes seleccionar o asignar una imagen a la obra", type: "error", open: true });
      return;
    }

    try {
      setIsSaving(true);
      let finalImg = workForm.img;
      let finalPublicId = workForm.publicId;

      if (pendingFile) {
        const uploadRes = await uploadImage(pendingFile, `miluarte/${slug || "general"}`);
        finalImg = uploadRes.secureUrl;
        finalPublicId = uploadRes.publicId;
      }

      const payload = {
        ...workForm,
        img: finalImg,
        publicId: finalPublicId,
      };

      if (editingWork) {
        await request(`/api/admin/works?slug=${slug}`, {
          method: "PUT",
          body: JSON.stringify({
            id: editingWork.id,
            ...payload,
          }),
        });
        setToast({ message: "Obra actualizada correctamente", type: "success", open: true });
      } else {
        await request(`/api/admin/works?slug=${slug}`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setToast({ message: "Nueva obra guardada y añadida a la galería", type: "success", open: true });
      }

      setPendingFile(null);
      setIsDrawerOpen(false);
      fetchGalleryAndWorks();
    } catch (err: any) {
      setToast({ message: err.message || "Error al guardar obra", type: "error", open: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWork = async () => {
    if (!slug || !deletingWork) return;

    try {
      await request(`/api/admin/works?slug=${slug}&id=${deletingWork.id}`, {
        method: "DELETE",
      });
      setToast({ message: `Obra "${deletingWork.title}" eliminada`, type: "success", open: true });
      fetchGalleryAndWorks();
    } catch (err: any) {
      setToast({ message: err.message || "Error al eliminar obra", type: "error", open: true });
    } finally {
      setDeletingWork(null);
    }
  };

  const handleReorder = async (reordered: Work[]) => {
    setWorks(reordered);
    if (!slug) return;
    try {
      await request(`/api/admin/works?slug=${slug}`, {
        method: "PUT",
        body: JSON.stringify({
          reorder: true,
          ids: reordered.map((w) => w.id),
        }),
      });
      setToast({ message: "Orden de obras actualizado", type: "success", open: true });
    } catch (err: any) {
      setToast({ message: "Error al guardar el orden", type: "error", open: true });
      fetchGalleryAndWorks();
    }
  };

  const headerActions = (
    <div className="flex items-center gap-2.5 flex-wrap justify-end">
      <button
        onClick={() => navigate("/admin/galerias")}
        className="px-3 py-1.5 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5 flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Volver</span>
      </button>

      {/* Selector de modo: Puzzle Muro Live vs Lista Reordenar */}
      <div className="flex items-center p-1 rounded-xl bg-brand-bg border border-brand-cream/15">
        <button
          type="button"
          onClick={() => setViewMode("puzzle")}
          className={`px-3 py-1 rounded-lg text-xs font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            viewMode === "puzzle"
              ? "bg-brand-blush text-brand-ink font-semibold shadow-xs"
              : "text-brand-cream/60 hover:text-brand-cream"
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Muro Puzzle (Live)</span>
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
          <span>Lista / Reordenar</span>
        </button>
      </div>

      {/* Botón Descartar cambios de tamaño */}
      {hasChanges && (
        <button
          type="button"
          onClick={handleDiscardChanges}
          className="px-3 py-1.5 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Descartar</span>
        </button>
      )}

      {/* Botón Guardar Mosaico */}
      <button
        type="button"
        onClick={handleSaveBatchLayout}
        disabled={!hasChanges || isSavingBatch}
        className="px-4 py-1.5 rounded-xl bg-brand-blush hover:bg-brand-cream text-brand-ink text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSavingBatch ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-brand-ink border-t-transparent rounded-full animate-spin" />
            <span>Guardando...</span>
          </>
        ) : (
          <>
            <Save className="w-3.5 h-3.5" />
            <span>{hasChanges ? "Guardar Mosaico" : "Diseño Al Día"}</span>
          </>
        )}
      </button>

      <a
        href={`/coleccion/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5 flex items-center gap-1.5 transition-colors no-underline hidden md:flex"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        <span>Ver pública</span>
      </a>

      <button
        onClick={handleOpenAdd}
        className="px-4 py-1.5 rounded-xl bg-brand-blush hover:bg-brand-cream text-brand-ink text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-md"
      >
        <Plus className="w-4 h-4" />
        <span>Subir Obra</span>
      </button>
    </div>
  );

  return (
    <AdminLayout
      title={gallery?.title || "Galería de Obras"}
      subtitle={`${works.length} obras · Ajusta el tamaño de cada card en vivo como un puzzle`}
      actions={headerActions}
    >
      {/* Barra informativa de estado interactivo */}
      <div className="w-full flex items-center justify-between px-5 py-3 mb-6 bg-brand-dark/90 border border-brand-cream/10 rounded-2xl text-xs font-sans text-brand-cream/70 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-brand-cream">
            {viewMode === "puzzle"
              ? "Vista Mosaico Live: Usa los controles de cada obra para cambiar su ancho (1, 2 o 3 col) y proporción (3:4, 1:1, 3:2, 16:9) en tiempo real."
              : "Vista Lista: Arrastra las tarjetas para ordenar la secuencia de las obras."}
          </span>
        </div>
        {hasChanges && (
          <span className="px-2.5 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange text-[11px] font-mono border border-brand-orange/30">
            ● Cambios sin guardar
          </span>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-brand-dark/50 border border-brand-cream/5 animate-pulse" />
          ))}
        </div>
      ) : works.length === 0 ? (
        <div className="text-center py-20 bg-brand-dark/50 border border-dashed border-brand-cream/10 rounded-2xl p-8">
          <p className="font-serif italic text-brand-wall text-lg mb-4">Esta galería no tiene obras todavía</p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-brand-blush text-brand-ink text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            Subir primera obra
          </button>
        </div>
      ) : viewMode === "puzzle" ? (
        /* ── MODO 1: Muro Interactivo (Puzzle Live Grid Exacto) ── */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto">
          {works.map((work) => {
            const currentGridCol = work.gridCol || "md:col-span-1";
            const currentAspect = work.aspect || "3/4";

            return (
              <motion.div
                key={work.id}
                layout
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                className={`relative rounded-2xl bg-brand-dark border-2 border-brand-cream/15 hover:border-brand-blush/60 shadow-xl overflow-hidden flex flex-col group/puzzle col-span-1 ${currentGridCol}`}
              >
                {/* Barra de Controles Superiores de la Card */}
                <div className="p-3 bg-brand-dark/95 border-b border-brand-cream/10 flex items-center justify-between gap-2 flex-wrap z-20">
                  {/* Selector de Ancho de Columna */}
                  <div className="flex items-center gap-1 bg-brand-bg px-2 py-1 rounded-lg border border-brand-cream/10">
                    <span className="text-[10px] uppercase font-sans text-brand-cream/50 mr-1">Ancho:</span>
                    {COL_OPTIONS.map((c) => {
                      const active = c.value === currentGridCol;
                      return (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => handleUpdateWorkLayout(work.id, { gridCol: c.value })}
                          className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold transition-all cursor-pointer ${
                            active
                              ? "bg-brand-blush text-brand-ink shadow-xs"
                              : "text-brand-cream/60 hover:text-brand-cream hover:bg-brand-cream/5"
                          }`}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selector de Proporción */}
                  <div className="flex items-center gap-1 bg-brand-bg px-2 py-1 rounded-lg border border-brand-cream/10">
                    <span className="text-[10px] uppercase font-sans text-brand-cream/50 mr-1">Ratio:</span>
                    {ASPECT_OPTIONS.map((a) => {
                      const active = a.value === currentAspect;
                      return (
                        <button
                          key={a.value}
                          type="button"
                          onClick={() => handleUpdateWorkLayout(work.id, { aspect: a.value })}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-all cursor-pointer ${
                            active
                              ? "bg-brand-blush text-brand-ink font-semibold shadow-xs"
                              : "text-brand-cream/60 hover:text-brand-cream hover:bg-brand-cream/5"
                          }`}
                        >
                          {a.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Acciones de Edición & Borrado */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateWorkLayout(work.id, { featured: !work.featured })}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        work.featured
                          ? "bg-brand-blush/20 border-brand-blush text-brand-blush"
                          : "border-brand-cream/10 text-brand-cream/40 hover:text-brand-cream"
                      }`}
                      title={work.featured ? "Destacada en Inicio" : "Marcar como destacada"}
                    >
                      <Star className={`w-3.5 h-3.5 ${work.featured ? "fill-brand-blush" : ""}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(work)}
                      className="p-1.5 rounded-lg bg-brand-cream/10 hover:bg-brand-blush text-brand-cream hover:text-brand-ink transition-colors cursor-pointer"
                      title="Editar título y medidas"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingWork(work)}
                      className="p-1.5 rounded-lg bg-brand-orange/10 hover:bg-brand-orange text-brand-orange hover:text-white transition-colors cursor-pointer"
                      title="Eliminar obra"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Contenedor de Imagen con el aspect ratio real */}
                <div
                  className="relative overflow-hidden w-full bg-brand-bg group/img"
                  style={{
                    aspectRatio:
                      currentAspect === "3/4"
                        ? "3/4"
                        : currentAspect === "1/1"
                        ? "1/1"
                        : currentAspect === "3/2"
                        ? "3/2"
                        : "16/9",
                  }}
                >
                  <img
                    src={getOptimizedImageUrl(work.img, 800)}
                    alt={work.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                    style={{ objectPosition: work.imgPos || "50% 30%" }}
                  />

                  {/* Ficha artística overlay en la base */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/95 via-brand-bg/30 to-transparent flex flex-col justify-end p-5 select-none pointer-events-none">
                    <p className="font-sans text-[9px] tracking-widest uppercase text-brand-blush mb-1">
                      {work.technique || "Digital"} · {work.year}
                    </p>
                    <p className="font-serif text-brand-cream text-base font-light truncate">
                      {work.title || "Sin título"}
                    </p>
                    <p className="font-sans text-brand-cream/50 text-[11px] tracking-wide">
                      {work.size || "Medidas N/A"}
                    </p>
                  </div>

                  {/* Badge en esquina */}
                  <div className="absolute top-3 left-3 bg-brand-dark/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-brand-blush/40 text-[9px] font-mono text-brand-blush">
                    {currentGridCol.replace("md:col-span-", "")} col · {currentAspect}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* ── MODO 2: Lista Compacta con Drag & Drop para Reordenar ── */
        <DragSortableList
          items={works}
          enableDrag={true}
          onReorder={handleReorder}
          gridClassName="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          renderItem={(w) => (
            <WorkCard
              work={w}
              onEdit={() => handleOpenEdit(w)}
              onDelete={() => setDeletingWork(w)}
              isReorderMode={true}
            />
          )}
        />
      )}

      {/* Panel Lateral Deslizante (Slide-in) para Añadir / Editar Obra */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden select-none">
            {/* Backdrop oscuro */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />

            {/* Panel Slide-in */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: 440 }}
                animate={{ x: 0 }}
                exit={{ x: 440 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="w-screen max-w-lg bg-brand-dark border-l border-brand-cream/15 p-6 md:p-8 flex flex-col justify-between overflow-y-auto text-brand-cream shadow-2xl"
              >
                <div>
                  {/* Encabezado Drawer */}
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-brand-cream/10">
                    <div>
                      <span className="font-sans text-[10px] text-brand-blush uppercase tracking-widest">
                        {gallery?.title}
                      </span>
                      <h3 className="font-serif text-2xl text-brand-cream font-light">
                        {editingWork ? "Editar Ficha de la Obra" : "Subir Nueva Obra"}
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsDrawerOpen(false)}
                      className="p-1 text-brand-cream/40 hover:text-brand-cream cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Formulario */}
                  <form id="work-form" onSubmit={handleSaveWork} className="flex flex-col gap-4">
                    {/* Subida de Imagen */}
                    <ImageUploader
                      folder={`miluarte/${slug || "general"}`}
                      currentImageUrl={workForm.img}
                      onUploadSuccess={(res) => {
                        setWorkForm((prev) => ({
                          ...prev,
                          img: res.secureUrl,
                          publicId: res.publicId,
                        }));
                      }}
                      onFileSelect={(file) => {
                        setPendingFile(file);
                        const localPreview = URL.createObjectURL(file);
                        setWorkForm((prev) => ({
                          ...prev,
                          img: localPreview,
                        }));
                      }}
                    />

                    {/* Título */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                        Título de la Obra *
                      </label>
                      <input
                        type="text"
                        value={workForm.title}
                        onChange={(e) => setWorkForm({ ...workForm, title: e.target.value })}
                        placeholder="Ej: Tell Me a Joke"
                        required
                        className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-sm focus:border-brand-blush outline-none"
                      />
                    </div>

                    {/* Año y Medidas */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                          Año
                        </label>
                        <input
                          type="text"
                          value={workForm.year}
                          onChange={(e) => setWorkForm({ ...workForm, year: e.target.value })}
                          placeholder="2026"
                          className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-3 py-2 text-brand-cream text-sm focus:border-brand-blush outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                          Medidas
                        </label>
                        <input
                          type="text"
                          value={workForm.size}
                          onChange={(e) => setWorkForm({ ...workForm, size: e.target.value })}
                          placeholder="100 × 80 cm"
                          className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-3 py-2 text-brand-cream text-sm focus:border-brand-blush outline-none"
                        />
                      </div>
                    </div>

                    {/* Técnica */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                        Técnica Artística
                      </label>
                      <input
                        type="text"
                        value={workForm.technique}
                        onChange={(e) => setWorkForm({ ...workForm, technique: e.target.value })}
                        placeholder="Acrílico sobre lienzo / Arte digital"
                        className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-sm focus:border-brand-blush outline-none"
                      />
                    </div>

                    {/* Card Resizer interactivo */}
                    <CardResizer
                      gridCol={workForm.gridCol || "md:col-span-1"}
                      aspect={workForm.aspect || "3/4"}
                      imageUrl={workForm.img}
                      title={workForm.title}
                      technique={workForm.technique}
                      year={workForm.year}
                      onChange={({ gridCol, aspect }) => {
                        setWorkForm((prev) => ({ ...prev, gridCol, aspect }));
                      }}
                    />

                    {/* Enfoque visual y Destacada */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                          Enfoque Vertical (Object Position)
                        </label>
                        <select
                          value={workForm.imgPos || "50% 30%"}
                          onChange={(e) => setWorkForm({ ...workForm, imgPos: e.target.value })}
                          className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-3 py-2.5 text-brand-cream text-xs focus:border-brand-blush outline-none"
                        >
                          <option value="50% 15%">Arriba (15% - Rostros)</option>
                          <option value="50% 30%">Centro-Arriba (30% - Retratos)</option>
                          <option value="50% 50%">Centro (50% - General)</option>
                          <option value="50% 80%">Abajo (80% - Planos bajos)</option>
                        </select>
                      </div>

                      <div className="flex flex-col justify-end">
                        <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-brand-bg border border-brand-cream/15 cursor-pointer text-xs text-brand-cream h-[42px]">
                          <input
                            type="checkbox"
                            checked={workForm.featured}
                            onChange={(e) => setWorkForm({ ...workForm, featured: e.target.checked })}
                            className="w-4 h-4 rounded-md accent-brand-blush"
                          />
                          <div className="flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-brand-blush" />
                            <span>Obra Destacada en Inicio</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Footer Drawer Botones */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-brand-cream/10 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/70 hover:text-brand-cream cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    form="work-form"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-brand-blush hover:bg-brand-cream text-brand-ink text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-brand-ink border-t-transparent rounded-full animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <span>{editingWork ? "Guardar Cambios" : "Guardar y Publicar"}</span>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmación Borrar Obra */}
      <ConfirmDialog
        isOpen={Boolean(deletingWork)}
        onClose={() => setDeletingWork(null)}
        onConfirm={handleDeleteWork}
        title="¿Eliminar esta obra?"
        description={`¿Estás segura de que deseas eliminar permanentemente "${deletingWork?.title || "esta obra"}" de la galería?`}
        confirmText="Eliminar Obra"
        destructive={true}
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
