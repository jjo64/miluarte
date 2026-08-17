import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Save,
  RotateCcw,
  Languages,
  Monitor,
  Tablet,
  Smartphone,
  Edit3,
  Check,
  ExternalLink,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Sliders,
  Eye,
  Type,
  Layers,
  ArrowRight,
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { ImageUploader } from "../../components/admin/ImageUploader";
import { Toast } from "../../components/admin/Toast";
import { useAdminApi } from "../../hooks/useAdminApi";
import { translations as defaultTranslations } from "../../locales/translations";
import { getOptimizedImageUrl } from "../../utils/cloudinary";
import { C, SERIF, SANS } from "../../tokens";

type Lang = "es" | "en";
type DeviceView = "desktop" | "tablet" | "mobile";

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

  const [lang, setLang] = useState<Lang>("es");
  const [device, setDevice] = useState<DeviceView>("desktop");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Textos originales guardados en servidor
  const [serverTexts, setServerTexts] = useState({
    es: defaultTranslations.es,
    en: defaultTranslations.en,
  });

  // Textos en borrador en vivo
  const [draftTexts, setDraftTexts] = useState({
    es: defaultTranslations.es,
    en: defaultTranslations.en,
  });

  // Imagen del hero (se guarda en texts o imagen directa)
  const [heroImage, setHeroImage] = useState<string>(
    "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/520988252_18317337157235254_3623552272738405742_n_xafgzp.jpg"
  );

  // Sección activa en el panel lateral de edición rápida
  const [activeSection, setActiveSection] = useState<string>("hero");

  // Elemento enfocado para edición rápida
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
      }
    } catch (err: any) {
      console.warn("Usando textos por defecto:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper para actualizar campo en el borrador
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

  // Helper para leer campo del borrador
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

  // Guardar cambios en el backend
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await request("/api/admin/texts", {
        method: "PUT",
        body: JSON.stringify({
          ...draftTexts,
          heroImage,
        }),
      });

      setServerTexts(JSON.parse(JSON.stringify(draftTexts)));
      setHasChanges(false);
      setToast({
        message: "¡Página de inicio actualizada y publicada con éxito!",
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

  // Descartar borrador
  const handleDiscard = () => {
    setDraftTexts(JSON.parse(JSON.stringify(serverTexts)));
    setHasChanges(false);
    setToast({
      message: "Cambios descartados. Se restauró la última versión guardada.",
      type: "success",
      open: true,
    });
  };

  const t = (path: string) => getDraftValue(path);

  const headerActions = (
    <div className="flex items-center gap-3">
      {/* Selector de idioma */}
      <div className="flex items-center p-1 rounded-xl bg-brand-bg border border-brand-cream/15">
        <button
          type="button"
          onClick={() => setLang("es")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            lang === "es"
              ? "bg-brand-blush text-brand-ink shadow-xs"
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
              ? "bg-brand-blush text-brand-ink shadow-xs"
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
      title="Editor Visual del Inicio"
      subtitle={`Previsualiza y edita en tiempo real en ${lang === "es" ? "Español 🇪🇸" : "Inglés 🇬🇧"}`}
      actions={headerActions}
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8 select-none">
        {/* ── COLUMNA IZQUIERDA: Live Preview Viewport ── */}
        <div className="flex flex-col items-center">
          {/* Header del Viewport */}
          <div className="w-full flex items-center justify-between px-4 py-2 bg-brand-dark/90 border border-brand-cream/10 rounded-t-2xl text-[11px] font-sans text-brand-cream/50">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 animate-pulse" />
              <span>Modo Editor Interactivo · Haz clic en cualquier texto o foto para editar</span>
            </div>
            <span className="font-mono text-[10px] text-brand-blush">
              Idioma actual: {lang.toUpperCase()}
            </span>
          </div>

          {/* Marco simulador de pantalla */}
          <div
            className={`w-full transition-all duration-300 border-x border-b border-brand-cream/10 rounded-b-2xl overflow-hidden shadow-2xl bg-brand-bg ${
              device === "mobile"
                ? "max-w-[390px]"
                : device === "tablet"
                ? "max-w-[768px]"
                : "max-w-full"
            }`}
          >
            {/* ── 1. Hero Preview ── */}
            <div className="relative p-6 md:p-12 border-b border-brand-cream/10 group/hero">
              <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8 items-center">
                {/* Lado izquierdo textos */}
                <div className="flex flex-col gap-3">
                  {/* Tagline */}
                  <EditableField
                    label="Tagline superior"
                    value={t("hero.tagline")}
                    onChange={(val) => updateDraft("hero.tagline", val)}
                    className="font-sans text-brand-blush text-[10px] tracking-[0.3em] uppercase font-medium"
                  />

                  {/* Saludo y Nombre */}
                  <div className="flex flex-wrap items-baseline gap-2">
                    <EditableField
                      label="Texto saludo"
                      value={t("hero.greetingBefore")}
                      onChange={(val) => updateDraft("hero.greetingBefore", val)}
                      className="font-serif text-brand-cream text-3xl md:text-5xl font-light tracking-tight whitespace-pre-line"
                    />
                    <EditableField
                      label="Nombre en cursiva"
                      value={t("hero.greetingItalic")}
                      onChange={(val) => updateDraft("hero.greetingItalic", val)}
                      className="font-serif italic text-brand-blush text-3xl md:text-5xl font-light"
                    />
                  </div>

                  {/* Frase artística */}
                  <EditableField
                    label="Frase artística / Manifiesto"
                    value={t("hero.artline")}
                    onChange={(val) => updateDraft("hero.artline", val)}
                    multiline
                    className="font-serif italic text-brand-wall text-base md:text-lg font-light leading-relaxed my-2"
                  />

                  <div className="w-10 h-0.5 bg-brand-blush my-2" />

                  {/* Bio 1 */}
                  <EditableField
                    label="Biografía 1 (Párrafo principal)"
                    value={t("hero.bio1")}
                    onChange={(val) => updateDraft("hero.bio1", val)}
                    multiline
                    className="font-sans text-brand-cream/80 text-xs md:text-sm leading-relaxed"
                  />

                  {/* Bio 2 */}
                  <EditableField
                    label="Biografía 2 (Llamada al encargo)"
                    value={t("hero.bio2")}
                    onChange={(val) => updateDraft("hero.bio2", val)}
                    multiline
                    className="font-sans text-brand-cream/70 text-xs md:text-sm leading-relaxed mt-1"
                  />

                  {/* Botones de acción */}
                  <div className="flex items-center gap-3 mt-4">
                    <EditableField
                      label="Texto Botón 1"
                      value={t("hero.viewWorks")}
                      onChange={(val) => updateDraft("hero.viewWorks", val)}
                      className="font-sans bg-brand-blush text-brand-ink text-[10px] tracking-widest uppercase py-2.5 px-5 font-semibold rounded"
                    />
                    <EditableField
                      label="Texto Botón 2"
                      value={t("hero.sendInquiry")}
                      onChange={(val) => updateDraft("hero.sendInquiry", val)}
                      className="font-sans text-brand-blush text-[10px] tracking-widest uppercase border border-brand-blush/40 py-2.5 px-5 rounded"
                    />
                  </div>
                </div>

                {/* Lado derecho foto */}
                <div className="flex flex-col items-center">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-brand-cream/10 group/img aspect-[4/5] w-full max-w-[280px] bg-brand-dark">
                    <img
                      src={getOptimizedImageUrl(heroImage, 600)}
                      alt="Hero portrait"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 gap-2 text-center">
                      <ImageIcon className="w-6 h-6 text-brand-blush" />
                      <span className="font-sans text-xs text-brand-cream font-medium">
                        Cambiar foto del Hero en el panel lateral
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. Proyecto Destacado (Diggin) ── */}
            <div className="p-6 md:p-12 border-b border-brand-cream/10 bg-brand-dark/40">
              <div className="max-w-2xl mx-auto flex flex-col gap-3">
                <EditableField
                  label="Etiqueta proyecto"
                  value={t("featured.eyebrow")}
                  onChange={(val) => updateDraft("featured.eyebrow", val)}
                  className="font-sans text-brand-blush text-[10px] tracking-widest uppercase"
                />
                <EditableField
                  label="Título proyecto destacado"
                  value={t("featured.title")}
                  onChange={(val) => updateDraft("featured.title", val)}
                  className="font-serif text-brand-cream text-2xl md:text-3xl font-light"
                />
                <EditableField
                  label="Descripción del caso de estudio"
                  value={t("featured.description")}
                  onChange={(val) => updateDraft("featured.description", val)}
                  multiline
                  className="font-sans text-brand-cream/70 text-xs md:text-sm leading-relaxed"
                />
                <div className="pt-2">
                  <EditableField
                    label="Texto botón ver caso"
                    value={t("featured.viewCase")}
                    onChange={(val) => updateDraft("featured.viewCase", val)}
                    className="font-sans text-brand-cream text-[10px] tracking-widest uppercase border border-brand-cream/30 py-2.5 px-6 rounded-lg inline-block"
                  />
                </div>
              </div>
            </div>

            {/* ── 3. Proceso Creativo (Sketch Slider) ── */}
            <div className="p-6 md:p-12 border-b border-brand-cream/10">
              <div className="max-w-2xl mx-auto flex flex-col gap-2 text-center">
                <EditableField
                  label="Título Proceso Creativo"
                  value={t("process.title")}
                  onChange={(val) => updateDraft("process.title", val)}
                  className="font-sans text-brand-blush text-[10px] tracking-widest uppercase font-medium"
                />
                <EditableField
                  label="Subtítulo Proceso Creativo"
                  value={t("process.subtitle")}
                  onChange={(val) => updateDraft("process.subtitle", val)}
                  className="font-serif text-brand-cream text-2xl md:text-3xl font-light"
                />
                <EditableField
                  label="Instrucción / Hint de deslizador"
                  value={t("process.hint")}
                  onChange={(val) => updateDraft("process.hint", val)}
                  multiline
                  className="font-sans text-brand-cream/60 text-xs mt-1"
                />
              </div>
            </div>

            {/* ── 4. Especialidades y Servicios ── */}
            <div className="p-6 md:p-12 bg-brand-dark/20">
              <div className="max-w-3xl mx-auto flex flex-col gap-3">
                <EditableField
                  label="Eyebrow Servicios"
                  value={t("seoServices.eyebrow")}
                  onChange={(val) => updateDraft("seoServices.eyebrow", val)}
                  className="font-sans text-brand-blush text-[10px] tracking-widest uppercase"
                />
                <EditableField
                  label="Título Servicios"
                  value={t("seoServices.title")}
                  onChange={(val) => updateDraft("seoServices.title", val)}
                  className="font-serif text-brand-cream text-2xl md:text-3xl font-light"
                />
                <EditableField
                  label="Descripción Servicios"
                  value={t("seoServices.description")}
                  onChange={(val) => updateDraft("seoServices.description", val)}
                  multiline
                  className="font-sans text-brand-cream/70 text-xs md:text-sm leading-relaxed mb-4"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── COLUMNA DERECHA: Panel de Control y Edición Rápida ── */}
        <div className="flex flex-col gap-6">
          {/* Tarjeta de estado */}
          <div className="p-5 rounded-2xl bg-brand-dark border border-brand-cream/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs uppercase tracking-wider text-brand-cream/60 font-semibold">
                Estado del Borrador
              </span>
              {hasChanges ? (
                <span className="px-2 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange text-[10px] font-mono border border-brand-orange/30">
                  Modificado
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 text-[10px] font-mono border border-emerald-400/20">
                  Sincronizado
                </span>
              )}
            </div>
            <p className="font-sans text-xs text-brand-cream/70 leading-relaxed">
              Puedes hacer clic directamente en cualquier texto del preview a la izquierda para editarlo o usar las pestañas de abajo.
            </p>
          </div>

          {/* Selector de Foto del Hero */}
          <div className="p-5 rounded-2xl bg-brand-dark border border-brand-cream/10 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand-blush" />
              <span className="font-sans text-xs uppercase tracking-wider text-brand-cream font-semibold">
                Foto Principal del Hero
              </span>
            </div>
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-brand-bg border border-brand-cream/10 relative group">
              <img
                src={getOptimizedImageUrl(heroImage, 400)}
                alt="Foto hero actual"
                className="w-full h-full object-cover"
              />
            </div>
            <ImageUploader
              folder="miluarte/hero"
              onUploadSuccess={(res) => {
                setHeroImage(res.secureUrl);
                setHasChanges(true);
                setToast({ message: "Foto del Hero actualizada en el borrador", type: "success", open: true });
              }}
            />
          </div>

          {/* Acordeones de Secciones */}
          <div className="flex flex-col gap-2">
            <SectionAccordion
              title="1. Sección Hero (Portada)"
              icon={Sparkles}
              isOpen={activeSection === "hero"}
              onToggle={() => setActiveSection(activeSection === "hero" ? "" : "hero")}
            >
              <div className="flex flex-col gap-3 p-3 text-xs">
                <div>
                  <label className="text-[10px] text-brand-cream/50 uppercase">Tagline</label>
                  <input
                    type="text"
                    value={t("hero.tagline")}
                    onChange={(e) => updateDraft("hero.tagline", e.target.value)}
                    className="w-full mt-1 bg-brand-bg border border-brand-cream/15 rounded-lg px-3 py-2 text-brand-cream text-xs outline-none focus:border-brand-blush"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-brand-cream/50 uppercase">Frase artística</label>
                  <textarea
                    rows={2}
                    value={t("hero.artline")}
                    onChange={(e) => updateDraft("hero.artline", e.target.value)}
                    className="w-full mt-1 bg-brand-bg border border-brand-cream/15 rounded-lg px-3 py-2 text-brand-cream text-xs outline-none focus:border-brand-blush resize-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-brand-cream/50 uppercase">Biografía 1</label>
                  <textarea
                    rows={4}
                    value={t("hero.bio1")}
                    onChange={(e) => updateDraft("hero.bio1", e.target.value)}
                    className="w-full mt-1 bg-brand-bg border border-brand-cream/15 rounded-lg px-3 py-2 text-brand-cream text-xs outline-none focus:border-brand-blush resize-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-brand-cream/50 uppercase">Biografía 2</label>
                  <textarea
                    rows={2}
                    value={t("hero.bio2")}
                    onChange={(e) => updateDraft("hero.bio2", e.target.value)}
                    className="w-full mt-1 bg-brand-bg border border-brand-cream/15 rounded-lg px-3 py-2 text-brand-cream text-xs outline-none focus:border-brand-blush resize-none"
                  />
                </div>
              </div>
            </SectionAccordion>

            <SectionAccordion
              title="2. Proyecto Destacado"
              icon={Layers}
              isOpen={activeSection === "featured"}
              onToggle={() => setActiveSection(activeSection === "featured" ? "" : "featured")}
            >
              <div className="flex flex-col gap-3 p-3 text-xs">
                <div>
                  <label className="text-[10px] text-brand-cream/50 uppercase">Título</label>
                  <input
                    type="text"
                    value={t("featured.title")}
                    onChange={(e) => updateDraft("featured.title", e.target.value)}
                    className="w-full mt-1 bg-brand-bg border border-brand-cream/15 rounded-lg px-3 py-2 text-brand-cream text-xs outline-none focus:border-brand-blush"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-brand-cream/50 uppercase">Descripción</label>
                  <textarea
                    rows={3}
                    value={t("featured.description")}
                    onChange={(e) => updateDraft("featured.description", e.target.value)}
                    className="w-full mt-1 bg-brand-bg border border-brand-cream/15 rounded-lg px-3 py-2 text-brand-cream text-xs outline-none focus:border-brand-blush resize-none"
                  />
                </div>
              </div>
            </SectionAccordion>

            <SectionAccordion
              title="3. Proceso Creativo"
              icon={Sliders}
              isOpen={activeSection === "process"}
              onToggle={() => setActiveSection(activeSection === "process" ? "" : "process")}
            >
              <div className="flex flex-col gap-3 p-3 text-xs">
                <div>
                  <label className="text-[10px] text-brand-cream/50 uppercase">Subtítulo</label>
                  <input
                    type="text"
                    value={t("process.subtitle")}
                    onChange={(e) => updateDraft("process.subtitle", e.target.value)}
                    className="w-full mt-1 bg-brand-bg border border-brand-cream/15 rounded-lg px-3 py-2 text-brand-cream text-xs outline-none focus:border-brand-blush"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-brand-cream/50 uppercase">Texto guía (Hint)</label>
                  <textarea
                    rows={2}
                    value={t("process.hint")}
                    onChange={(e) => updateDraft("process.hint", e.target.value)}
                    className="w-full mt-1 bg-brand-bg border border-brand-cream/15 rounded-lg px-3 py-2 text-brand-cream text-xs outline-none focus:border-brand-blush resize-none"
                  />
                </div>
              </div>
            </SectionAccordion>
          </div>
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

// ─── Componente Inline Editable para el Live Preview ──────────────────────────

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
      <div className="relative z-30 p-2 rounded-xl bg-brand-dark/95 border-2 border-brand-blush shadow-2xl my-1">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-brand-cream/10 text-[10px] font-sans text-brand-blush">
          <span className="font-semibold">{label}</span>
          <button
            type="button"
            onClick={handleFinish}
            className="p-1 rounded bg-brand-blush text-brand-ink hover:bg-brand-cream font-bold cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
        {multiline ? (
          <textarea
            autoFocus
            rows={3}
            value={tempVal}
            onChange={(e) => setTempVal(e.target.value)}
            onBlur={handleFinish}
            className="w-full bg-brand-bg text-brand-cream text-xs p-2 rounded-lg border border-brand-cream/15 outline-none focus:border-brand-blush resize-none font-sans"
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
            className="w-full bg-brand-bg text-brand-cream text-xs p-2 rounded-lg border border-brand-cream/15 outline-none focus:border-brand-blush font-sans"
          />
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="group/editable relative cursor-pointer rounded-lg hover:outline-2 hover:outline-dashed hover:outline-brand-blush/80 hover:bg-brand-blush/5 transition-all p-1"
      title={`Clic para editar: ${label}`}
    >
      <div className={className}>{value || <span className="opacity-30 italic">[{label}]</span>}</div>
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 opacity-0 group-hover/editable:opacity-100 transition-opacity bg-brand-blush text-brand-ink p-1 rounded-full shadow-lg pointer-events-none z-20">
        <Edit3 className="w-3 h-3" />
      </div>
    </div>
  );
}

// ─── Componente Acordeón para Secciones ───────────────────────────────────────

interface SectionAccordionProps {
  title: string;
  icon: any;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function SectionAccordion({ title, icon: Icon, isOpen, onToggle, children }: SectionAccordionProps) {
  return (
    <div className="rounded-xl bg-brand-dark border border-brand-cream/10 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-brand-cream/5 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-brand-blush" />
          <span className="font-sans text-xs font-semibold text-brand-cream">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-brand-cream/50" />
        ) : (
          <ChevronDown className="w-4 h-4 text-brand-cream/50" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-brand-cream/5 bg-brand-bg/40"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
