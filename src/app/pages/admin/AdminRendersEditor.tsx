import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, ArrowUpDown, Check, X, Edit3, Trash2, Box, Video, Layers, ExternalLink } from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DragSortableList } from "../../components/admin/DragSortableList";
import { ImageUploader } from "../../components/admin/ImageUploader";
import { TagEditor } from "../../components/admin/TagEditor";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { Toast } from "../../components/admin/Toast";
import { RenderItem, RenderProcessStep } from "../../types/cms";
import { useAdminApi } from "../../hooks/useAdminApi";
import { getOptimizedImageUrl } from "../../utils/cloudinary";

export function AdminRendersEditor() {
  const [renders, setRenders] = useState<RenderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);

  // Modal Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRender, setEditingRender] = useState<RenderItem | null>(null);
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

  const fetchRenders = async () => {
    try {
      setLoading(true);
      const data = await request<RenderItem[]>("/api/admin/renders");
      setRenders(data);
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
      process: [
        { src: "", label: "Boceto inicial" },
        { src: "", label: "Blockout 3D" },
        { src: "", label: "Clay render" },
        { src: "", label: "Render final" },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: RenderItem) => {
    setEditingRender(item);
    setRenderForm({
      ...item,
      process: item.process?.length
        ? item.process
        : [
            { src: "", label: "Boceto inicial" },
            { src: "", label: "Blockout 3D" },
            { src: "", label: "Clay render" },
            { src: "", label: "Render final" },
          ],
    });
    setIsModalOpen(true);
  };

  const handleSaveRender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renderForm.title?.trim() || !renderForm.img?.trim()) {
      setToast({ message: "El título y la imagen principal son obligatorios", type: "error", open: true });
      return;
    }

    try {
      if (editingRender) {
        // Actualizar
        await request("/api/admin/renders", {
          method: "PUT",
          body: JSON.stringify({
            id: editingRender.id,
            ...renderForm,
          }),
        });
        setToast({ message: "Proyecto 3D actualizado correctamente", type: "success", open: true });
      } else {
        // Crear
        await request("/api/admin/renders", {
          method: "POST",
          body: JSON.stringify(renderForm),
        });
        setToast({ message: "Nuevo proyecto 3D creado", type: "success", open: true });
      }

      setIsModalOpen(false);
      fetchRenders();
    } catch (err: any) {
      setToast({ message: err.message || "Error al guardar proyecto 3D", type: "error", open: true });
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
    setRenders(reordered);
    try {
      await request("/api/admin/renders", {
        method: "PUT",
        body: JSON.stringify({
          reorder: true,
          ids: reordered.map((r) => r.id),
        }),
      });
      setToast({ message: "Nuevo orden de proyectos 3D guardado", type: "success", open: true });
    } catch (err: any) {
      setToast({ message: "Error al guardar el orden", type: "error", open: true });
      fetchRenders();
    }
  };

  const headerActions = (
    <div className="flex items-center gap-2.5">
      <a
        href="/renders"
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5 flex items-center gap-1.5 transition-colors no-underline"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Ver pública</span>
      </a>

      <button
        onClick={() => setIsReordering(!isReordering)}
        className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
          isReordering
            ? "bg-brand-blush text-brand-ink"
            : "border border-brand-cream/15 text-brand-cream/80 hover:text-brand-cream"
        }`}
      >
        {isReordering ? <Check className="w-3.5 h-3.5" /> : <ArrowUpDown className="w-3.5 h-3.5" />}
        <span>{isReordering ? "Listo" : "Reordenar"}</span>
      </button>

      <button
        onClick={handleOpenCreate}
        className="px-4 py-2 rounded-xl bg-brand-orange hover:bg-brand-cream hover:text-brand-ink text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-md"
      >
        <Plus className="w-4 h-4" />
        <span>Nuevo Proyecto 3D</span>
      </button>
    </div>
  );

  return (
    <AdminLayout
      title="Proyectos 3D & Stands"
      subtitle="Gestiona los renders arquitectónicos, de stands y producto comercial"
      actions={headerActions}
    >
      {/* Skeleton Loading */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-brand-dark/50 border border-brand-cream/5 animate-pulse" />
          ))}
        </div>
      ) : renders.length === 0 ? (
        <div className="text-center py-20 bg-brand-dark/50 border border-dashed border-brand-cream/10 rounded-2xl p-8">
          <p className="font-serif italic text-brand-wall text-lg mb-4">No hay proyectos 3D registrados</p>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-brand-orange text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            Crear primer proyecto 3D
          </button>
        </div>
      ) : (
        /* Lista vertical de Proyectos 3D */
        <DragSortableList
          items={renders}
          enableDrag={isReordering}
          onReorder={handleReorder}
          gridClassName="flex flex-col gap-4"
          renderItem={(render) => (
            <div className="p-5 rounded-2xl bg-brand-dark border border-brand-cream/10 hover:border-brand-orange/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-24 h-16 rounded-xl bg-brand-bg overflow-hidden flex-shrink-0 border border-brand-cream/10">
                  <img
                    src={getOptimizedImageUrl(render.img, 200)}
                    alt={render.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-sans text-[10px] uppercase tracking-wider text-brand-orange font-medium">
                      {render.badge || "3D STAND"}
                    </span>
                    <span className="text-brand-cream/30 text-xs">·</span>
                    <span className="font-sans text-xs text-brand-cream/50">{render.year}</span>
                  </div>
                  <h3 className="font-serif text-lg text-brand-cream truncate group-hover:text-brand-orange transition-colors">
                    {render.title}
                  </h3>
                  <p className="font-sans text-xs text-brand-cream/60 truncate max-w-md">
                    {render.client} · {render.delivery}
                  </p>
                </div>
              </div>

              {!isReordering && (
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleOpenEdit(render)}
                    className="p-2.5 rounded-xl border border-brand-cream/15 text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5 transition-colors cursor-pointer"
                    title="Editar proyecto"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingRender(render)}
                    className="p-2.5 rounded-xl border border-brand-orange/20 text-brand-orange hover:bg-brand-orange/10 transition-colors cursor-pointer"
                    title="Eliminar proyecto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        />
      )}

      {/* Modal Crear / Editar Proyecto 3D */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-brand-dark border border-brand-cream/15 rounded-2xl p-6 md:p-8 shadow-2xl text-brand-cream max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-brand-cream/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-orange/15 text-brand-orange border border-brand-orange/30 flex items-center justify-center">
                    <Box className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl text-brand-cream font-light">
                      {editingRender ? "Editar Proyecto 3D" : "Nuevo Proyecto 3D"}
                    </h3>
                    <p className="font-sans text-xs text-brand-cream/50">Stands, espacios y producto</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-brand-cream/40 hover:text-brand-cream p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveRender} className="flex flex-col gap-5">
                {/* 1. General Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                      Título del Proyecto *
                    </label>
                    <input
                      type="text"
                      value={renderForm.title}
                      onChange={(e) => setRenderForm({ ...renderForm, title: e.target.value })}
                      placeholder="Ej: Stand Modular de Feria — Milán"
                      required
                      className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-sm focus:border-brand-orange outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                      Cliente / Organización
                    </label>
                    <input
                      type="text"
                      value={renderForm.client}
                      onChange={(e) => setRenderForm({ ...renderForm, client: e.target.value })}
                      placeholder="Ej: Fiera Milano S.p.A."
                      className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-3.5 py-2 text-brand-cream text-sm focus:border-brand-orange outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                      Etiqueta / Badge
                    </label>
                    <input
                      type="text"
                      value={renderForm.badge}
                      onChange={(e) => setRenderForm({ ...renderForm, badge: e.target.value })}
                      placeholder="STAND · FERIA / PRODUCTO 3D"
                      className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-3.5 py-2 text-brand-cream text-sm focus:border-brand-orange outline-none"
                    />
                  </div>
                </div>

                {/* 2. Imagen Principal */}
                <ImageUploader
                  currentImageUrl={renderForm.img}
                  folder="miluarte/renders"
                  label="Imagen Principal (Render Final) *"
                  onUploadSuccess={(res) => {
                    setRenderForm((prev) => ({
                      ...prev,
                      img: res.secureUrl,
                      publicId: res.publicId,
                    }));
                  }}
                />

                {/* 3. Software utilizado */}
                <TagEditor
                  tags={renderForm.software || []}
                  onChange={(newSoftware) => setRenderForm({ ...renderForm, software: newSoftware })}
                  label="Software Utilizado"
                  placeholder="Ej: Blender, Cinema 4D, Octane, AutoCAD"
                />

                {/* 4. Entregables & Descripción */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                    Tipo de Entrega
                  </label>
                  <input
                    type="text"
                    value={renderForm.delivery}
                    onChange={(e) => setRenderForm({ ...renderForm, delivery: e.target.value })}
                    placeholder="Ej: Planos técnicos + Renders fotorrealistas"
                    className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-3.5 py-2 text-brand-cream text-sm focus:border-brand-orange outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                    Descripción del Proyecto
                  </label>
                  <textarea
                    rows={3}
                    value={renderForm.description}
                    onChange={(e) => setRenderForm({ ...renderForm, description: e.target.value })}
                    placeholder="Describe la solución espacial, materiales, iluminación y resultado..."
                    className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl p-3 text-brand-cream text-sm focus:border-brand-orange outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* 5. Proceso paso a paso (Boceto, Blockout, Clay render, Final) */}
                <div className="pt-4 border-t border-brand-cream/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-4 h-4 text-brand-orange" />
                    <label className="font-sans text-brand-cream/90 text-xs uppercase tracking-wider font-medium">
                      Pasos del Proceso (Making-of visual)
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(renderForm.process || []).map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-brand-bg/80 border border-brand-cream/15 rounded-xl flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-[10px] text-brand-orange uppercase font-bold">
                            Paso {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={step.label}
                            onChange={(e) => {
                              const newProcess = [...(renderForm.process || [])];
                              newProcess[idx].label = e.target.value;
                              setRenderForm({ ...renderForm, process: newProcess });
                            }}
                            placeholder="Ej: Boceto en papel"
                            className="bg-brand-dark border border-brand-cream/10 rounded px-2 py-0.5 text-xs text-brand-cream flex-1 ml-2 outline-none"
                          />
                        </div>

                        <ImageUploader
                          compact
                          currentImageUrl={step.src}
                          folder="miluarte/renders/process"
                          label=""
                          onUploadSuccess={(res) => {
                            const newProcess = [...(renderForm.process || [])];
                            newProcess[idx].src = res.secureUrl;
                            newProcess[idx].publicId = res.publicId;
                            setRenderForm({ ...renderForm, process: newProcess });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Videos (Loop y Making of) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-brand-cream/10">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-brand-cream/50" />
                      <span>URL Video Render Loop (MP4)</span>
                    </label>
                    <input
                      type="text"
                      value={renderForm.videoSrcMp4}
                      onChange={(e) => setRenderForm({ ...renderForm, videoSrcMp4: e.target.value })}
                      placeholder="/videos/sample-3d.mp4"
                      className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-3.5 py-2 text-brand-cream text-xs focus:border-brand-orange outline-none font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-brand-orange" />
                      <span>URL Video Making Of (MP4)</span>
                    </label>
                    <input
                      type="text"
                      value={renderForm.makingOfVideoMp4}
                      onChange={(e) => setRenderForm({ ...renderForm, makingOfVideoMp4: e.target.value })}
                      placeholder="/videos/sample-bbb.mp4"
                      className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-3.5 py-2 text-brand-cream text-xs focus:border-brand-orange outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-cream/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/70 hover:text-brand-cream cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-cream hover:text-brand-ink text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
                  >
                    {editingRender ? "Guardar Cambios" : "Crear Proyecto 3D"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmación Borrar */}
      <ConfirmDialog
        isOpen={Boolean(deletingRender)}
        onClose={() => setDeletingRender(null)}
        onConfirm={handleDeleteRender}
        title="¿Eliminar este proyecto 3D?"
        description={`Se eliminará "${deletingRender?.title}" de la sección de Renders 3D.`}
        confirmText="Eliminar Proyecto"
      />

      {/* Toast */}
      <Toast
        isOpen={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </AdminLayout>
  );
}
