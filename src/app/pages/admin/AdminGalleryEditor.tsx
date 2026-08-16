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
  UploadCloud,
  Star,
  Sliders,
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { WorkCard } from "../../components/admin/WorkCard";
import { DragSortableList } from "../../components/admin/DragSortableList";
import { ImageUploader } from "../../components/admin/ImageUploader";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { Toast } from "../../components/admin/Toast";
import { GalleryMeta, Work } from "../../types/cms";
import { useAdminApi } from "../../hooks/useAdminApi";
import { useUpload } from "../../hooks/useUpload";

export function AdminGalleryEditor() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { request } = useAdminApi();

  const [gallery, setGallery] = useState<GalleryMeta | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);

  // Panel lateral de edición / creación
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [workForm, setWorkForm] = useState<Partial<Work>>({
    title: "",
    year: new Date().getFullYear().toString(),
    technique: "Acrílico sobre lienzo",
    size: "50 × 70 cm",
    price: "Disponible",
    available: true,
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
      // 1. Cargar galería meta
      const allGalleries = await request<GalleryMeta[]>("/api/admin/galleries");
      const current = allGalleries.find((g) => g.slug === slug);
      setGallery(current || null);

      // 2. Cargar obras
      const worksData = await request<Work[]>(`/api/admin/works?slug=${slug}`);
      setWorks(worksData);
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
      price: "Disponible",
      available: true,
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

      // Si hay un archivo pendiente seleccionado por el usuario, subirlo AHORA al guardar
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
        // Actualizar obra existente
        await request(`/api/admin/works?slug=${slug}`, {
          method: "PUT",
          body: JSON.stringify({
            id: editingWork.id,
            ...payload,
          }),
        });
        setToast({ message: "Obra actualizada correctamente", type: "success", open: true });
      } else {
        // Crear nueva obra
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
    <div className="flex items-center gap-2.5">
      <button
        onClick={() => navigate("/admin/galerias")}
        className="px-3 py-1.5 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5 flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Volver</span>
      </button>

      <a
        href={`/coleccion/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5 flex items-center gap-1.5 transition-colors no-underline"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Ver pública</span>
      </a>

      <button
        onClick={() => setIsReordering(!isReordering)}
        className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
          isReordering
            ? "bg-brand-blush text-brand-ink"
            : "border border-brand-cream/15 text-brand-cream/80 hover:text-brand-cream"
        }`}
      >
        {isReordering ? <Check className="w-3.5 h-3.5" /> : <ArrowUpDown className="w-3.5 h-3.5" />}
        <span>{isReordering ? "Listo" : "Reordenar"}</span>
      </button>

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
      subtitle={`${works.length} obras registradas en esta colección`}
      actions={headerActions}
    >
      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-square rounded-2xl bg-brand-dark/50 border border-brand-cream/5 animate-pulse" />
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
      ) : (
        /* Grilla de obras con Drag and Drop */
        <DragSortableList
          items={works}
          enableDrag={isReordering}
          onReorder={handleReorder}
          gridClassName="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          renderItem={(w) => (
            <WorkCard
              work={w}
              onEdit={() => handleOpenEdit(w)}
              onDelete={() => setDeletingWork(w)}
              isReorderMode={isReordering}
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
                initial={{ x: 420 }}
                animate={{ x: 0 }}
                exit={{ x: 420 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="w-screen max-w-md bg-brand-dark border-l border-brand-cream/15 p-6 md:p-8 flex flex-col justify-between overflow-y-auto text-brand-cream shadow-2xl"
              >
                <div>
                  {/* Encabezado Drawer */}
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-brand-cream/10">
                    <div>
                      <span className="font-sans text-[10px] text-brand-blush uppercase tracking-widest">
                        {gallery?.title}
                      </span>
                      <h3 className="font-serif text-2xl text-brand-cream font-light">
                        {editingWork ? "Editar Obra" : "Subir Nueva Obra"}
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
                    {/* Uploader de imagen con selección diferida */}
                    <ImageUploader
                      currentImageUrl={workForm.img}
                      folder={`miluarte/${slug || "general"}`}
                      label="Imagen de la Obra *"
                      onFileSelect={(file) => {
                        setPendingFile(file);
                      }}
                      onUploadSuccess={(res) => {
                        setWorkForm((prev) => ({
                          ...prev,
                          img: res.secureUrl,
                          publicId: res.publicId,
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

                    {/* Año y Técnica en 2 columnas */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                          Año
                        </label>
                        <input
                          type="text"
                          value={workForm.year}
                          onChange={(e) => setWorkForm({ ...workForm, year: e.target.value })}
                          placeholder="2024"
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
                        placeholder="Acrílico sobre lienzo / Concept Art"
                        className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-sm focus:border-brand-blush outline-none"
                      />
                    </div>

                    {/* Precio y Disponibilidad */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                          Precio / Estado
                        </label>
                        <input
                          type="text"
                          value={workForm.price}
                          onChange={(e) => setWorkForm({ ...workForm, price: e.target.value })}
                          placeholder="€650 / Encargo"
                          className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-3 py-2 text-brand-cream text-sm focus:border-brand-blush outline-none"
                        />
                      </div>

                      <div className="flex flex-col justify-end">
                        <label className="flex items-center gap-2 p-2.5 bg-brand-bg border border-brand-cream/15 rounded-xl cursor-pointer text-xs text-brand-cream/80 h-[42px]">
                          <input
                            type="checkbox"
                            checked={workForm.available}
                            onChange={(e) => setWorkForm({ ...workForm, available: e.target.checked })}
                            className="w-4 h-4 rounded-md accent-brand-blush"
                          />
                          <span>Disponible</span>
                        </label>
                      </div>
                    </div>

                    {/* Proporción y Posición Visual */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-brand-cream/10">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                          Proporción Aspect
                        </label>
                        <select
                          value={workForm.aspect || "3/4"}
                          onChange={(e) => setWorkForm({ ...workForm, aspect: e.target.value })}
                          className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-3 py-2 text-brand-cream text-xs focus:border-brand-blush outline-none"
                        >
                          <option value="1/1">1:1 Cuadrado</option>
                          <option value="3/4">3:4 Vertical</option>
                          <option value="3/2">3:2 Horizontal</option>
                          <option value="16/9">16:9 Panorámica</option>
                          <option value="2/1">2:1 Banner</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                          Enfoque Vertical
                        </label>
                        <select
                          value={workForm.imgPos || "50% 30%"}
                          onChange={(e) => setWorkForm({ ...workForm, imgPos: e.target.value })}
                          className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-3 py-2 text-brand-cream text-xs focus:border-brand-blush outline-none"
                        >
                          <option value="50% 15%">Arriba (15%)</option>
                          <option value="50% 30%">Centro-Arriba (30%)</option>
                          <option value="50% 50%">Centro (50%)</option>
                          <option value="50% 80%">Abajo (80%)</option>
                        </select>
                      </div>
                    </div>

                    {/* Toggle Destacada */}
                    <div className="pt-2">
                      <label className="flex items-center gap-2.5 p-3 rounded-xl bg-brand-bg border border-brand-cream/15 cursor-pointer text-xs text-brand-cream">
                        <input
                          type="checkbox"
                          checked={workForm.featured}
                          onChange={(e) => setWorkForm({ ...workForm, featured: e.target.checked })}
                          className="w-4 h-4 rounded-md accent-brand-blush"
                        />
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-brand-blush" />
                          <span>Marcar como Obra Destacada en Inicio</span>
                        </div>
                      </label>
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
                        <span>Subiendo y Guardando...</span>
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
        description={`Se eliminará "${deletingWork?.title}" de la galería "${gallery?.title}".`}
        confirmText="Eliminar Obra"
      />

      {/* Notificación Toast */}
      <Toast
        isOpen={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </AdminLayout>
  );
}
