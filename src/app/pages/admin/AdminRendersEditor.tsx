import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
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
  Play,
  RotateCcw,
  Save,
  Sparkles,
  Cloud,
  HardDrive,
  Camera,
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DragSortableList } from "../../components/admin/DragSortableList";
import { ImageUploader } from "../../components/admin/ImageUploader";
import { ModelUploader } from "../../components/admin/ModelUploader";
import { VideoUploader } from "../../components/admin/VideoUploader";
import { R2MediaLibraryModal } from "../../components/admin/R2MediaLibraryModal";
import { TagEditor } from "../../components/admin/TagEditor";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { MediaLibraryModal } from "../../components/admin/MediaLibraryModal";
import { Toast } from "../../components/admin/Toast";
import { ModelViewer3D } from "../../components/ModelViewer3D";
import { RenderItem, RenderProcessStep } from "../../types/cms";
import { useAdminApi } from "../../hooks/useAdminApi";
import { useUpload } from "../../hooks/useUpload";
import { getOptimizedImageUrl } from "../../utils/cloudinary";
import { RENDERS } from "../../data/rendersData";
import { C } from "../../tokens";

type DeviceView = "desktop" | "tablet" | "mobile";
type Lang = "es" | "en";

export function AdminRendersEditor() {
  const [renders, setRenders] = useState<RenderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Lang>("es");
  const [device, setDevice] = useState<DeviceView>("desktop");
  const [cleanPreview, setCleanPreview] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  // R2 Storage Stats
  const [r2Stats, setR2Stats] = useState<{
    totalSizeBytes: number;
    usedPercentage: number;
    filesCount: number;
  } | null>(null);

  // Modal Biblioteca de Renders
  const [isR2ModalOpen, setIsR2ModalOpen] = useState(false);

  // Textos del Hero y secciones (Live Editing)
  const [serverTexts, setServerTexts] = useState({
    es: {
      heroCategory: "3D & VISUALIZACIÓN",
      heroTitle: "Del plano a la pantalla",
      heroDescription: "Renders, modelado y visualización de espacios, productos y stands. Cada pieza comienza en papel y termina en un mundo tridimensional.",
      galleryTitle: "PROYECTOS RECIENTES",
    },
    en: {
      heroCategory: "3D & VISUALIZATION",
      heroTitle: "From blueprint to screen",
      heroDescription: "Renders, modeling and visualization of spaces, products and stands. Each piece begins on paper and ends in a three-dimensional world.",
      galleryTitle: "RECENT PROJECTS",
    },
  });

  const [draftTexts, setDraftTexts] = useState({
    es: {
      heroCategory: "3D & VISUALIZACIÓN",
      heroTitle: "Del plano a la pantalla",
      heroDescription: "Renders, modelado y visualización de espacios, productos y stands. Cada pieza comienza en papel y termina en un mundo tridimensional.",
      galleryTitle: "PROYECTOS RECIENTES",
    },
    en: {
      heroCategory: "3D & VISUALIZATION",
      heroTitle: "From blueprint to screen",
      heroDescription: "Renders, modeling and visualization of spaces, products and stands. Each piece begins on paper and ends in a three-dimensional world.",
      galleryTitle: "RECENT PROJECTS",
    },
  });

  const [serverSnapshot, setServerSnapshot] = useState<string>("");
  const currentSnapshot = JSON.stringify(draftTexts);
  const hasTextChanges = serverSnapshot !== "" && currentSnapshot !== serverSnapshot;

  // Modal Crear / Editar Proyecto
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
    model3dSrc: "",
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

  const fetchTexts = async () => {
    try {
      const data = await request<any>("/api/admin/texts");
      if (data) {
        const nextTexts = {
          es: {
            heroCategory: data.es?.renders?.heroCategory || "3D & VISUALIZACIÓN",
            heroTitle: data.es?.renders?.heroTitle || "Del plano a la pantalla",
            heroDescription: data.es?.renders?.heroDescription || "Renders, modelado y visualización de espacios, productos y stands. Cada pieza comienza en papel y termina en un mundo tridimensional.",
            galleryTitle: data.es?.renders?.galleryTitle || "PROYECTOS RECIENTES",
          },
          en: {
            heroCategory: data.en?.renders?.heroCategory || "3D & VISUALIZATION",
            heroTitle: data.en?.renders?.heroTitle || "From blueprint to screen",
            heroDescription: data.en?.renders?.heroDescription || "Renders, modeling and visualization of spaces, products and stands. Each piece begins on paper and ends in a three-dimensional world.",
            galleryTitle: data.en?.renders?.galleryTitle || "RECENT PROJECTS",
          },
        };
        setServerTexts(nextTexts);
        setDraftTexts(nextTexts);
        setServerSnapshot(JSON.stringify(nextTexts));
      }
    } catch (e) {
      console.warn("Error cargando textos de renders:", e);
    }
  };

  const handleSaveTexts = async () => {
    try {
      setIsSaving(true);
      await request("/api/admin/texts", {
        method: "PUT",
        body: JSON.stringify({
          es: { renders: draftTexts.es },
          en: { renders: draftTexts.en },
        }),
      });
      setServerTexts(JSON.parse(JSON.stringify(draftTexts)));
      setServerSnapshot(currentSnapshot);
      setToast({ message: "¡Textos del Hero y galería guardados!", type: "success", open: true });
    } catch (err: any) {
      setToast({ message: "Error al guardar textos: " + (err.message || "Fallo"), type: "error", open: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardTexts = () => {
    setDraftTexts(JSON.parse(JSON.stringify(serverTexts)));
    setToast({ message: "Cambios de texto descartados.", type: "success", open: true });
  };

  const fetchR2Stats = async () => {
    try {
      const data = await request<{
        totalSizeBytes: number;
        usedPercentage: number;
        files: any[];
      }>("/api/admin/r2?action=list");
      if (data && typeof data.totalSizeBytes === "number") {
        setR2Stats({
          totalSizeBytes: data.totalSizeBytes,
          usedPercentage: data.usedPercentage || 0,
          filesCount: data.files?.length || 0,
        });
      }
    } catch {
      // Silencioso
    }
  };

  useEffect(() => {
    fetchRenders();
    fetchR2Stats();
    fetchTexts();
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
      model3dSrc: "",
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

  const handleAddProcessStep = () => {
    setRenderForm((prev) => ({
      ...prev,
      process: [...(prev.process || []), { label: "", src: "" }],
    }));
  };

  // Alternancia de columnas
  const getColSpan = (i: number) => {
    const isSecondInRow = i % 2 === 1;
    const isOddRow = Math.floor(i / 2) % 2 === 1;
    if (!isOddRow) {
      return isSecondInRow ? "md:col-span-2" : "md:col-span-3";
    } else {
      return isSecondInRow ? "md:col-span-3" : "md:col-span-2";
    }
  };

  // Barra de Acciones Superior (Estilo Minimalista e Intuitivo)
  const headerActions = (
    <div className="flex items-center gap-2.5 flex-wrap justify-end">
      {/* Selector de idioma */}
      <div className="flex items-center p-1 rounded-xl bg-brand-bg border border-brand-cream/15">
        <button
          type="button"
          onClick={() => setLang("es")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
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
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            lang === "en"
              ? "bg-brand-blush text-brand-ink shadow-xs font-semibold"
              : "text-brand-cream/60 hover:text-brand-cream"
          }`}
        >
          <span>🇬🇧</span>
          <span>English</span>
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
          title="Vista Pantalla Completa"
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

      {/* Badge Informativo de Almacenamiento Cloudflare R2 (NO clickeable) */}
      <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-brand-cream/10 text-xs select-none">
        <Cloud className="w-4 h-4 text-[#E55427]" />
        <span className="text-brand-cream/70 font-sans">Cloudflare R2:</span>
        <span className="font-mono text-white font-medium">
          {r2Stats ? `${(r2Stats.totalSizeBytes / (1024 * 1024)).toFixed(1)} MB / 10 GB` : "Conectado"}
        </span>
        {r2Stats && (
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            {r2Stats.usedPercentage}%
          </span>
        )}
      </div>

      {/* Botón Biblioteca de Renders */}
      <button
        type="button"
        onClick={() => setIsR2ModalOpen(true)}
        className="px-3.5 py-1.5 rounded-xl border border-brand-cream/15 hover:border-[#E55427]/50 hover:bg-[#E55427]/10 text-xs text-brand-cream flex items-center gap-1.5 transition-colors cursor-pointer"
        title="Explorar modelos 3D y vídeos en la nube"
      >
        <Layers className="w-3.5 h-3.5 text-[#E55427]" />
        <span>Biblioteca de Renders</span>
      </button>

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

      {/* Botón Descartar Textos */}
      {hasTextChanges && (
        <button
          type="button"
          onClick={handleDiscardTexts}
          className="px-3 py-1.5 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Descartar</span>
        </button>
      )}

      {/* Botón Guardar Textos */}
      <button
        type="button"
        onClick={handleSaveTexts}
        disabled={isSaving || !hasTextChanges}
        className="px-4 py-1.5 rounded-xl bg-brand-blush hover:bg-brand-cream text-brand-ink text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-brand-ink border-t-transparent rounded-full animate-spin" />
            <span>Guardando...</span>
          </>
        ) : (
          <>
            <Save className="w-3.5 h-3.5" />
            <span>{hasTextChanges ? "Guardar Textos" : "Textos al día"}</span>
          </>
        )}
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
        className="px-4 py-1.5 rounded-xl bg-[#E55427] hover:bg-[#E55427]/80 text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-md"
      >
        <Plus className="w-4 h-4" />
        <span>Nuevo Proyecto 3D</span>
      </button>
    </div>
  );

  return (
    <AdminLayout
      title="Renders 3D & Stands (Live)"
      subtitle={`${renders.length} proyectos 3D · Edición en vivo del Hero y galería`}
      actions={headerActions}
    >
      {/* Contenedor del Viewport Responsivo */}
      <div
        className={`w-full mx-auto transition-all duration-300 rounded-2xl overflow-hidden border border-brand-cream/10 shadow-2xl ${
          device === "mobile"
            ? "max-w-[420px]"
            : device === "tablet"
            ? "max-w-[768px]"
            : "w-full"
        }`}
        style={{ backgroundColor: C.bg }}
      >
        {/* ── HERO LIVE SECTION (Calco de /renders) ── */}
        <section className="relative pt-12 pb-12 px-6 md:px-10 max-w-[1200px] mx-auto border-b border-white/5">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Columna Izquierda: Textos Editables en Vivo */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center">
              {/* Subtítulo / Categoría */}
              <div className="relative group/field mb-3">
                <input
                  type="text"
                  value={draftTexts[lang]?.heroCategory || ""}
                  onChange={(e) =>
                    setDraftTexts((prev) => ({
                      ...prev,
                      [lang]: { ...prev[lang], heroCategory: e.target.value },
                    }))
                  }
                  readOnly={cleanPreview}
                  placeholder="3D & VISUALIZACIÓN"
                  className={`w-full font-sans text-[10px] tracking-[0.3em] font-semibold text-brand-orange uppercase bg-transparent outline-none transition-all ${
                    !cleanPreview
                      ? "p-1.5 rounded-lg border border-dashed border-brand-orange/30 hover:border-brand-orange focus:bg-black/30 focus:border-solid"
                      : "border-transparent"
                  }`}
                  style={{ color: C.orange }}
                />
              </div>

              {/* Título Principal: "Del plano a la pantalla" */}
              <div className="relative group/field mb-4">
                <input
                  type="text"
                  value={draftTexts[lang]?.heroTitle || ""}
                  onChange={(e) =>
                    setDraftTexts((prev) => ({
                      ...prev,
                      [lang]: { ...prev[lang], heroTitle: e.target.value },
                    }))
                  }
                  readOnly={cleanPreview}
                  placeholder="Del plano a la pantalla"
                  className={`w-full font-serif font-light text-brand-cream tracking-tight bg-transparent outline-none transition-all ${
                    !cleanPreview
                      ? "p-2 rounded-lg border border-dashed border-brand-cream/30 hover:border-brand-blush focus:bg-black/30 focus:border-solid"
                      : "border-transparent"
                  }`}
                  style={{
                    fontSize: device === "mobile" ? "28px" : "36px",
                    lineHeight: 1.15,
                  }}
                />
              </div>

              {/* Descripción del Hero */}
              <div className="relative group/field">
                <textarea
                  rows={3}
                  value={draftTexts[lang]?.heroDescription || ""}
                  onChange={(e) =>
                    setDraftTexts((prev) => ({
                      ...prev,
                      [lang]: { ...prev[lang], heroDescription: e.target.value },
                    }))
                  }
                  readOnly={cleanPreview}
                  placeholder="Renders, modelado y visualización de espacios, productos y stands..."
                  className={`w-full font-sans text-sm leading-relaxed text-brand-secondary bg-transparent outline-none resize-none transition-all ${
                    !cleanPreview
                      ? "p-2 rounded-lg border border-dashed border-brand-cream/30 hover:border-brand-blush focus:bg-black/30 focus:border-solid"
                      : "border-transparent"
                  }`}
                  style={{ color: C.secondary }}
                />
              </div>
            </div>

            {/* Columna Derecha: Visor 3D en Vivo del Hero */}
            <div className="w-full lg:w-[55%] relative group/hero3d">
              <div className="w-full h-[320px] sm:h-[380px] rounded-2xl overflow-hidden border border-white/10 bg-black/60 relative shadow-xl">
                <ModelViewer3D
                  isHero={true}
                  modelUrl={renders.find((r) => r.model3dSrc)?.model3dSrc || "/models/Matelec-optimized.glb"}
                  className="w-full h-full"
                />
              </div>

              {/* Badge indicativo sobre el 3D */}
              {!cleanPreview && (
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-mono text-brand-cream/70 flex items-center gap-1.5 pointer-events-none">
                  <Box className="w-3.5 h-3.5 text-[#E55427]" />
                  <span>3D Hero Interactivo</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── GRID LIVE SECTION (Calco de /renders) ── */}
        <section className="py-12 px-6 md:px-10" style={{ backgroundColor: "#0D0908" }}>
          <div className="max-w-[1200px] mx-auto">
            {/* Título de la Sección de Proyectos (Editable Inline) */}
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-white/5">
              <div className="relative group/field w-full max-w-md">
                <input
                  type="text"
                  value={draftTexts[lang]?.galleryTitle || ""}
                  onChange={(e) =>
                    setDraftTexts((prev) => ({
                      ...prev,
                      [lang]: { ...prev[lang], galleryTitle: e.target.value },
                    }))
                  }
                  readOnly={cleanPreview}
                  placeholder="PROYECTOS RECIENTES"
                  className={`w-full font-sans text-[11px] tracking-[0.3em] font-semibold text-brand-orange uppercase bg-transparent outline-none transition-all ${
                    !cleanPreview
                      ? "p-1.5 rounded-lg border border-dashed border-brand-orange/30 hover:border-brand-orange focus:bg-black/30 focus:border-solid"
                      : "border-transparent"
                  }`}
                  style={{ color: C.orange }}
                />
              </div>

              {!cleanPreview && (
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="px-3 py-1.5 rounded-lg bg-brand-cream/10 hover:bg-brand-blush text-brand-cream hover:text-brand-ink text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Proyecto</span>
                </button>
              )}
            </div>

            {/* Listado de Tarjetas de Renders */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-[16/9] rounded-2xl bg-black/40 border border-white/5 animate-pulse md:col-span-2" />
                ))}
              </div>
            ) : renders.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-2xl p-8">
                <p className="font-serif italic text-brand-cream/40 text-lg mb-4">No hay proyectos 3D registrados</p>
                <button
                  onClick={handleOpenCreate}
                  className="px-5 py-2.5 rounded-xl bg-brand-blush text-brand-ink text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  Crear primer proyecto 3D
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {renders.map((item, i) => {
                  const colClass = getColSpan(i);

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      className={`group/card relative rounded-2xl overflow-hidden bg-brand-dark border border-white/10 hover:border-brand-blush/60 shadow-xl transition-all ${colClass}`}
                    >
                      {/* Portada / Render */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40">
                        <img
                          src={getOptimizedImageUrl(item.img, 800)}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                        />

                        {/* Badge de Categoría */}
                        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/10 text-[9px] font-sans tracking-wider uppercase text-brand-blush flex items-center gap-1">
                          {item.model3dSrc && <Box className="w-3 h-3 text-[#E55427]" />}
                          <span>{item.badge || "STAND · 3D"}</span>
                        </div>

                        {/* Video Icon */}
                        {item.makingOfVideoMp4 && (
                          <div className="absolute top-3 right-3 bg-brand-blush text-brand-ink p-1.5 rounded-full shadow-lg pointer-events-none">
                            <Play className="w-3 h-3 fill-brand-ink" />
                          </div>
                        )}

                        {/* Hover Overlay con Botones de Edición */}
                        {!cleanPreview && (
                          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center gap-2.5 p-4">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="px-4 py-2 rounded-xl bg-brand-blush text-brand-ink font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg hover:bg-brand-cream transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Editar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeletingRender(item)}
                              className="p-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-white cursor-pointer shadow-lg transition-colors"
                              title="Eliminar proyecto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Info de la Tarjeta */}
                      <div className="p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-sans text-brand-cream/50 mb-1">
                            <span>{item.client || "Cliente"}</span>
                            <span>{item.year || "2026"}</span>
                          </div>
                          <h4 className="font-serif text-lg text-brand-cream font-light mb-1.5">{item.title}</h4>
                          <p className="font-sans text-xs text-brand-cream/70 line-clamp-2 leading-relaxed mb-3">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-1 pt-2.5 border-t border-white/5 text-[10px] font-mono text-brand-cream/40">
                          {(item.software || []).map((s, idx) => (
                            <span key={idx} className="bg-white/5 px-2 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                          {item.model3dSrc && (
                            <span className="bg-[#E55427]/20 text-[#E55427] border border-[#E55427]/30 px-2 py-0.5 rounded font-bold ml-auto">
                              3D
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── MODAL SLIDE-IN CREAR / EDITAR PROYECTO 3D ── */}
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
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                        Imagen de Portada (Render Principal) *
                      </label>
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
                    </div>

                    {/* Modelo 3D Interactivo (Blender .glb en Cloudflare R2) */}
                    <div className="flex flex-col gap-2 p-4 rounded-xl bg-brand-bg/80 border border-brand-cream/15">
                      <div className="flex items-center justify-between">
                        <label className="font-sans text-brand-cream text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                          <Box className="w-4 h-4 text-[#E55427]" />
                          <span>Modelo 3D Interactivo (Blender .glb)</span>
                        </label>
                        {renderForm.model3dSrc && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                            3D Activo
                          </span>
                        )}
                      </div>
                      <ModelUploader
                        value={renderForm.model3dSrc}
                        onChange={(url) => setRenderForm((prev) => ({ ...prev, model3dSrc: url }))}
                      />
                    </div>

                    {/* Vídeo Making-Of (Cloudflare R2) */}
                    <VideoUploader
                      value={renderForm.makingOfVideoMp4 || ""}
                      onChange={(url) => setRenderForm({ ...renderForm, makingOfVideoMp4: url })}
                      label="Vídeo Making-Of (MP4 en Cloudflare R2)"
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
                                className="text-red-400 hover:text-red-300 text-xs p-1"
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
                                placeholder="URL de la imagen del paso"
                                className="flex-1 bg-brand-dark px-3 py-1.5 rounded-lg border border-brand-cream/10 text-xs text-brand-cream outline-none focus:border-brand-blush font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => setStepMediaModalIndex(idx)}
                                className="px-2.5 py-1.5 rounded-lg bg-brand-cream/10 hover:bg-brand-cream/20 text-xs text-brand-cream shrink-0 cursor-pointer"
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

      {/* ── MODAL GENERAL BIBLIOTECA DE RENDERS (Cloudflare R2) ── */}
      <R2MediaLibraryModal
        isOpen={isR2ModalOpen}
        onClose={() => setIsR2ModalOpen(false)}
        filterType="all"
        title="Biblioteca de Renders"
      />

      {/* ── MODAL BIBLIOTECA PARA PASOS DE PROCESO ── */}
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
        title="Biblioteca de Medios"
      />

      {/* ── CONFIRMACIÓN BORRAR ── */}
      <ConfirmDialog
        isOpen={Boolean(deletingRender)}
        onClose={() => setDeletingRender(null)}
        onConfirm={handleDeleteRender}
        title="¿Eliminar este proyecto 3D?"
        description={`¿Estás segura de que deseas eliminar permanentemente "${deletingRender?.title || "este proyecto"}" del catálogo de renders?`}
        confirmText="Eliminar Proyecto"
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
