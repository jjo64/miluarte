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
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { Toast } from "../../components/admin/Toast";
import { useAdminApi } from "../../hooks/useAdminApi";
import { useUpload } from "../../hooks/useUpload";
import { translations as defaultTranslations } from "../../locales/translations";
import { getOptimizedImageUrl } from "../../utils/cloudinary";
import { ClientsMarquee } from "../../components/ClientsMarquee";
import { HorizontalGallery } from "../../components/HorizontalGallery";
import { SketchSlider } from "../../components/SketchSlider";
import { ServiceSections } from "../../components/ServiceSections";
import { SharedFooter } from "../../components/SharedFooter";

type Lang = "es" | "en";
type DeviceView = "desktop" | "tablet" | "mobile";

const DEFAULT_ANIMAS_SKETCH = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781822593/Captura_de_pantalla_2026-06-19_004226_kbbzwm.png";
const DEFAULT_ANIMAS_FINAL  = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781822579/Captura_de_pantalla_2026-06-19_004056_lpcimv.png";
const DEFAULT_FEATURED_IMG  = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811479/Doke_Red_Flag_u1njsw.jpg";
const DEFAULT_HERO_IMG      = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/520988252_18317337157235254_3623552272738405742_n_xafgzp.jpg";

const DEFAULT_GALLERY_IMAGES = [
  { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/532613326_18320483857235254_170206825296032194_n_mcewf6.jpg", category: "ilustracion", altKey: "obra1" },
  { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/533637781_18320483821235254_4718922861619683556_n_ddrhz1.jpg", category: "concept", altKey: "obra2" },
  { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781798241/719099666_18085459703434740_3604615127722183027_n_apifn2.jpg", category: "ilustracion", altKey: "obra3" },
  { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/624072385_18076991993069555_3759238577248943847_n_zjw6f8.jpg", category: "musica", altKey: "obra4" },
  { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781798273/Captura_de_pantalla_2026-06-18_175704_agpitt.png", category: "concept", altKey: "obra5" },
  { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781798241/656747786_18083218367600656_3599812440241416906_n_f8npa1.jpg", category: "joyeria", altKey: "obra6" },
  { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/520988252_18317337157235254_3623552272738405742_n_xafgzp.jpg", category: "concept", altKey: "obra7" },
  { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781812066/favicon_xih1kk.jpg", category: "ilustracion", altKey: "obra8" },
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
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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
      if (res && (res.es || res.en)) {
        const merged = {
          es: deepMerge(defaultTranslations.es, res.es || {}),
          en: deepMerge(defaultTranslations.en, res.en || {}),
        };
        setServerTexts(merged);
        setDraftTexts(merged);

        if (res.heroImage) setHeroImage(res.heroImage);
        if (res.featuredImage) setFeaturedImage(res.featuredImage);
        if (res.sketchImg) setSketchImg(res.sketchImg);
        if (res.finalImg) setFinalImg(res.finalImg);
        if (Array.isArray(res.galleryImages) && res.galleryImages.length > 0) {
          setGalleryImages(res.galleryImages);
        }
      }
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
    setHasChanges(true);
  };

  const getDraftValue = (path: string): string => {
    const parts = path.split(".");
    let current: any = draftTexts[lang];
    for (const p of parts) {
      if (current && typeof current === "object" && p in current) {
        current = current[p];
      } else {
        return "";
      }
    }
    return typeof current === "string" ? current : "";
  };

  const t = (path: string) => getDraftValue(path);

  // Disparar selector de archivo para una imagen específica
  const triggerImageUpload = (target: string) => {
    setActiveImageTarget(target);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Subir imagen a Cloudinary y asignarla al target correspondiente
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeImageTarget) return;

    try {
      setUploadingTarget(activeImageTarget);
      const folder = activeImageTarget.startsWith("gallery_") ? "miluarte/gallery" : "miluarte/home";
      const res = await uploadImage(file, folder);

      if (activeImageTarget === "hero") {
        setHeroImage(res.secureUrl);
        updateDraft("hero.image", res.secureUrl);
      } else if (activeImageTarget === "featured") {
        setFeaturedImage(res.secureUrl);
        updateDraft("featured.image", res.secureUrl);
      } else if (activeImageTarget === "sketch") {
        setSketchImg(res.secureUrl);
        updateDraft("process.sketchImg", res.secureUrl);
      } else if (activeImageTarget === "final") {
        setFinalImg(res.secureUrl);
        updateDraft("process.finalImg", res.secureUrl);
      } else if (activeImageTarget.startsWith("gallery_")) {
        const idx = parseInt(activeImageTarget.replace("gallery_", ""), 10);
        setGalleryImages((prev) => {
          const next = [...prev];
          if (next[idx]) {
            next[idx] = { ...next[idx], src: res.secureUrl };
          }
          return next;
        });
      }

      setHasChanges(true);
      setToast({
        message: "¡Imagen subida y actualizada con éxito en la vista previa!",
        type: "success",
        open: true,
      });
    } catch (err: any) {
      setToast({
        message: err.message || "Error al subir la imagen a Cloudinary",
        type: "error",
        open: true,
      });
    } finally {
      setUploadingTarget(null);
      setActiveImageTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
        }),
      });

      setServerTexts(JSON.parse(JSON.stringify(draftTexts)));
      setHasChanges(false);
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
    setDraftTexts(JSON.parse(JSON.stringify(serverTexts)));
    setHasChanges(false);
    setToast({
      message: "Cambios descartados. Se restauró la última versión guardada.",
      type: "success",
      open: true,
    });
  };

  const headerActions = (
    <div className="flex items-center gap-3">
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
        className="px-3 py-2 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5 transition-all hidden md:flex items-center gap-1.5 no-underline"
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
      {/* Input de archivo oculto para selector nativo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
      />

      <div className="w-full flex flex-col items-center select-none">
        {/* Barra superior de guía interactiva */}
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

        {/* Viewport a Pantalla Completa o Responsivo */}
        <div
          className={`w-full transition-all duration-300 border-x border-b border-brand-cream/10 rounded-b-2xl overflow-hidden shadow-2xl bg-brand-bg text-brand-cream ${
            device === "mobile"
              ? "max-w-[400px]"
              : device === "tablet"
              ? "max-w-[768px]"
              : "w-full"
          }`}
        >
          {/* ── 1. Hero Exacto ── */}
          <section className="relative min-h-[640px] bg-brand-bg flex items-center overflow-hidden pt-16 pb-16 md:py-20 border-b border-brand-cream/10">
            <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-12 px-6 md:px-12 max-w-[1200px] mx-auto items-center">
              {/* Left: Bio */}
              <div className="flex flex-col justify-center order-1">
                <EditableField
                  label="Tagline del Hero"
                  value={t("hero.tagline")}
                  onChange={(val) => updateDraft("hero.tagline", val)}
                  className="font-sans text-brand-blush text-[10px] tracking-[0.34em] uppercase mb-4 font-semibold"
                />

                <div className="mb-4">
                  <EditableField
                    label="Saludo inicial"
                    value={t("hero.greetingBefore")}
                    onChange={(val) => updateDraft("hero.greetingBefore", val)}
                    className="font-serif text-brand-cream text-[2.6rem] md:text-[4.5rem] leading-[0.98] font-light tracking-tight whitespace-pre-line inline"
                  />
                  <EditableField
                    label="Nombre en cursiva"
                    value={t("hero.greetingItalic")}
                    onChange={(val) => updateDraft("hero.greetingItalic", val)}
                    className="font-serif italic text-brand-blush text-[2.6rem] md:text-[4.5rem] leading-[0.98] font-light tracking-tight inline ml-2"
                  />
                </div>

                <EditableField
                  label="Frase artística / Manifiesto"
                  value={t("hero.artline")}
                  onChange={(val) => updateDraft("hero.artline", val)}
                  multiline
                  className="font-serif italic text-brand-wall text-[1.15rem] md:text-[1.45rem] font-light leading-relaxed mb-6 max-w-[500px]"
                />

                <div className="w-12 h-0.5 bg-brand-blush mb-6" />

                <EditableField
                  label="Biografía principal (Párrafo 1)"
                  value={t("hero.bio1")}
                  onChange={(val) => updateDraft("hero.bio1", val)}
                  multiline
                  className="font-sans text-brand-cream/80 text-[13.5px] leading-relaxed mb-3 max-w-[500px]"
                />

                <EditableField
                  label="Biografía secundaria (Párrafo 2)"
                  value={t("hero.bio2")}
                  onChange={(val) => updateDraft("hero.bio2", val)}
                  multiline
                  className="font-sans text-brand-cream/70 text-[13.5px] leading-relaxed mb-8 max-w-[500px]"
                />

                <div className="flex gap-3.5 items-center flex-wrap">
                  <EditableField
                    label="Texto Botón 1"
                    value={t("hero.viewWorks")}
                    onChange={(val) => updateDraft("hero.viewWorks", val)}
                    className="font-sans bg-brand-blush text-brand-ink text-[10px] tracking-widest uppercase py-3.5 px-7 font-semibold"
                  />
                  <EditableField
                    label="Texto Botón 2"
                    value={t("hero.sendInquiry")}
                    onChange={(val) => updateDraft("hero.sendInquiry", val)}
                    className="font-sans text-brand-blush text-[10px] tracking-widest uppercase border border-brand-blush/45 py-3.5 px-6 bg-transparent"
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
                      src={getOptimizedImageUrl("https://res.cloudinary.com/doznr2qm4/image/upload/v1781812066/favicon_xih1kk.jpg", 80)}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="font-sans text-[#F5EDE0] text-[9px] tracking-widest uppercase">
                      Miluarte
                    </span>
                  </div>

                  {/* Overlay interactivo de cambio de foto */}
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

                {/* Overlay de edición al hover */}
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
              </div>

              <EditableField
                label="Título Proyecto Destacado"
                value={t("featured.title")}
                onChange={(val) => updateDraft("featured.title", val)}
                className="font-serif text-brand-cream text-3xl md:text-4xl font-light leading-tight"
              />

              <EditableField
                label="Descripción Proyecto Destacado"
                value={t("featured.description")}
                onChange={(val) => updateDraft("featured.description", val)}
                multiline
                className="font-sans text-brand-cream/70 text-xs md:text-sm leading-relaxed my-2"
              />

              <div className="pt-4">
                <EditableField
                  label="Texto Botón Ver Caso"
                  value={t("featured.viewCase")}
                  onChange={(val) => updateDraft("featured.viewCase", val)}
                  className="font-sans text-brand-cream text-[10px] tracking-widest uppercase border border-brand-cream/30 py-3.5 px-7 rounded-lg inline-block font-medium"
                />
              </div>
            </div>
          </section>

          {/* ── 3. Carrusel de Clientes en Vivo ── */}
          <div className="border-y border-brand-cream/10 bg-brand-bg/50">
            <ClientsMarquee />
          </div>

          {/* ── 4. Galería Horizontal de Obras Destacadas Interactiva ── */}
          <div className="py-10 bg-brand-bg">
            <HorizontalGallery
              images={galleryImages}
              editable={true}
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
                className="font-sans text-brand-blush text-[10px] tracking-widest uppercase mb-1.5 font-medium"
              />
              <EditableField
                label="Subtítulo Proceso Creativo"
                value={t("process.subtitle")}
                onChange={(val) => updateDraft("process.subtitle", val)}
                className="font-serif text-brand-cream text-2xl md:text-3xl font-light mb-2.5"
              />
              <EditableField
                label="Texto Guía / Hint"
                value={t("process.hint")}
                onChange={(val) => updateDraft("process.hint", val)}
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
              editable={true}
              onSketchClick={() => triggerImageUpload("sketch")}
              onFinalClick={() => triggerImageUpload("final")}
            />
          </div>

          {/* ── 6. Especialidades y Servicios (SeoServices) ── */}
          <section className="py-20 px-6 md:px-12 max-w-4xl mx-auto">
            <EditableField
              label="Eyebrow Servicios"
              value={t("seoServices.eyebrow")}
              onChange={(val) => updateDraft("seoServices.eyebrow", val)}
              className="font-sans text-brand-blush text-[10px] tracking-[0.15em] uppercase mb-2 font-medium"
            />
            <EditableField
              label="Título de Servicios"
              value={t("seoServices.title")}
              onChange={(val) => updateDraft("seoServices.title", val)}
              className="font-serif text-brand-cream text-3xl md:text-5xl font-light mb-4"
            />
            <EditableField
              label="Descripción de Servicios"
              value={t("seoServices.description")}
              onChange={(val) => updateDraft("seoServices.description", val)}
              multiline
              className="font-sans text-brand-cream/70 text-xs md:text-sm leading-relaxed mb-10 max-w-2xl"
            />
          </section>

          {/* ── 7. Secciones Completas de Servicios en Acordeón ── */}
          <div className="border-t border-brand-cream/10">
            <ServiceSections />
          </div>

          {/* ── 8. Footer Completo ── */}
          <SharedFooter />
        </div>
      </div>

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
}

function EditableField({ label, value, onChange, multiline = false, className = "" }: EditableFieldProps) {
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

  if (isEditing) {
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
      onClick={() => setIsEditing(true)}
      className="group/editable relative cursor-pointer rounded-lg hover:outline-2 hover:outline-dashed hover:outline-brand-blush/80 hover:bg-brand-blush/10 transition-all p-1 inline-block max-w-full"
      title={`Haz clic para editar: ${label}`}
    >
      <div className={className}>{value || <span className="opacity-30 italic">[{label}]</span>}</div>
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 opacity-0 group-hover/editable:opacity-100 transition-opacity bg-brand-blush text-brand-ink p-1.5 rounded-full shadow-lg pointer-events-none z-20">
        <Edit3 className="w-3 h-3" />
      </div>
    </div>
  );
}
