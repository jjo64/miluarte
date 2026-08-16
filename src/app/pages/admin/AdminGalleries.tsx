import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Plus, ArrowUpDown, Check, X, Sparkles } from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { GalleryCard } from "../../components/admin/GalleryCard";
import { DragSortableList } from "../../components/admin/DragSortableList";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { Toast } from "../../components/admin/Toast";
import { GalleryMeta } from "../../types/cms";
import { useAdminApi } from "../../hooks/useAdminApi";

export function AdminGalleries() {
  const [galleries, setGalleries] = useState<GalleryMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);

  // Modal Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<GalleryMeta | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    label: "",
    statement: "",
    accent: "#EAA898",
    twoColumns: false,
    featured: false,
  });

  // Modal Borrar
  const [deletingGallery, setDeletingGallery] = useState<GalleryMeta | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; open: boolean }>({
    message: "",
    type: "success",
    open: false,
  });

  const { request } = useAdminApi();
  const navigate = useNavigate();

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const data = await request<GalleryMeta[]>("/api/admin/galleries");
      setGalleries(data);
    } catch (err: any) {
      setToast({
        message: "Error al cargar las galerías: " + (err.message || "Fallo de conexión"),
        type: "error",
        open: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const handleOpenCreate = () => {
    setEditingGallery(null);
    setFormData({
      title: "",
      slug: "",
      label: "Obra artística",
      statement: "",
      accent: "#EAA898",
      twoColumns: false,
      featured: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (gallery: GalleryMeta) => {
    setEditingGallery(gallery);
    setFormData({
      title: gallery.title,
      slug: gallery.slug,
      label: gallery.label || "",
      statement: gallery.statement || "",
      accent: gallery.accent || "#EAA898",
      twoColumns: Boolean(gallery.twoColumns),
      featured: Boolean(gallery.featured),
    });
    setIsModalOpen(true);
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      if (editingGallery) {
        // Actualizar
        await request("/api/admin/galleries", {
          method: "PUT",
          body: JSON.stringify({
            slug: editingGallery.slug,
            ...formData,
          }),
        });
        setToast({ message: "Galería actualizada exitosamente", type: "success", open: true });
      } else {
        // Crear
        await request("/api/admin/galleries", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        setToast({ message: "Nueva galería creada exitosamente", type: "success", open: true });
      }

      setIsModalOpen(false);
      fetchGalleries();
    } catch (err: any) {
      setToast({
        message: err.message || "Error al guardar galería",
        type: "error",
        open: true,
      });
    }
  };

  const handleDeleteGallery = async () => {
    if (!deletingGallery) return;

    try {
      await request(`/api/admin/galleries?slug=${deletingGallery.slug}`, {
        method: "DELETE",
      });
      setToast({ message: `Galería "${deletingGallery.title}" eliminada`, type: "success", open: true });
      fetchGalleries();
    } catch (err: any) {
      setToast({
        message: err.message || "Error al eliminar galería",
        type: "error",
        open: true,
      });
    } finally {
      setDeletingGallery(null);
    }
  };

  const handleReorder = async (reordered: GalleryMeta[]) => {
    setGalleries(reordered);
    try {
      await request("/api/admin/galleries", {
        method: "PUT",
        body: JSON.stringify({
          reorder: true,
          slugs: reordered.map((g) => g.slug),
        }),
      });
      setToast({ message: "Nuevo orden de galerías guardado", type: "success", open: true });
    } catch (err: any) {
      setToast({ message: "Error al guardar orden", type: "error", open: true });
      fetchGalleries();
    }
  };

  const headerActions = (
    <div className="flex items-center gap-2.5">
      <button
        onClick={() => setIsReordering(!isReordering)}
        className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
          isReordering
            ? "bg-brand-blush text-brand-ink"
            : "border border-brand-cream/15 text-brand-cream/80 hover:text-brand-cream hover:bg-brand-cream/5"
        }`}
      >
        {isReordering ? <Check className="w-3.5 h-3.5" /> : <ArrowUpDown className="w-3.5 h-3.5" />}
        <span>{isReordering ? "Finalizar Orden" : "Reordenar"}</span>
      </button>

      <button
        onClick={handleOpenCreate}
        className="px-4 py-2 rounded-xl bg-brand-blush hover:bg-brand-cream text-brand-ink text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-md"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Nueva Galería</span>
      </button>
    </div>
  );

  return (
    <AdminLayout
      title="Galerías de Arte"
      subtitle="Organiza, edita y añade nuevas colecciones al portfolio de Nerea"
      actions={headerActions}
    >
      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-brand-dark/50 border border-brand-cream/5 animate-pulse" />
          ))}
        </div>
      ) : galleries.length === 0 ? (
        <div className="text-center py-20 bg-brand-dark/50 border border-dashed border-brand-cream/10 rounded-2xl p-8">
          <p className="font-serif italic text-brand-wall text-lg mb-4">No hay galerías creadas aún</p>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-brand-blush text-brand-ink text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            Crear primera galería
          </button>
        </div>
      ) : (
        /* Lista de Galerías con Drag and Drop */
        <DragSortableList
          items={galleries.map((g) => ({ ...g, id: g.slug }))}
          enableDrag={isReordering}
          onReorder={(items) => handleReorder(items as any)}
          gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          renderItem={(g) => (
            <GalleryCard
              gallery={g}
              onOpen={() => navigate(`/admin/galerias/${g.slug}`)}
              onEditMeta={() => handleOpenEdit(g)}
              onDelete={() => setDeletingGallery(g)}
              isReorderMode={isReordering}
            />
          )}
        />
      )}

      {/* Modal Crear / Editar Galería */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-brand-dark border border-brand-cream/15 rounded-2xl p-6 md:p-8 shadow-2xl text-brand-cream max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-brand-cream/10">
                <h3 className="font-serif text-2xl text-brand-cream font-light">
                  {editingGallery ? "Editar Galería" : "Nueva Galería"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-brand-cream/40 hover:text-brand-cream p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveGallery} className="flex flex-col gap-4">
                {/* Título */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                    Título de la Galería *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        title: val,
                        slug: editingGallery
                          ? formData.slug
                          : val
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/(^-|-$)/g, ""),
                      });
                    }}
                    placeholder="Ej: Joyería Artesanal"
                    required
                    className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-sm focus:border-brand-blush outline-none"
                  />
                </div>

                {/* Slug / Ruta URL */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                    Slug / URL de la Galería
                  </label>
                  <div className="flex items-center bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-sm text-brand-cream">
                    <span className="text-brand-cream/40 mr-1 font-mono">/coleccion/</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""),
                        })
                      }
                      disabled={Boolean(editingGallery)}
                      placeholder="joyeria-artesanal"
                      required
                      className="bg-transparent text-brand-blush font-mono flex-1 outline-none disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Subtítulo / Label */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                    Subtítulo / Categoría
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="Ej: Obra personal · Técnica mixta"
                    className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-sm focus:border-brand-blush outline-none"
                  />
                </div>

                {/* Declaración / Statement */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                    Descripción / Declaración Artística
                  </label>
                  <textarea
                    rows={3}
                    value={formData.statement}
                    onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                    placeholder="Escribe el texto que describe la intención artística de esta colección..."
                    className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl p-3 text-brand-cream text-sm focus:border-brand-blush outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Color de acento & Opciones */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                      Color de Acento
                    </label>
                    <div className="flex items-center gap-3 bg-brand-bg border border-brand-cream/15 rounded-xl p-2">
                      <input
                        type="color"
                        value={formData.accent.startsWith("#") ? formData.accent : "#EAA898"}
                        onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="font-mono text-xs text-brand-cream/80">{formData.accent}</span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-2 pt-2 sm:pt-0">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-brand-cream/80">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4 rounded-md accent-brand-blush"
                      />
                      <span>Destacar en Galería de Inicio</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-brand-cream/80">
                      <input
                        type="checkbox"
                        checked={formData.twoColumns}
                        onChange={(e) => setFormData({ ...formData, twoColumns: e.target.checked })}
                        className="w-4 h-4 rounded-md accent-brand-blush"
                      />
                      <span>Formato 2 Columnas (Diggin')</span>
                    </label>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-brand-cream/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/70 hover:text-brand-cream cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-brand-blush hover:bg-brand-cream text-brand-ink text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Guardar Galería
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmación Borrar Galería */}
      <ConfirmDialog
        isOpen={Boolean(deletingGallery)}
        onClose={() => setDeletingGallery(null)}
        onConfirm={handleDeleteGallery}
        title="¿Eliminar galería completa?"
        description={`Estás a punto de borrar la colección "${deletingGallery?.title}" y todas sus obras registradas. Esta acción no se puede deshacer.`}
        confirmText="Eliminar Galería"
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
