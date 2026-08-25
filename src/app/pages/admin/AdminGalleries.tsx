import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Plus, ArrowUpDown, Check, X, Sparkles, Globe, RefreshCw } from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { GalleryCard } from "../../components/admin/GalleryCard";
import { DragSortableList } from "../../components/admin/DragSortableList";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { Toast } from "../../components/admin/Toast";
import { MediaLibraryModal } from "../../components/admin/MediaLibraryModal";
import { Image as ImageIcon } from "lucide-react";
import { GalleryMeta } from "../../types/cms";
import { useAdminApi } from "../../hooks/useAdminApi";

type Lang = "es" | "en";

export function AdminGalleries() {
  const [galleries, setGalleries] = useState<GalleryMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);
  const [lang, setLang] = useState<Lang>("es");

  // Modal Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<GalleryMeta | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    titleEn: "",
    slug: "",
    label: "Obra artística",
    labelEn: "Artistic work",
    statement: "",
    statementEn: "",
    accent: "#EAA898",
    coverImage: "",
    twoColumns: false,
    featured: false,
  });

  // Modal Borrar
  const [deletingGallery, setDeletingGallery] = useState<GalleryMeta | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; open: boolean }>({
    message: "",
    type: "success",
    open: false,
  });

  const { request } = useAdminApi();
  const navigate = useNavigate();

  const handleSyncCloudinary = async () => {
    try {
      setIsSyncing(true);
      const res = await request<any>("/api/admin/sync-cloudinary", { method: "POST" });
      setToast({
        message: res.message || "Sincronización con Cloudinary completada exitosamente.",
        type: "success",
        open: true,
      });
      fetchGalleries();
    } catch (err: any) {
      setToast({
        message: "Error al sincronizar con Cloudinary: " + (err.message || "Fallo de conexión"),
        type: "error",
        open: true,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const [galleriesData, textsData] = await Promise.all([
        request<GalleryMeta[]>("/api/admin/galleries"),
        request<any>("/api/admin/texts"),
      ]);

      const safeGalleries = Array.isArray(galleriesData) ? galleriesData : [];

      // Enriquecer con textos en inglés si existen
      if (textsData?.en?.collection?.meta) {
        safeGalleries.forEach((g) => {
          const metaEn = textsData.en.collection.meta[g.slug];
          if (metaEn) {
            (g as any).titleEn = metaEn.title;
            (g as any).labelEn = metaEn.label;
            (g as any).statementEn = metaEn.statement;
          }
        });
      }

      setGalleries(safeGalleries);
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
      titleEn: "",
      slug: "",
      label: "Obra artística",
      labelEn: "Artistic work",
      statement: "",
      statementEn: "",
      accent: "#EAA898",
      coverImage: "",
      twoColumns: false,
      featured: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (gallery: GalleryMeta) => {
    setEditingGallery(gallery);
    setFormData({
      title: gallery.title,
      titleEn: (gallery as any).titleEn || gallery.title,
      slug: gallery.slug,
      label: gallery.label || "",
      labelEn: (gallery as any).labelEn || gallery.label || "",
      statement: gallery.statement || "",
      statementEn: (gallery as any).statementEn || gallery.statement || "",
      accent: gallery.accent || "#EAA898",
      coverImage: gallery.coverImage || "",
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
        // Actualizar Galería
        await request("/api/admin/galleries", {
          method: "PUT",
          body: JSON.stringify({
            slug: editingGallery.slug,
            ...formData,
          }),
        });

        // Guardar traducciones ES y EN en texts
        await request("/api/admin/texts", {
          method: "PUT",
          body: JSON.stringify({
            es: {
              collection: {
                meta: {
                  [editingGallery.slug]: {
                    title: formData.title,
                    label: formData.label,
                    statement: formData.statement,
                  },
                },
              },
            },
            en: {
              collection: {
                meta: {
                  [editingGallery.slug]: {
                    title: formData.titleEn || formData.title,
                    label: formData.labelEn || formData.label,
                    statement: formData.statementEn || formData.statement,
                  },
                },
              },
            },
          }),
        });

        setToast({ message: "Galería y traducciones guardadas exitosamente", type: "success", open: true });
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
      setToast({ message: "Orden de galerías actualizado", type: "success", open: true });
    } catch (err: any) {
      setToast({
        message: "Error al guardar el orden",
        type: "error",
        open: true,
      });
      fetchGalleries();
    }
  };

  const headerActions = (
    <div className="flex items-center gap-2.5 flex-wrap justify-end">
      {/* Selector de idioma ES/EN */}
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

      <button
        onClick={handleSyncCloudinary}
        disabled={isSyncing}
        className="px-3.5 py-1.5 rounded-xl border border-brand-cream/15 text-brand-cream/80 hover:text-brand-cream hover:bg-brand-cream/5 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
        title="Escanear Cloudinary y sincronizar automáticamente portadas y obras en la base de datos"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-brand-blush" : ""}`} />
        <span>{isSyncing ? "Sincronizando..." : "Sincronizar Cloudinary"}</span>
      </button>

      <button
        onClick={() => setIsReordering(!isReordering)}
        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
          isReordering
            ? "bg-brand-blush text-brand-ink font-semibold"
            : "border border-brand-cream/15 text-brand-cream/80 hover:text-brand-cream hover:bg-brand-cream/5"
        }`}
      >
        {isReordering ? <Check className="w-3.5 h-3.5" /> : <ArrowUpDown className="w-3.5 h-3.5" />}
        <span>{isReordering ? "Finalizar Orden" : "Reordenar"}</span>
      </button>

      <button
        onClick={handleOpenCreate}
        className="px-4 py-1.5 rounded-xl bg-brand-blush hover:bg-brand-cream text-brand-ink text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-md"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Nueva Galería</span>
      </button>
    </div>
  );

  return (
    <AdminLayout
      title="Galerías de Arte"
      subtitle={`Organiza y edita las colecciones en ${lang === "es" ? "Español 🇪🇸" : "Inglés 🇬🇧"}`}
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
          renderItem={(g) => {
            const displayTitle = lang === "en" ? (g as any).titleEn || g.title : g.title;
            const displayLabel = lang === "en" ? (g as any).labelEn || g.label : g.label;
            const displayStatement = lang === "en" ? (g as any).statementEn || g.statement : g.statement;

            return (
              <GalleryCard
                gallery={{
                  ...g,
                  title: displayTitle,
                  label: displayLabel,
                  statement: displayStatement,
                }}
                worksCount={(g as any).worksCount ?? 0}
                onOpen={() => navigate(`/admin/galerias/${g.slug}`)}
                onEditMeta={() => handleOpenEdit(g)}
                onDelete={() => setDeletingGallery(g)}
                isReorderMode={isReordering}
              />
            );
          }}
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
                  {editingGallery ? "Editar Galería (Bilingüe)" : "Nueva Galería"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-brand-cream/40 hover:text-brand-cream p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveGallery} className="flex flex-col gap-4">
                {/* Título Español / Inglés */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium flex items-center gap-1">
                      <span>Título (Español 🇪🇸) *</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ej: Ilustración"
                      required
                      className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-sm focus:border-brand-blush outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium flex items-center gap-1">
                      <span>Título (Inglés 🇬🇧)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.titleEn}
                      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                      placeholder="Ej: Illustration"
                      className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-sm focus:border-brand-blush outline-none"
                    />
                  </div>
                </div>

                {/* Slug */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                    Slug / URL *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                    placeholder="ej: ilustracion"
                    required
                    disabled={Boolean(editingGallery)}
                    className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-sm font-mono focus:border-brand-blush outline-none disabled:opacity-50"
                  />
                </div>

                {/* Etiqueta / Label ES y EN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                      Categoría (ES 🇪🇸)
                    </label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      placeholder="Ej: Obra personal"
                      className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2 text-brand-cream text-sm focus:border-brand-blush outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                      Categoría (EN 🇬🇧)
                    </label>
                    <input
                      type="text"
                      value={formData.labelEn}
                      onChange={(e) => setFormData({ ...formData, labelEn: e.target.value })}
                      placeholder="Ej: Personal work"
                      className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2 text-brand-cream text-sm focus:border-brand-blush outline-none"
                    />
                  </div>
                </div>

                {/* Statement / Descripción ES */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                    Declaración Artística (Español 🇪🇸)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.statement}
                    onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                    placeholder="Descripción artística de la serie..."
                    className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-xs leading-relaxed focus:border-brand-blush outline-none resize-y"
                  />
                </div>

                {/* Statement / Descripción EN */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                    Declaración Artística (Inglés 🇬🇧)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.statementEn}
                    onChange={(e) => setFormData({ ...formData, statementEn: e.target.value })}
                    placeholder="Artist statement in English..."
                    className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-xs leading-relaxed focus:border-brand-blush outline-none resize-y"
                  />
                </div>

                                {/* Imagen de Portada de la Colección */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium flex items-center justify-between">
                    <span>Imagen de Portada (/colecciones)</span>
                    <button
                      type="button"
                      onClick={() => setIsMediaModalOpen(true)}
                      className="text-brand-blush hover:underline text-[11px] font-sans flex items-center gap-1 cursor-pointer"
                    >
                      <ImageIcon className="w-3 h-3" />
                      Elegir de Biblioteca
                    </button>
                  </label>
                  <div className="flex items-center gap-3">
                    {formData.coverImage && (
                      <img
                        src={formData.coverImage}
                        alt="Portada preview"
                        className="w-14 h-14 rounded-lg object-cover border border-brand-cream/20 shrink-0"
                      />
                    )}
                    <input
                      type="text"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      placeholder="https://res.cloudinary.com/.../portada.jpg"
                      className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-xs font-mono focus:border-brand-blush outline-none"
                    />
                  </div>
                </div>

                {/* Color de Acento y Opciones */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                      Color de Acento
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.accent}
                        onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                      />
                      <span className="font-mono text-xs text-brand-cream/60">{formData.accent}</span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-brand-cream">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4 rounded accent-brand-blush"
                      />
                      <span>Destacada en Home</span>
                    </label>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-cream/10 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/70 hover:text-brand-cream cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-brand-blush hover:bg-brand-cream text-brand-ink text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    {editingGallery ? "Guardar Cambios" : "Crear Galería"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmación Borrar */}
      <ConfirmDialog
        isOpen={Boolean(deletingGallery)}
        onClose={() => setDeletingGallery(null)}
        onConfirm={handleDeleteGallery}
        title="¿Eliminar galería?"
        description={`¿Estás segura de que deseas eliminar permanentemente la galería "${deletingGallery?.title}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Galería"
        destructive={true}
      />

      <Toast
        isOpen={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
      {/* Modal Biblioteca de Medios */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => {
          setFormData((prev) => ({ ...prev, coverImage: url }));
          setIsMediaModalOpen(false);
        }}
      />
    </AdminLayout>
  );
}
