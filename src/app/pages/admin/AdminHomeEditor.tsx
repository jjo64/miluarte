import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Save,
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  Edit3,
  Check,
  ExternalLink,
  Camera,
  Layers,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { Toast } from "../../components/admin/Toast";
import { MediaLibraryModal } from "../../components/admin/MediaLibraryModal";
import { useAdminApi } from "../../hooks/useAdminApi";
import { useUpload } from "../../hooks/useUpload";
import { translations as defaultTranslations } from "../../locales/translations";
import { getOptimizedImageUrl } from "../../utils/cloudinary";
import { ClientsMarquee } from "../../components/ClientsMarquee";
import { HorizontalGallery } from "../../components/HorizontalGallery";
import { SketchSlider } from "../../components/SketchSlider";
import { BeforeAfterSlider } from "../../components/BeforeAfterSlider";
import { C, SANS, SERIF, RADIUS } from "../../tokens";

type Lang = "es" | "en";
type DeviceView = "desktop" | "tablet" | "mobile";

const DEFAULT_ANIMAS_SKETCH = "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Captura_de_pantalla_2026-06-19_004226_kbbzwm.png";
const DEFAULT_ANIMAS_FINAL  = "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Captura_de_pantalla_2026-06-19_004056_lpcimv.png";
const DEFAULT_FEATURED_IMG  = "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/diggin/Doke_Red_Flag_u1njsw.jpg";
const DEFAULT_HERO_IMG      = "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/axtt8y6owprqrjralpyy.jpg";

const DEFAULT_STAND_BEFORE = "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/Captura_de_pantalla_2026-06-18_224728_qvosll.png";
const DEFAULT_STAND_AFTER  = "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/diggin/Doke_Red_Flag_u1njsw.jpg";
const DEFAULT_DIGGIN_IMG   = "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/624072385_18076991993069555_3759238577248943847_n_zjw6f8.jpg";
const DEFAULT_MUSAE_IMG    = "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/532613326_18320483857235254_170206825296032194_n_mcewf6.jpg";
const DEFAULT_PORTRAIT_IMG = "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/533637781_18320483821235254_4718922861619683556_n_ddrhz1.jpg";

const DEFAULT_GALLERY_IMAGES = [
  { src: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/532613326_18320483857235254_170206825296032194_n_mcewf6.jpg", category: "ilustracion", altKey: "obra1" },
  { src: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/533637781_18320483821235254_4718922861619683556_n_ddrhz1.jpg", category: "concept", altKey: "obra2" },
  { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781798241/miluarte/archivo/719099666_18085459703434740_3604615127722183027_n_apifn2.jpg", category: "ilustracion", altKey: "obra3" },
  { src: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/624072385_18076991993069555_3759238577248943847_n_zjw6f8.jpg", category: "musica", altKey: "obra4" },
  { src: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Captura_de_pantalla_2026-06-18_175704_agpitt.png", category: "concept", altKey: "obra5" },
  { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781798241/miluarte/archivo/656747786_18083218367600656_3599812440241416906_n_f8npa1.jpg", category: "joyeria", altKey: "obra6" },
  { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/miluarte/archivo/520988252_18317337157235254_3623552272738405742_n_xafgzp.jpg", category: "concept", altKey: "obra7" },
  { src: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/favicon_xih1kk.jpg", category: "ilustracion", altKey: "obra8" },
];

function deepMerge(target: any, source: any): any {
  if (typeof target !== "object" || target === null) return source;
  if (typeof source !== "object" || source === null) return target;

  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (!(key in target)) {
        Object.assign(output, { [key]: source[key] });
      } else {
        output[key] = deepMerge(target[key], source[key]);
      }
    } else {
      Object.assign(output, { [key]: source[key] });
    }
  }
  return output;
}

export function AdminHomeEditor() {
  const { request } = useAdminApi();
  const { uploadImage } = useUpload();

  const [lang, setLang] = useState<Lang>("es");
  const [device, setDevice] = useState<DeviceView>("desktop");
  const [cleanPreview, setCleanPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // Estado de referencia guardado en servidor
  const [serverSnapshot, setServerSnapshot] = useState<string | null>(null);

  // Modal Biblioteca de Medios
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  // Subida de imagen activa
  const [activeImageTarget, setActiveImageTarget] = useState<string | null>(null);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Textos y configuraciones
  const [serverTexts, setServerTexts] = useState({
    es: defaultTranslations.es,
    en: defaultTranslations.en,
  });

  const [draftTexts, setDraftTexts] = useState({
    es: defaultTranslations.es,
    en: defaultTranslations.en,
  });

  // Imágenes del Inicio editables
  const [heroImage, setHeroImage] = useState<string>(DEFAULT_HERO_IMG);
  const [featuredImage, setFeaturedImage] = useState<string>(DEFAULT_FEATURED_IMG);
  const [sketchImg, setSketchImg] = useState<string>(DEFAULT_ANIMAS_SKETCH);
  const [finalImg, setFinalImg] = useState<string>(DEFAULT_ANIMAS_FINAL);
  const [galleryImages, setGalleryImages] = useState(DEFAULT_GALLERY_IMAGES);

  // Imágenes de las secciones de servicios
  const [servicesImages, setServicesImages] = useState({
    disenoGrafico: DEFAULT_DIGGIN_IMG,
    stand3dBefore: DEFAULT_STAND_BEFORE,
    stand3dAfter: DEFAULT_STAND_AFTER,
    diggin: DEFAULT_DIGGIN_IMG,
    ilustracion: DEFAULT_MUSAE_IMG,
    conceptArt: DEFAULT_PORTRAIT_IMG,
  });

  // Comparación reactiva profunda para determinar si hay cambios reales pendientes
  const currentSnapshot = JSON.stringify({
    draftTexts,
    heroImage,
    featuredImage,
    sketchImg,
    finalImg,
    galleryImages,
    servicesImages,
  });

  const hasChanges = serverSnapshot !== null && serverSnapshot !== currentSnapshot;

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; open: boolean }>({
    message: "",
    type: "success",
    open: false,
  });

  useEffect(() => {
    fetchTexts();
  }, []);

  const fetchTexts = async () => {
    try {
      setLoading(true);
      const res = await request<any>("/api/admin/texts");
      let currentTexts = {
        es: defaultTranslations.es,
        en: defaultTranslations.en,
      };
      let curHero = DEFAULT_HERO_IMG;
      let curFeatured = DEFAULT_FEATURED_IMG;
      let curSketch = DEFAULT_ANIMAS_SKETCH;
      let curFinal = DEFAULT_ANIMAS_FINAL;
      let curGallery = DEFAULT_GALLERY_IMAGES;
      let curServices = {
        disenoGrafico: DEFAULT_DIGGIN_IMG,
        stand3dBefore: DEFAULT_STAND_BEFORE,
        stand3dAfter: DEFAULT_STAND_AFTER,
        diggin: DEFAULT_DIGGIN_IMG,
        ilustracion: DEFAULT_MUSAE_IMG,
        conceptArt: DEFAULT_PORTRAIT_IMG,
      };

      if (res && (res.es || res.en)) {
        currentTexts = {
          es: deepMerge(defaultTranslations.es, res.es || {}),
          en: deepMerge(defaultTranslations.en, res.en || {}),
        };
        if (res.heroImage) curHero = res.heroImage;
        if (res.featuredImage) curFeatured = res.featuredImage;
        if (res.sketchImg) curSketch = res.sketchImg;
        if (res.finalImg) curFinal = res.finalImg;
        if (Array.isArray(res.galleryImages) && res.galleryImages.length > 0) {
          curGallery = res.galleryImages;
        }
        if (res.servicesImages) {
          curServices = { ...curServices, ...res.servicesImages };
        }
      }

      setServerTexts(currentTexts);
      setDraftTexts(currentTexts);
      setHeroImage(curHero);
      setFeaturedImage(curFeatured);
      setSketchImg(curSketch);
      setFinalImg(curFinal);
      setGalleryImages(curGallery);
      setServicesImages(curServices);

      setServerSnapshot(
        JSON.stringify({
          draftTexts: currentTexts,
          heroImage: curHero,
          featuredImage: curFeatured,
          sketchImg: curSketch,
          finalImg: curFinal,
          galleryImages: curGallery,
          servicesImages: curServices,
        })
      );
    } catch (err: any) {
      console.warn("Usando textos base:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateDraft = (path: string, value: any) => {
    setDraftTexts((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let current = next[lang];
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const getDraftValue = (path: string): any => {
    const parts = path.split(".");
    let current: any = draftTexts[lang];
    for (const p of parts) {
      if (current && typeof current === "object" && p in current) {
        current = current[p];
      } else {
        return "";
      }
    }
    return current !== undefined ? current : "";
  };

  const t = (path: string) => {
    const val = getDraftValue(path);
    return typeof val === "string" ? val : "";
  };

  const getBullets = (path: string): string[] => {
    const val = getDraftValue(path);
    return Array.isArray(val) ? val : [];
  };

  const updateBullet = (path: string, index: number, val: string) => {
    const currentBullets = [...getBullets(path)];
    currentBullets[index] = val;
    updateDraft(path, currentBullets);
  };

  // Disparar selector de archivo / biblioteca para una imagen específica
  const triggerImageUpload = (target: string) => {
    setActiveImageTarget(target);
    setIsMediaModalOpen(true);
  };

  const handleMediaSelect = (selectedUrl: string) => {
    if (!activeImageTarget) return;

    if (activeImageTarget === "hero") {
      setHeroImage(selectedUrl);
      updateDraft("hero.image", selectedUrl);
    } else if (activeImageTarget === "featured") {
      setFeaturedImage(selectedUrl);
      updateDraft("featured.image", selectedUrl);
    } else if (activeImageTarget === "sketch") {
      setSketchImg(selectedUrl);
      updateDraft("process.sketchImg", selectedUrl);
    } else if (activeImageTarget === "final") {
      setFinalImg(selectedUrl);
      updateDraft("process.finalImg", selectedUrl);
    } else if (activeImageTarget.startsWith("gallery_")) {
      const idx = parseInt(activeImageTarget.replace("gallery_", ""), 10);
      setGalleryImages((prev) => {
        const next = [...prev];
        if (next[idx]) {
          next[idx] = { ...next[idx], src: selectedUrl };
        }
        return next;
      });
    } else if (activeImageTarget.startsWith("services_")) {
      const key = activeImageTarget.replace("services_", "") as keyof typeof servicesImages;
      setServicesImages((prev) => ({ ...prev, [key]: selectedUrl }));
    }

    setToast({
      message: "¡Imagen actualizada con éxito en la vista previa!",
      type: "success",
      open: true,
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await request("/api/admin/texts", {
        method: "PUT",
        body: JSON.stringify({
          ...draftTexts,
          heroImage,
          featuredImage,
          sketchImg,
          finalImg,
          galleryImages,
          servicesImages,
        }),
      });

      setServerTexts(JSON.parse(JSON.stringify(draftTexts)));
      setServerSnapshot(currentSnapshot);
      setToast({
        message: "¡Página de inicio y todas las imágenes guardadas en el sitio web!",
        type: "success",
        open: true,
      });
    } catch (err: any) {
      setToast({
        message: err.message || "Error al guardar cambios de la portada",
        type: "error",
        open: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    fetchTexts();
    setToast({
      message: "Cambios descartados. Se restauró la última versión guardada.",
      type: "success",
      open: true,
    });
  };

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

      {/* Botón Vista Limpia */}
      <button
        type="button"
        onClick={() => setCleanPreview(!cleanPreview)}
        className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
          cleanPreview
            ? "bg-brand-cream/20 border-brand-cream text-brand-cream font-semibold shadow-xs"
            : "border-brand-cream/15 text-brand-cream/70 hover:text-brand-cream"
        }`}
        title={cleanPreview ? "Mostrar controles de edición" : "Ocultar controles para ver resultado limpio"}
      >
        {cleanPreview ? <EyeOff className="w-3.5 h-3.5 text-brand-blush" /> : <Eye className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{cleanPreview ? "Editar" : "Vista Limpia"}</span>
      </button>

      {/* Botón Descartar */}
      {hasChanges && (
        <button
          type="button"
          onClick={handleDiscard}
          className="px-3.5 py-2 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Descartar</span>
        </button>
      )}

      {/* Botón Guardar */}
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving || !hasChanges}
        className="px-5 py-2 rounded-xl bg-brand-blush hover:bg-brand-cream text-brand-ink text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-brand-ink border-t-transparent rounded-full animate-spin" />
            <span>Guardando...</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            <span>{hasChanges ? "Guardar Cambios" : "Al día"}</span>
          </>
        )}
      </button>

      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-2 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5 transition-all hidden xl:flex items-center gap-1.5 no-underline"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        <span>Ver Web</span>
      </a>
    </div>
  );

  return (
    <AdminLayout
      title="Editor Visual del Inicio (WYSIWYG)"
      subtitle={`Haz clic en cualquier texto o imagen para editar en tiempo real en ${lang === "es" ? "Español 🇪🇸" : "Inglés 🇬🇧"}`}
      actions={headerActions}
    >
      <div className="w-full flex flex-col items-center select-none">
        {/* Barra superior de guía interactiva */}
        {!cleanPreview && (
          <div className="w-full flex items-center justify-between px-5 py-3 bg-brand-dark/95 border border-brand-cream/10 rounded-t-2xl text-xs font-sans text-brand-cream/70 shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-brand-cream">
                Lienzo Completo: Clica sobre cualquier texto o sobre cualquier foto para reemplazarla al instante.
              </span>
            </div>
            <div className="flex items-center gap-3">
              {hasChanges ? (
                <span className="px-2.5 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange text-[11px] font-mono border border-brand-orange/30">
                  ● Cambios sin guardar
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 text-[11px] font-mono border border-emerald-400/20">
                  ✓ Todo sincronizado
                </span>
              )}
              <span className="font-mono text-[11px] text-brand-blush bg-brand-blush/10 px-2 py-0.5 rounded border border-brand-blush/20">
                Idioma: {lang.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Viewport a Pantalla Completa o Responsivo */}
        <div
          className={`w-full transition-all duration-300 border-x border-b border-brand-cream/10 rounded-b-2xl overflow-hidden shadow-2xl bg-brand-bg text-brand-cream ${
            device === "mobile"
              ? "max-w-[420px]"
              : device === "tablet"
              ? "max-w-[768px]"
              : "w-full"
          }`}
        >
          {/* ── 1. Hero Exacto ── */}
          <section className={`relative bg-brand-bg flex items-center overflow-hidden border-b border-brand-cream/10 ${device === "mobile" ? "py-10 min-h-auto" : "min-h-[640px] pt-16 pb-16 md:py-20"}`}>
            <div className={`relative z-10 w-full grid gap-10 px-6 md:px-12 max-w-[1200px] mx-auto items-center ${device === "desktop" ? "grid-cols-1 md:grid-cols-[1.1fr_1fr]" : "grid-cols-1"}`}>
              {/* Left: Bio */}
              <div className="flex flex-col justify-center order-1">
                <EditableField
                  label="Tagline del Hero"
                  value={t("hero.tagline")}
                  onChange={(val) => updateDraft("hero.tagline", val)}
                  cleanPreview={cleanPreview}
                  className="font-sans text-brand-blush text-[10px] tracking-[0.34em] uppercase mb-4 font-semibold"
                />

                <div className="mb-4">
                  <EditableField
                    label="Saludo inicial"
                    value={t("hero.greetingBefore")}
                    onChange={(val) => updateDraft("hero.greetingBefore", val)}
                    cleanPreview={cleanPreview}
                    className="font-serif text-brand-cream text-[2.6rem] md:text-[4.5rem] leading-[0.98] font-light tracking-tight whitespace-pre-line inline"
                  />
                  <EditableField
                    label="Nombre en cursiva"
                    value={t("hero.greetingItalic")}
                    onChange={(val) => updateDraft("hero.greetingItalic", val)}
                    cleanPreview={cleanPreview}
                    className="font-serif italic text-brand-blush text-[2.6rem] md:text-[4.5rem] leading-[0.98] font-light tracking-tight inline ml-2"
                  />
                </div>

                <EditableField
                  label="Frase artística / Manifiesto"
                  value={t("hero.artline")}
                  onChange={(val) => updateDraft("hero.artline", val)}
                  cleanPreview={cleanPreview}
                  multiline
                  className="font-serif italic text-brand-wall text-[1.15rem] md:text-[1.45rem] font-light leading-relaxed mb-6 max-w-[500px]"
                />

                <div className="w-12 h-0.5 bg-brand-blush mb-6" />

                <EditableField
                  label="Biografía principal (Párrafo 1)"
                  value={t("hero.bio1")}
                  onChange={(val) => updateDraft("hero.bio1", val)}
                  cleanPreview={cleanPreview}
                  multiline
                  className="font-sans text-brand-cream/80 text-[13.5px] leading-relaxed mb-3 max-w-[500px]"
                />

                <EditableField
                  label="Biografía secundaria (Párrafo 2)"
                  value={t("hero.bio2")}
                  onChange={(val) => updateDraft("hero.bio2", val)}
                  cleanPreview={cleanPreview}
                  multiline
                  className="font-sans text-brand-cream/70 text-[13.5px] leading-relaxed mb-8 max-w-[500px]"
                />

                <div className="flex gap-3.5 items-center flex-wrap">
                  <EditableField
                    label="Texto Botón 1"
                    value={t("hero.viewWorks")}
                    onChange={(val) => updateDraft("hero.viewWorks", val)}
                    cleanPreview={cleanPreview}
                    className="font-sans bg-brand-blush text-brand-ink text-[10px] tracking-widest uppercase py-3.5 px-7 font-semibold rounded-lg"
                  />
                  <EditableField
                    label="Texto Botón 2"
                    value={t("hero.sendInquiry")}
                    onChange={(val) => updateDraft("hero.sendInquiry", val)}
                    cleanPreview={cleanPreview}
                    className="font-sans text-brand-blush text-[10px] tracking-widest uppercase border border-brand-blush/45 py-3.5 px-6 bg-transparent rounded-lg"
                  />
                </div>
              </div>

              {/* Right: Foto enmarcada interactiva con subida al clic */}
              <div className="flex flex-col justify-start order-2 gap-4 items-center">
                <div
                  onClick={() => triggerImageUpload("hero")}
                  className="group/photo relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/5] bg-brand-dark max-w-[340px] w-full border-2 border-brand-cream/15 hover:border-brand-blush transition-all cursor-pointer"
                  title="Haz clic para subir y cambiar la foto del Hero"
                >
                  <img
                    src={getOptimizedImageUrl(heroImage, 800)}
                    alt="Nerea Lucas Pajares"
                    className="w-full h-full object-cover block transition-transform duration-500 group-hover/photo:scale-105"
                  />

                  {/* Badge Miluarte */}
                  <div className="absolute bottom-3.5 left-3.5 flex items-center gap-2 bg-[#180E09]/85 backdrop-blur-sm py-1.5 px-3 rounded-full border border-white/10 select-none pointer-events-none">
                    <img
                      src={getOptimizedImageUrl("https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/favicon_xih1kk.jpg", 80)}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="font-sans text-[#F5EDE0] text-[9px] tracking-widest uppercase">
                      Miluarte
                    </span>
                  </div>

                  {/* Overlay interactivo de cambio de foto */}
                  {!cleanPreview && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-xs opacity-0 group-hover/photo:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-brand-blush text-brand-ink flex items-center justify-center shadow-xl">
                        {uploadingTarget === "hero" ? (
                          <div className="w-5 h-5 border-2 border-brand-ink border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <p className="font-sans text-xs font-semibold text-brand-cream uppercase tracking-wider">
                          {uploadingTarget === "hero" ? "Subiendo a Cloudinary..." : "Cambiar Foto del Hero"}
                        </p>
                        <p className="font-sans text-[11px] text-brand-cream/60 mt-1">
                          Haz clic para seleccionar una foto de tu ordenador
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <p className="font-sans text-brand-cream/60 text-[11px] tracking-wider text-center">
                  Miluartedenara@gmail.com
                </p>
              </div>
            </div>
          </section>

          {/* ── 2. Proyecto Destacado Exacto (Diggin) ── */}
          <section className="bg-brand-dark py-20 border-t border-brand-cream/5">
            <div className="px-6 md:px-12 max-w-2xl mx-auto flex flex-col gap-3">
              <EditableField
                label="Eyebrow del proyecto"
                value={t("featured.eyebrow")}
                onChange={(val) => updateDraft("featured.eyebrow", val)}
                cleanPreview={cleanPreview}
                className="font-sans text-brand-blush text-[10px] tracking-[0.15em] uppercase flex items-center gap-2 font-medium"
              />

              {/* Imagen panorámica de Diggin interactiva con subida al clic */}
              <div
                onClick={() => triggerImageUpload("featured")}
                className="group/featured relative rounded-xl overflow-hidden my-4 shadow-2xl border-2 border-transparent hover:border-brand-blush transition-all cursor-pointer"
                title="Haz clic para cambiar la imagen del Proyecto Destacado"
              >
                <img
                  src={getOptimizedImageUrl(featuredImage, 1200)}
                  alt="Diggin"
                  className="w-full h-64 md:h-96 object-cover transition-transform duration-500 group-hover/featured:scale-105"
                />
                <div className="absolute top-3.5 left-3.5 bg-brand-blush text-brand-ink font-sans text-[9px] tracking-wider uppercase font-semibold px-3 py-1 rounded shadow-md pointer-events-none">
                  {t("featured.tag") || "DIRECCIÓN DE ARTE · IDENTIDAD VISUAL"}
                </div>

                {!cleanPreview && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover/featured:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-brand-blush text-brand-ink flex items-center justify-center shadow-lg">
                      {uploadingTarget === "featured" ? (
                        <div className="w-4 h-4 border-2 border-brand-ink border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5" />
                      )}
                    </div>
                    <span className="font-sans text-xs font-semibold text-brand-cream tracking-wider uppercase">
                      {uploadingTarget === "featured" ? "Subiendo a Cloudinary..." : "Cambiar Imagen de Proyecto Destacado"}
                    </span>
                  </div>
                )}
              </div>

              <EditableField
                label="Título Proyecto Destacado"
                value={t("featured.title")}
                onChange={(val) => updateDraft("featured.title", val)}
                cleanPreview={cleanPreview}
                className="font-serif text-brand-cream text-3xl md:text-4xl font-light leading-tight"
              />

              <EditableField
                label="Descripción Proyecto Destacado"
                value={t("featured.description")}
                onChange={(val) => updateDraft("featured.description", val)}
                cleanPreview={cleanPreview}
                multiline
                className="font-sans text-brand-cream/70 text-xs md:text-sm leading-relaxed my-2"
              />

              <div className="pt-4">
                <EditableField
                  label="Texto Botón Ver Caso"
                  value={t("featured.viewCase")}
                  onChange={(val) => updateDraft("featured.viewCase", val)}
                  cleanPreview={cleanPreview}
                  className="font-sans text-brand-cream text-[10px] tracking-widest uppercase border border-brand-cream/30 py-3.5 px-7 rounded-lg inline-block font-medium"
                />
              </div>
            </div>
          </section>

          {/* ── 3. Clientes y Colaboraciones ── */}
          <section className="py-12 px-6 md:px-12 text-center bg-brand-bg/50 border-y border-brand-cream/10">
            <EditableField
              label="Eyebrow Clientes"
              value={t("clients.eyebrow")}
              onChange={(val) => updateDraft("clients.eyebrow", val)}
              cleanPreview={cleanPreview}
              className="font-sans text-brand-blush text-[10px] tracking-[0.2em] uppercase mb-2 font-medium"
            />
            <EditableField
              label="Título Clientes"
              value={t("clients.title")}
              onChange={(val) => updateDraft("clients.title", val)}
              cleanPreview={cleanPreview}
              className="font-serif text-brand-cream text-2xl md:text-3xl font-light mb-3"
            />
            <div className="mt-6">
              <ClientsMarquee />
            </div>
          </section>

          {/* ── 4. Galería Horizontal de Obras Destacadas Interactiva ── */}
          <div className="py-10 bg-brand-bg">
            <HorizontalGallery
              images={galleryImages}
              editable={!cleanPreview}
              onImageClick={(idx) => triggerImageUpload(`gallery_${idx}`)}
            />
          </div>

          {/* ── 5. El Proceso Creativo (Sketch Slider) Interactivo ── */}
          <div className="bg-brand-dark/40 py-16 border-y border-brand-cream/10">
            <div className="max-w-xl mx-auto px-6 mb-8 text-center">
              <EditableField
                label="Título Proceso Creativo"
                value={t("process.title")}
                onChange={(val) => updateDraft("process.title", val)}
                cleanPreview={cleanPreview}
                className="font-sans text-brand-blush text-[10px] tracking-widest uppercase mb-1.5 font-medium"
              />
              <EditableField
                label="Subtítulo Proceso Creativo"
                value={t("process.subtitle")}
                onChange={(val) => updateDraft("process.subtitle", val)}
                cleanPreview={cleanPreview}
                className="font-serif text-brand-cream text-2xl md:text-3xl font-light mb-2.5"
              />
              <EditableField
                label="Texto Guía / Hint"
                value={t("process.hint")}
                onChange={(val) => updateDraft("process.hint", val)}
                cleanPreview={cleanPreview}
                multiline
                className="font-sans text-brand-cream/60 text-xs"
              />
            </div>

            <SketchSlider
              sketchImg={sketchImg}
              finalImg={finalImg}
              sketchImgPos="50% 17%"
              finalImgPos="50% 12%"
              title={t("process.title")}
              subtitle={t("process.subtitle")}
              hint={t("process.hint")}
              editable={!cleanPreview}
              onSketchClick={() => triggerImageUpload("sketch")}
              onFinalClick={() => triggerImageUpload("final")}
            />
          </div>

          {/* ── 6. Especialidades y Servicios (SeoServices) ── */}
          <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <EditableField
                label="Eyebrow Servicios"
                value={t("seoServices.eyebrow")}
                onChange={(val) => updateDraft("seoServices.eyebrow", val)}
                cleanPreview={cleanPreview}
                className="font-sans text-brand-blush text-[10px] tracking-[0.15em] uppercase mb-2 font-medium"
              />
              <EditableField
                label="Título de Servicios"
                value={t("seoServices.title")}
                onChange={(val) => updateDraft("seoServices.title", val)}
                cleanPreview={cleanPreview}
                className="font-serif text-brand-cream text-3xl md:text-5xl font-light mb-4"
              />
              <EditableField
                label="Descripción de Servicios"
                value={t("seoServices.description")}
                onChange={(val) => updateDraft("seoServices.description", val)}
                cleanPreview={cleanPreview}
                multiline
                className="font-sans text-brand-cream/70 text-xs md:text-sm leading-relaxed"
              />
            </div>

            {/* Grid de 4 Especialidades */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { key: "editorial", label: "Ilustración Editorial" },
                { key: "concept", label: "Concept Art" },
                { key: "graphics", label: "Diseño Gráfico" },
                { key: "clay", label: "Joyería & Arcilla" },
              ].map((item) => (
                <div key={item.key} className="p-6 rounded-2xl bg-brand-dark border border-brand-cream/10 flex flex-col justify-between">
                  <div>
                    <EditableField
                      label={`Título ${item.label}`}
                      value={t(`seoServices.items.${item.key}.title`)}
                      onChange={(val) => updateDraft(`seoServices.items.${item.key}.title`, val)}
                      cleanPreview={cleanPreview}
                      className="font-serif text-lg text-brand-cream mb-2"
                    />
                    <EditableField
                      label={`Descripción ${item.label}`}
                      value={t(`seoServices.items.${item.key}.description`)}
                      onChange={(val) => updateDraft(`seoServices.items.${item.key}.description`, val)}
                      cleanPreview={cleanPreview}
                      multiline
                      className="font-sans text-xs text-brand-cream/60 leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 7. SECCIONES DE SERVICIOS DETALLADAS (ServiceSections) 100% EDITABLES ── */}
          <div className="border-t border-brand-cream/10 flex flex-col">
            {/* 1. Diseño Gráfico (Identidad Visual y Comunicación) */}
            <section className="bg-brand-bg py-20 px-6 md:px-12 border-b border-brand-cream/10">
              <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Imagen Editable al Clic */}
                <div
                  onClick={() => triggerImageUpload("services_disenoGrafico")}
                  className="group/img relative aspect-[4/3] rounded-2xl overflow-hidden bg-brand-dark border-2 border-transparent hover:border-brand-blush cursor-pointer shadow-xl"
                  title="Haz clic para cambiar la imagen de Diseño Gráfico"
                >
                  <img
                    src={getOptimizedImageUrl(servicesImages.disenoGrafico, 800)}
                    alt="Diseño Gráfico"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                  />
                  {!cleanPreview && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-brand-blush text-brand-ink flex items-center justify-center">
                        <Camera className="w-5 h-5" />
                      </div>
                      <span className="text-xs uppercase font-sans text-brand-cream font-semibold tracking-wider">
                        Cambiar Imagen
                      </span>
                    </div>
                  )}
                </div>

                {/* Textos */}
                <div className="flex flex-col gap-3">
                  <EditableField
                    label="Etiqueta Sección"
                    value={t("services.items.diseno-grafico.label")}
                    onChange={(val) => updateDraft("services.items.diseno-grafico.label", val)}
                    cleanPreview={cleanPreview}
                    className="font-sans text-brand-blush text-[10px] tracking-[0.28em] uppercase font-semibold"
                  />
                  <EditableField
                    label="Título Sección"
                    value={t("services.items.diseno-grafico.title")}
                    onChange={(val) => updateDraft("services.items.diseno-grafico.title", val)}
                    cleanPreview={cleanPreview}
                    className="font-serif text-brand-cream text-3xl md:text-4xl font-light whitespace-pre-line leading-tight"
                  />
                  <EditableField
                    label="Descripción Sección"
                    value={t("services.items.diseno-grafico.description")}
                    onChange={(val) => updateDraft("services.items.diseno-grafico.description", val)}
                    cleanPreview={cleanPreview}
                    multiline
                    className="font-sans text-brand-cream/70 text-xs md:text-sm leading-relaxed"
                  />

                  {/* Bullets */}
                  <div className="flex flex-col gap-2 my-4">
                    {getBullets("services.items.diseno-grafico.bullets").map((bullet, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-brand-blush text-xs">◆</span>
                        <EditableField
                          label={`Punto ${idx + 1}`}
                          value={bullet}
                          onChange={(val) => updateBullet("services.items.diseno-grafico.bullets", idx, val)}
                          cleanPreview={cleanPreview}
                          className="font-sans text-xs text-brand-cream"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 2. 3D & Stands (Del plano a la realidad) */}
            <section className="bg-brand-dark py-20 px-6 md:px-12 border-b border-brand-cream/10">
              <div className="max-w-5xl mx-auto flex flex-col gap-8">
                <div className="max-w-2xl">
                  <EditableField
                    label="Etiqueta Sección"
                    value={t("services.items.3d-stands.label")}
                    onChange={(val) => updateDraft("services.items.3d-stands.label", val)}
                    cleanPreview={cleanPreview}
                    className="font-sans text-brand-blush text-[10px] tracking-[0.28em] uppercase font-semibold mb-2"
                  />
                  <EditableField
                    label="Título Sección"
                    value={t("services.items.3d-stands.title")}
                    onChange={(val) => updateDraft("services.items.3d-stands.title", val)}
                    cleanPreview={cleanPreview}
                    className="font-serif text-brand-cream text-3xl md:text-5xl font-light whitespace-pre-line leading-tight mb-3"
                  />
                  <EditableField
                    label="Descripción Sección"
                    value={t("services.items.3d-stands.description")}
                    onChange={(val) => updateDraft("services.items.3d-stands.description", val)}
                    cleanPreview={cleanPreview}
                    multiline
                    className="font-sans text-brand-cream/70 text-xs md:text-sm leading-relaxed mb-6"
                  />

                  <div className="flex flex-col gap-2">
                    {getBullets("services.items.3d-stands.bullets").map((bullet, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-brand-blush text-xs">◆</span>
                        <EditableField
                          label={`Punto ${idx + 1}`}
                          value={bullet}
                          onChange={(val) => updateBullet("services.items.3d-stands.bullets", idx, val)}
                          cleanPreview={cleanPreview}
                          className="font-sans text-xs text-brand-cream"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comparador 3D con botones editables */}
                <div className="relative rounded-2xl overflow-hidden border border-brand-cream/15">
                  <BeforeAfterSlider
                    beforeSrc={servicesImages.stand3dBefore}
                    afterSrc={servicesImages.stand3dAfter}
                    beforeLabel={t("services.render3D") || "Render 3D"}
                    afterLabel={t("services.realResult") || "Resultado real"}
                    height={400}
                  />

                  {!cleanPreview && (
                    <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => triggerImageUpload("services_stand3dBefore")}
                        className="px-3 py-1.5 rounded-lg bg-brand-blush text-brand-ink text-[11px] font-sans font-semibold uppercase tracking-wider shadow-lg cursor-pointer hover:bg-brand-cream flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Cambiar Render 3D</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => triggerImageUpload("services_stand3dAfter")}
                        className="px-3 py-1.5 rounded-lg bg-brand-blush text-brand-ink text-[11px] font-sans font-semibold uppercase tracking-wider shadow-lg cursor-pointer hover:bg-brand-cream flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Cambiar Foto Real</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 3. Diggin' (Diseñadora Oficial del Sello Musical) */}
            <section className="bg-brand-bg py-20 px-6 md:px-12 border-b border-brand-cream/10">
              <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-3">
                  <EditableField
                    label="Etiqueta Sección"
                    value={t("services.items.diggin.label")}
                    onChange={(val) => updateDraft("services.items.diggin.label", val)}
                    cleanPreview={cleanPreview}
                    className="font-sans text-brand-blush text-[10px] tracking-[0.28em] uppercase font-semibold"
                  />
                  <EditableField
                    label="Título Sección"
                    value={t("services.items.diggin.title")}
                    onChange={(val) => updateDraft("services.items.diggin.title", val)}
                    cleanPreview={cleanPreview}
                    className="font-serif text-brand-cream text-3xl md:text-4xl font-light whitespace-pre-line leading-tight"
                  />
                  <EditableField
                    label="Descripción Sección"
                    value={t("services.items.diggin.description")}
                    onChange={(val) => updateDraft("services.items.diggin.description", val)}
                    cleanPreview={cleanPreview}
                    multiline
                    className="font-sans text-brand-cream/70 text-xs md:text-sm leading-relaxed"
                  />

                  <div className="flex flex-col gap-2 my-4">
                    {getBullets("services.items.diggin.bullets").map((bullet, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-brand-blush text-xs">◆</span>
                        <EditableField
                          label={`Punto ${idx + 1}`}
                          value={bullet}
                          onChange={(val) => updateBullet("services.items.diggin.bullets", idx, val)}
                          cleanPreview={cleanPreview}
                          className="font-sans text-xs text-brand-cream"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  onClick={() => triggerImageUpload("services_diggin")}
                  className="group/img relative aspect-[4/3] rounded-2xl overflow-hidden bg-brand-dark border-2 border-transparent hover:border-brand-blush cursor-pointer shadow-xl"
                  title="Haz clic para cambiar la imagen de Diggin"
                >
                  <img
                    src={getOptimizedImageUrl(servicesImages.diggin, 800)}
                    alt="Diggin"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                  />
                  {!cleanPreview && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-brand-blush text-brand-ink flex items-center justify-center">
                        <Camera className="w-5 h-5" />
                      </div>
                      <span className="text-xs uppercase font-sans text-brand-cream font-semibold tracking-wider">
                        Cambiar Imagen
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 4. Ilustraciones (Arte Personal sin Filtros) */}
            <section className="bg-brand-dark py-20 px-6 md:px-12 border-b border-brand-cream/10">
              <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div
                  onClick={() => triggerImageUpload("services_ilustracion")}
                  className="group/img relative aspect-[4/3] rounded-2xl overflow-hidden bg-brand-dark border-2 border-transparent hover:border-brand-blush cursor-pointer shadow-xl"
                  title="Haz clic para cambiar la imagen de Ilustraciones"
                >
                  <img
                    src={getOptimizedImageUrl(servicesImages.ilustracion, 800)}
                    alt="Ilustraciones"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                  />
                  {!cleanPreview && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-brand-blush text-brand-ink flex items-center justify-center">
                        <Camera className="w-5 h-5" />
                      </div>
                      <span className="text-xs uppercase font-sans text-brand-cream font-semibold tracking-wider">
                        Cambiar Imagen
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <EditableField
                    label="Etiqueta Sección"
                    value={t("services.items.ilustracion.label")}
                    onChange={(val) => updateDraft("services.items.ilustracion.label", val)}
                    cleanPreview={cleanPreview}
                    className="font-sans text-brand-blush text-[10px] tracking-[0.28em] uppercase font-semibold"
                  />
                  <EditableField
                    label="Título Sección"
                    value={t("services.items.ilustracion.title")}
                    onChange={(val) => updateDraft("services.items.ilustracion.title", val)}
                    cleanPreview={cleanPreview}
                    className="font-serif text-brand-cream text-3xl md:text-4xl font-light whitespace-pre-line leading-tight"
                  />
                  <EditableField
                    label="Descripción Sección"
                    value={t("services.items.ilustracion.description")}
                    onChange={(val) => updateDraft("services.items.ilustracion.description", val)}
                    cleanPreview={cleanPreview}
                    multiline
                    className="font-sans text-brand-cream/70 text-xs md:text-sm leading-relaxed"
                  />

                  <div className="flex flex-col gap-2 my-4">
                    {getBullets("services.items.ilustracion.bullets").map((bullet, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-brand-blush text-xs">◆</span>
                        <EditableField
                          label={`Punto ${idx + 1}`}
                          value={bullet}
                          onChange={(val) => updateBullet("services.items.ilustracion.bullets", idx, val)}
                          cleanPreview={cleanPreview}
                          className="font-sans text-xs text-brand-cream"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Concept Art (Del Concepto al Universo) */}
            <section className="bg-brand-bg py-20 px-6 md:px-12">
              <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-3">
                  <EditableField
                    label="Etiqueta Sección"
                    value={t("services.items.concept-art.label")}
                    onChange={(val) => updateDraft("services.items.concept-art.label", val)}
                    cleanPreview={cleanPreview}
                    className="font-sans text-brand-blush text-[10px] tracking-[0.28em] uppercase font-semibold"
                  />
                  <EditableField
                    label="Título Sección"
                    value={t("services.items.concept-art.title")}
                    onChange={(val) => updateDraft("services.items.concept-art.title", val)}
                    cleanPreview={cleanPreview}
                    className="font-serif text-brand-cream text-3xl md:text-4xl font-light whitespace-pre-line leading-tight"
                  />
                  <EditableField
                    label="Descripción Sección"
                    value={t("services.items.concept-art.description")}
                    onChange={(val) => updateDraft("services.items.concept-art.description", val)}
                    cleanPreview={cleanPreview}
                    multiline
                    className="font-sans text-brand-cream/70 text-xs md:text-sm leading-relaxed"
                  />

                  <div className="flex flex-col gap-2 my-4">
                    {getBullets("services.items.concept-art.bullets").map((bullet, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-brand-blush text-xs">◆</span>
                        <EditableField
                          label={`Punto ${idx + 1}`}
                          value={bullet}
                          onChange={(val) => updateBullet("services.items.concept-art.bullets", idx, val)}
                          cleanPreview={cleanPreview}
                          className="font-sans text-xs text-brand-cream"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  onClick={() => triggerImageUpload("services_conceptArt")}
                  className="group/img relative aspect-[4/3] rounded-2xl overflow-hidden bg-brand-dark border-2 border-transparent hover:border-brand-blush cursor-pointer shadow-xl"
                  title="Haz clic para cambiar la imagen de Concept Art"
                >
                  <img
                    src={getOptimizedImageUrl(servicesImages.conceptArt, 800)}
                    alt="Concept Art"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                  />
                  {!cleanPreview && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-brand-blush text-brand-ink flex items-center justify-center">
                        <Camera className="w-5 h-5" />
                      </div>
                      <span className="text-xs uppercase font-sans text-brand-cream font-semibold tracking-wider">
                        Cambiar Imagen
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* ── 8. FOOTER EXACTO EDITABLE INLINE ── */}
          <footer className="bg-brand-dark border-t border-brand-cream/10 pt-20 pb-12 px-6 md:px-10 overflow-hidden select-none">
            <div className="max-w-[1100px] mx-auto">
              {/* Top Section: Large CTA */}
              <div className="mb-20">
                <EditableField
                  label="Eyebrow Footer CTA"
                  value={lang === "es" ? "¿Tienes un proyecto?" : "Have a project?"}
                  onChange={(val) => updateDraft("footer.ctaTagline", val)}
                  cleanPreview={cleanPreview}
                  className="font-sans text-brand-orange text-[10px] tracking-[0.3em] uppercase mb-4 block"
                />
                <h2 className="font-serif text-brand-cream text-[2.6rem] md:text-[4.8rem] font-light leading-[1.05] tracking-tight flex flex-wrap items-center gap-x-6">
                  <EditableField
                    label="Título Footer 1"
                    value={lang === "es" ? "¿Necesitas visualizar tu proyecto" : "Need to visualize your project"}
                    onChange={(val) => updateDraft("footer.ctaTitle1", val)}
                    cleanPreview={cleanPreview}
                    className="inline"
                  />
                  <span className="italic text-brand-blush font-light flex items-center gap-3">
                    <EditableField
                      label="Título Footer 2 (Cursiva)"
                      value={lang === "es" ? "antes de construirlo?" : "before building it?"}
                      onChange={(val) => updateDraft("footer.ctaTitle2", val)}
                      cleanPreview={cleanPreview}
                      className="inline"
                    />
                    <ArrowUpRight className="w-8 h-8 md:w-14 md:h-14 stroke-[1]" />
                  </span>
                </h2>
              </div>

              {/* Middle Grid: 3 Columnas Exactas */}
              <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-12 mb-16 pt-10 border-t border-brand-cream/5">
                {/* Col 1: Bio / Brand */}
                <div className="flex flex-col justify-between gap-6">
                  <div>
                    <p className="font-serif text-brand-cream text-2xl font-light tracking-wide mb-4">Miluarte</p>
                    <EditableField
                      label="Texto del Estudio / Bio Footer"
                      value={t("footer.studio") || "Estudio creativo & portafolio artístico de Nerea Lucas Pajares. Ilustración, diseño gráfico, modelado en arcilla y concept art en Madrid y Barcelona."}
                      onChange={(val) => updateDraft("footer.studio", val)}
                      cleanPreview={cleanPreview}
                      multiline
                      className="font-sans text-brand-cream/65 text-xs leading-relaxed max-w-[280px]"
                    />
                  </div>

                  {/* Social Links */}
                  <div className="flex flex-wrap gap-5 text-xs font-sans text-brand-cream/60">
                    <span className="hover:text-brand-orange transition-colors">Instagram</span>
                    <span className="hover:text-brand-orange transition-colors">LinkedIn</span>
                    <span className="hover:text-brand-orange transition-colors">Behance</span>
                    <span className="hover:text-brand-orange transition-colors">TikTok</span>
                  </div>
                </div>

                {/* Col 2: Navigation Links */}
                <div>
                  <p className="font-sans text-brand-orange text-[9px] tracking-widest uppercase mb-6">
                    {t("footer.work") || "Colecciones"}
                  </p>
                  <div className="flex flex-col gap-3.5 items-start text-xs font-sans text-brand-cream/65">
                    <span>Diseño Gráfico</span>
                    <span>3D & Stands</span>
                    <span>Diggin'</span>
                    <span>Ilustraciones</span>
                    <span>Concept Art</span>
                    <span className="text-brand-blush font-semibold pt-1.5">
                      {lang === "es" ? "Ver todas las colecciones →" : "View all collections →"}
                    </span>
                  </div>
                </div>

                {/* Col 3: Contact details / CTA */}
                <div className="flex flex-col justify-between items-start gap-8">
                  <div>
                    <p className="font-sans text-brand-orange text-[9px] tracking-widest uppercase mb-6">
                      {t("footer.contact") || "Contacto"}
                    </p>
                    <div className="flex flex-col gap-2 font-sans text-xs text-brand-cream/65">
                      <span>hola@miluartedenara.com</span>
                      <span className="text-brand-cream/60">Miluartedenara@gmail.com</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3.5 items-start">
                    <span className="font-sans text-brand-blush text-xs font-medium">
                      {lang === "es" ? "Ver Currículum (CV) →" : "View Resume / CV →"}
                    </span>
                    <div className="font-sans bg-brand-blush text-brand-ink text-[10px] tracking-widest uppercase py-3.5 px-6 rounded-lg font-semibold shadow-lg">
                      {t("footer.budget") || "Pide Presupuesto"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Strip */}
              <div className="border-t border-brand-cream/5 pt-8 flex flex-col md:flex-row justify-between gap-4 font-sans text-brand-cream/50 text-[10.5px]">
                <p>{t("footer.rights") || `© ${new Date().getFullYear()} Miluarte · Nerea Lucas Pajares. Todos los derechos reservados.`}</p>
                <p className="flex items-center gap-1.5">
                  <span>{t("footer.madeWithCriteria") || "Hecho con criterio y dedicación · España"}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Modal Biblioteca de Medios */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => {
          setIsMediaModalOpen(false);
          setActiveImageTarget(null);
        }}
        onSelect={handleMediaSelect}
        uploadFolder="miluarte/inicio"
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

// ─── Componente Inline Editable Puro ──────────────────────────────────────────

interface EditableFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  multiline?: boolean;
  className?: string;
  cleanPreview?: boolean;
}

function EditableField({ label, value, onChange, multiline = false, className = "", cleanPreview = false }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState(value);

  useEffect(() => {
    setTempVal(value);
  }, [value]);

  const handleFinish = () => {
    setIsEditing(false);
    if (tempVal !== value) {
      onChange(tempVal);
    }
  };

  if (isEditing && !cleanPreview) {
    return (
      <div className="relative z-30 p-3 rounded-2xl bg-brand-dark/98 border-2 border-brand-blush shadow-2xl my-2 max-w-full">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-brand-cream/10 text-[11px] font-sans text-brand-blush">
          <span className="font-semibold">{label}</span>
          <button
            type="button"
            onClick={handleFinish}
            className="p-1 rounded-lg bg-brand-blush text-brand-ink hover:bg-brand-cream font-bold cursor-pointer transition-colors"
            title="Guardar cambio en el borrador"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
        {multiline ? (
          <textarea
            autoFocus
            rows={4}
            value={tempVal}
            onChange={(e) => setTempVal(e.target.value)}
            onBlur={handleFinish}
            className="w-full bg-brand-bg text-brand-cream text-xs md:text-sm p-3 rounded-xl border border-brand-cream/15 outline-none focus:border-brand-blush resize-y font-sans leading-relaxed"
          />
        ) : (
          <input
            autoFocus
            type="text"
            value={tempVal}
            onChange={(e) => setTempVal(e.target.value)}
            onBlur={handleFinish}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleFinish();
            }}
            className="w-full bg-brand-bg text-brand-cream text-xs md:text-sm p-3 rounded-xl border border-brand-cream/15 outline-none focus:border-brand-blush font-sans"
          />
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        if (!cleanPreview) setIsEditing(true);
      }}
      className={`group/editable relative rounded-lg transition-all inline-block max-w-full ${
        cleanPreview
          ? ""
          : "cursor-pointer hover:outline-2 hover:outline-dashed hover:outline-brand-blush/80 hover:bg-brand-blush/10 p-1"
      }`}
      title={cleanPreview ? undefined : `Haz clic para editar: ${label}`}
    >
      <div className={className}>{value || <span className="opacity-30 italic">[{label}]</span>}</div>
      {!cleanPreview && (
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 opacity-0 group-hover/editable:opacity-100 transition-opacity bg-brand-blush text-brand-ink p-1.5 rounded-full shadow-lg pointer-events-none z-20">
          <Edit3 className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}
