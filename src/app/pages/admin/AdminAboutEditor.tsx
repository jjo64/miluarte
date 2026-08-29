import { useState, useEffect, useRef } from "react";
import {
  User,
  Sparkles,
  Save,
  Camera,
  ExternalLink,
  Eye,
  EyeOff,
  Monitor,
  Tablet,
  Smartphone,
  Quote,
  BookOpen,
  Palette,
  Send,
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { Toast } from "../../components/admin/Toast";
import { MediaLibraryModal } from "../../components/admin/MediaLibraryModal";
import { useAdminApi } from "../../hooks/useAdminApi";
import { useUpload } from "../../hooks/useUpload";
import { translations as defaultTranslations } from "../../locales/translations";
import { getOptimizedImageUrl } from "../../utils/cloudinary";

type Lang = "es" | "en";
type DeviceView = "desktop" | "tablet" | "mobile";

const DEFAULT_ABOUT_PHOTO = "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/curriculum/z0h8pkxct5vsgvmfscui.jpg";
const DEFAULT_MUSAE_IMG = "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/musae_dkbruz.jpg";

export function AdminAboutEditor() {
  const { request } = useAdminApi();
  const { uploadImage } = useUpload();

  const [lang, setLang] = useState<Lang>("es");
  const [device, setDevice] = useState<DeviceView>("desktop");
  const [cleanPreview, setCleanPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [serverSnapshot, setServerSnapshot] = useState<string | null>(null);

  // Modal Biblioteca de Medios
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"photo" | "musae">("photo");

  // Imágenes editables
  const [aboutPhoto, setAboutPhoto] = useState(DEFAULT_ABOUT_PHOTO);
  const [musaeImg, setMusaeImg] = useState(DEFAULT_MUSAE_IMG);

  // Textos bilingües de Sobre Mí
  const [aboutData, setAboutData] = useState<{
    es: typeof defaultTranslations.es.about;
    en: typeof defaultTranslations.en.about;
  }>({
    es: { ...defaultTranslations.es.about },
    en: { ...defaultTranslations.en.about },
  });

  const currentSnapshot = JSON.stringify({
    aboutPhoto,
    musaeImg,
    aboutData,
  });

  const hasChanges = serverSnapshot !== null && serverSnapshot !== currentSnapshot;

  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; open: boolean }>({
    message: "",
    type: "success",
    open: false,
  });

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      const res = await request<any>("/api/admin/texts");
      let curPhoto = DEFAULT_ABOUT_PHOTO;
      let curMusae = DEFAULT_MUSAE_IMG;
      let curAbout = {
        es: { ...defaultTranslations.es.about },
        en: { ...defaultTranslations.en.about },
      };

      if (res) {
        if (res.aboutPhoto) curPhoto = res.aboutPhoto;
        else if (res.resumePhoto) curPhoto = res.resumePhoto;

        if (res.aboutMusaeImg) curMusae = res.aboutMusaeImg;

        if (res.es?.about) {
          curAbout.es = { ...curAbout.es, ...res.es.about };
        }
        if (res.en?.about) {
          curAbout.en = { ...curAbout.en, ...res.en.about };
        }
      }

      setAboutPhoto(curPhoto);
      setMusaeImg(curMusae);
      setAboutData(curAbout);
      setServerSnapshot(JSON.stringify({ aboutPhoto: curPhoto, musaeImg: curMusae, aboutData: curAbout }));
    } catch (err: any) {
      console.warn("Usando datos base de Sobre Mí:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaSelect = (selectedUrl: string) => {
    if (mediaTarget === "photo") {
      setAboutPhoto(selectedUrl);
      setToast({ message: "Retrato de Nerea actualizado en el borrador", type: "success", open: true });
    } else {
      setMusaeImg(selectedUrl);
      setToast({ message: "Imagen Serie Musae actualizada en el borrador", type: "success", open: true });
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await request("/api/admin/texts", {
        method: "PUT",
        body: JSON.stringify({
          aboutPhoto,
          aboutMusaeImg: musaeImg,
          es: {
            about: aboutData.es,
          },
          en: {
            about: aboutData.en,
          },
        }),
      });

      setServerSnapshot(currentSnapshot);
      setToast({ message: "¡Página Sobre Mí guardada y publicada con éxito!", type: "success", open: true });
    } catch (err: any) {
      setToast({ message: err.message || "Error al guardar los cambios", type: "error", open: true });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof typeof defaultTranslations.es.about, val: any) => {
    setAboutData((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: val,
      },
    }));
  };

  const updateDiscipline = (discKey: "musae" | "concept" | "clay" | "music", field: "title" | "desc", val: string) => {
    setAboutData((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        disciplines: {
          ...prev[lang].disciplines,
          [discKey]: {
            ...prev[lang].disciplines[discKey],
            [field]: val,
          },
        },
      },
    }));
  };

  const updateStat = (statKey: "master" | "focus" | "specialty", val: string) => {
    setAboutData((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        stats: {
          ...prev[lang].stats,
          [statKey]: val,
        },
      },
    }));
  };

  const headerActions = (
    <div className="flex items-center gap-2.5 flex-wrap justify-end">
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

      {/* Switcher de Dispositivo */}
      <div className="flex items-center p-1 rounded-xl bg-brand-bg border border-brand-cream/15">
        <button
          type="button"
          onClick={() => setDevice("desktop")}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            device === "desktop" ? "bg-brand-cream/20 text-brand-cream" : "text-brand-cream/50 hover:text-brand-cream"
          }`}
          title="Vista Ordenador"
        >
          <Monitor className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setDevice("tablet")}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            device === "tablet" ? "bg-brand-cream/20 text-brand-cream" : "text-brand-cream/50 hover:text-brand-cream"
          }`}
          title="Vista Tablet"
        >
          <Tablet className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setDevice("mobile")}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            device === "mobile" ? "bg-brand-cream/20 text-brand-cream" : "text-brand-cream/50 hover:text-brand-cream"
          }`}
          title="Vista Móvil"
        >
          <Smartphone className="w-4 h-4" />
        </button>
      </div>

      {/* Vista limpia */}
      <button
        type="button"
        onClick={() => setCleanPreview(!cleanPreview)}
        className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
          cleanPreview
            ? "bg-brand-cream/20 border-brand-cream text-brand-cream font-semibold shadow-xs"
            : "border-brand-cream/15 text-brand-cream/70 hover:text-brand-cream"
        }`}
      >
        {cleanPreview ? <EyeOff className="w-3.5 h-3.5 text-brand-blush" /> : <Eye className="w-3.5 h-3.5" />}
        <span>{cleanPreview ? "Editar" : "Vista Limpia"}</span>
      </button>

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
            <span>{hasChanges ? "Guardar Sobre Mí" : "Al día"}</span>
          </>
        )}
      </button>

      <a
        href="/sobre-mi"
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-2 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5 transition-all flex items-center gap-1.5 no-underline"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        <span>Ver pública</span>
      </a>
    </div>
  );

  const cur = aboutData[lang];

  return (
    <AdminLayout
      title="Editor de Sobre Mí (Biografía & Filosofía)"
      subtitle={`Gestiona los textos, biografía y fotografías de Nerea en ${lang === "es" ? "Español 🇪🇸" : "Inglés 🇬🇧"}`}
      actions={headerActions}
    >
      <div
        className={`w-full mx-auto transition-all duration-300 flex flex-col gap-8 select-none ${
          device === "mobile"
            ? "max-w-[420px]"
            : device === "tablet"
            ? "max-w-[768px]"
            : "max-w-4xl"
        }`}
      >
        {/* ── 1. Encabezado y Retrato Principal de Nerea ── */}
        <div className={`p-6 md:p-8 rounded-2xl bg-brand-dark border border-brand-cream/15 shadow-xl flex gap-8 items-start ${device === "desktop" ? "flex-col sm:flex-row" : "flex-col"}`}>
          <div
            onClick={() => {
              setMediaTarget("photo");
              setMediaModalOpen(true);
            }}
            className="group/photo relative w-36 h-44 rounded-2xl overflow-hidden bg-brand-bg border-2 border-dashed border-brand-cream/20 hover:border-brand-blush cursor-pointer shadow-md shrink-0 mx-auto sm:mx-0"
            title="Haz clic para cambiar el retrato de Nerea"
          >
            <img
              src={getOptimizedImageUrl(aboutPhoto, 400)}
              alt="Nerea Lucas"
              className="w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-105"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-center p-2">
              <Camera className="w-5 h-5 text-brand-blush" />
              <span className="text-[9px] font-sans font-semibold uppercase text-brand-cream">
                Biblioteca / Cambiar
              </span>
            </div>
          </div>

          <div className="flex-1 w-full flex flex-col gap-4">
            <div>
              <label className="font-sans text-brand-cream/60 text-xs uppercase tracking-wider block mb-1">
                Eyebrow / Subtítulo Superior ({lang.toUpperCase()})
              </label>
              <input
                type="text"
                value={cur.eyebrow}
                onChange={(e) => updateField("eyebrow", e.target.value)}
                placeholder="Artista visual & ilustradora · Madrid"
                className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-sm focus:border-brand-blush outline-none"
              />
            </div>

            <div>
              <label className="font-sans text-brand-cream/60 text-xs uppercase tracking-wider block mb-1">
                Etiqueta de Artista ({lang.toUpperCase()})
              </label>
              <input
                type="text"
                value={cur.artistTag}
                onChange={(e) => updateField("artistTag", e.target.value)}
                placeholder="Miluartedenara"
                className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-sm focus:border-brand-blush outline-none"
              />
            </div>

            <div>
              <label className="font-sans text-brand-cream/60 text-xs uppercase tracking-wider block mb-1">
                Declaración de Entrada / Subtítulo ({lang.toUpperCase()})
              </label>
              <textarea
                rows={2}
                value={cur.subtitle}
                onChange={(e) => updateField("subtitle", e.target.value)}
                placeholder="Transformando ideas y emociones en mundos visuales..."
                className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-xs leading-relaxed focus:border-brand-blush outline-none resize-y"
              />
            </div>
          </div>
        </div>

        {/* ── 2. Cita Artística / Manifiesto ── */}
        <div className="p-6 md:p-8 rounded-2xl bg-brand-dark border border-brand-cream/15 shadow-xl flex flex-col gap-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-brand-cream/10">
            <Quote className="w-5 h-5 text-brand-blush" />
            <h3 className="font-serif text-xl text-brand-cream font-light">
              Cita / Manifiesto Artístico ({lang.toUpperCase()})
            </h3>
          </div>

          <div>
            <label className="font-sans text-brand-cream/60 text-xs uppercase tracking-wider block mb-1">
              Frase Célebre de Autor
            </label>
            <textarea
              rows={2}
              value={cur.quote}
              onChange={(e) => updateField("quote", e.target.value)}
              placeholder="«El arte no es solo lo que se ve...»"
              className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl p-3.5 text-brand-cream text-sm font-serif italic focus:border-brand-blush outline-none resize-y leading-relaxed"
            />
          </div>
        </div>

        {/* ── 3. Biografía y Puntos Clave ── */}
        <div className="p-6 md:p-8 rounded-2xl bg-brand-dark border border-brand-cream/15 shadow-xl flex flex-col gap-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-brand-cream/10">
            <BookOpen className="w-5 h-5 text-brand-blush" />
            <h3 className="font-serif text-xl text-brand-cream font-light">
              Biografía & Trayectoria ({lang.toUpperCase()})
            </h3>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="font-sans text-brand-cream/60 text-xs uppercase tracking-wider block mb-1">
                Título de la Sección de Biografía
              </label>
              <input
                type="text"
                value={cur.bioTitle}
                onChange={(e) => updateField("bioTitle", e.target.value)}
                placeholder="Sobre Nerea"
                className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-sm focus:border-brand-blush outline-none"
              />
            </div>

            <div>
              <label className="font-sans text-brand-cream/60 text-xs uppercase tracking-wider block mb-1">
                Párrafo 1 (Presentación & Formación)
              </label>
              <textarea
                rows={3}
                value={cur.bioP1}
                onChange={(e) => updateField("bioP1", e.target.value)}
                className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl p-3 text-xs text-brand-cream focus:border-brand-blush outline-none resize-y leading-relaxed"
              />
            </div>

            <div>
              <label className="font-sans text-brand-cream/60 text-xs uppercase tracking-wider block mb-1">
                Párrafo 2 (Técnicas, Escultura, Joyería y Concept Art)
              </label>
              <textarea
                rows={3}
                value={cur.bioP2}
                onChange={(e) => updateField("bioP2", e.target.value)}
                className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl p-3 text-xs text-brand-cream focus:border-brand-blush outline-none resize-y leading-relaxed"
              />
            </div>

            <div>
              <label className="font-sans text-brand-cream/60 text-xs uppercase tracking-wider block mb-1">
                Párrafo 3 (Amor por el detalle & Filosofía)
              </label>
              <textarea
                rows={3}
                value={cur.bioP3}
                onChange={(e) => updateField("bioP3", e.target.value)}
                className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl p-3 text-xs text-brand-cream focus:border-brand-blush outline-none resize-y leading-relaxed"
              />
            </div>

            {/* Puntos destacados */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="font-sans text-brand-blush text-[11px] uppercase tracking-wider font-semibold block mb-1">
                  Punto Clave 1 (Máster)
                </label>
                <input
                  type="text"
                  value={cur.stats.master}
                  onChange={(e) => updateStat("master", e.target.value)}
                  className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-3 py-2 text-xs text-brand-cream outline-none focus:border-brand-blush"
                />
              </div>

              <div>
                <label className="font-sans text-brand-blush text-[11px] uppercase tracking-wider font-semibold block mb-1">
                  Punto Clave 2 (Enfoque)
                </label>
                <input
                  type="text"
                  value={cur.stats.focus}
                  onChange={(e) => updateStat("focus", e.target.value)}
                  className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-3 py-2 text-xs text-brand-cream outline-none focus:border-brand-blush"
                />
              </div>

              <div>
                <label className="font-sans text-brand-blush text-[11px] uppercase tracking-wider font-semibold block mb-1">
                  Punto Clave 3 (Especialidad)
                </label>
                <input
                  type="text"
                  value={cur.stats.specialty}
                  onChange={(e) => updateStat("specialty", e.target.value)}
                  className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-3 py-2 text-xs text-brand-cream outline-none focus:border-brand-blush"
                />
              </div>
            </div>

            {/* Imagen de la Serie Musae */}
            <div className="pt-4 border-t border-brand-cream/10 flex flex-col gap-2">
              <label className="font-sans text-brand-cream/60 text-xs uppercase tracking-wider">
                Imagen Destacada (Serie Musae)
              </label>
              <div
                onClick={() => {
                  setMediaTarget("musae");
                  setMediaModalOpen(true);
                }}
                className="group/musae relative w-full h-48 rounded-xl overflow-hidden bg-brand-bg border-2 border-dashed border-brand-cream/20 hover:border-brand-blush cursor-pointer shadow-md"
              >
                <img
                  src={getOptimizedImageUrl(musaeImg, 800)}
                  alt="Serie Musae"
                  className="w-full h-full object-cover group-hover/musae:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/musae:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-center p-2">
                  <Camera className="w-5 h-5 text-brand-blush" />
                  <span className="text-[10px] font-sans font-semibold uppercase text-brand-cream">
                    Biblioteca / Cambiar Imagen Serie Musae
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. Universos Creativos & Disciplinas ── */}
        <div className="p-6 md:p-8 rounded-2xl bg-brand-dark border border-brand-cream/15 shadow-xl flex flex-col gap-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-brand-cream/10">
            <Palette className="w-5 h-5 text-brand-blush" />
            <h3 className="font-serif text-xl text-brand-cream font-light">
              Universos Creativos & Disciplinas ({lang.toUpperCase()})
            </h3>
          </div>

          <div>
            <label className="font-sans text-brand-cream/60 text-xs uppercase tracking-wider block mb-1">
              Título de la Sección
            </label>
            <input
              type="text"
              value={cur.disciplinesTitle}
              onChange={(e) => updateField("disciplinesTitle", e.target.value)}
              placeholder="Universos Creativos"
              className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-sm focus:border-brand-blush outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Musae */}
            <div className="p-4 rounded-xl bg-brand-bg border border-brand-cream/10 flex flex-col gap-2.5">
              <span className="text-xs font-semibold text-brand-blush font-sans uppercase">1. Serie Musae</span>
              <input
                type="text"
                value={cur.disciplines.musae.title}
                onChange={(e) => updateDiscipline("musae", "title", e.target.value)}
                placeholder="Título"
                className="bg-transparent font-serif text-sm text-brand-cream font-light outline-none border-b border-transparent focus:border-brand-blush"
              />
              <textarea
                rows={2}
                value={cur.disciplines.musae.desc}
                onChange={(e) => updateDiscipline("musae", "desc", e.target.value)}
                placeholder="Descripción"
                className="w-full bg-brand-dark/50 border border-brand-cream/10 rounded-lg p-2 text-xs text-brand-cream/70 outline-none resize-y"
              />
            </div>

            {/* Concept */}
            <div className="p-4 rounded-xl bg-brand-bg border border-brand-cream/10 flex flex-col gap-2.5">
              <span className="text-xs font-semibold text-brand-blush font-sans uppercase">2. Concept Art</span>
              <input
                type="text"
                value={cur.disciplines.concept.title}
                onChange={(e) => updateDiscipline("concept", "title", e.target.value)}
                placeholder="Título"
                className="bg-transparent font-serif text-sm text-brand-cream font-light outline-none border-b border-transparent focus:border-brand-blush"
              />
              <textarea
                rows={2}
                value={cur.disciplines.concept.desc}
                onChange={(e) => updateDiscipline("concept", "desc", e.target.value)}
                placeholder="Descripción"
                className="w-full bg-brand-dark/50 border border-brand-cream/10 rounded-lg p-2 text-xs text-brand-cream/70 outline-none resize-y"
              />
            </div>

            {/* Clay */}
            <div className="p-4 rounded-xl bg-brand-bg border border-brand-cream/10 flex flex-col gap-2.5">
              <span className="text-xs font-semibold text-brand-blush font-sans uppercase">3. Escultura en Arcilla</span>
              <input
                type="text"
                value={cur.disciplines.clay.title}
                onChange={(e) => updateDiscipline("clay", "title", e.target.value)}
                placeholder="Título"
                className="bg-transparent font-serif text-sm text-brand-cream font-light outline-none border-b border-transparent focus:border-brand-blush"
              />
              <textarea
                rows={2}
                value={cur.disciplines.clay.desc}
                onChange={(e) => updateDiscipline("clay", "desc", e.target.value)}
                placeholder="Descripción"
                className="w-full bg-brand-dark/50 border border-brand-cream/10 rounded-lg p-2 text-xs text-brand-cream/70 outline-none resize-y"
              />
            </div>

            {/* Music */}
            <div className="p-4 rounded-xl bg-brand-bg border border-brand-cream/10 flex flex-col gap-2.5">
              <span className="text-xs font-semibold text-brand-blush font-sans uppercase">4. Música & Dirección de Arte</span>
              <input
                type="text"
                value={cur.disciplines.music.title}
                onChange={(e) => updateDiscipline("music", "title", e.target.value)}
                placeholder="Título"
                className="bg-transparent font-serif text-sm text-brand-cream font-light outline-none border-b border-transparent focus:border-brand-blush"
              />
              <textarea
                rows={2}
                value={cur.disciplines.music.desc}
                onChange={(e) => updateDiscipline("music", "desc", e.target.value)}
                placeholder="Descripción"
                className="w-full bg-brand-dark/50 border border-brand-cream/10 rounded-lg p-2 text-xs text-brand-cream/70 outline-none resize-y"
              />
            </div>
          </div>
        </div>

        {/* ── 5. Llamada a la Acción (CTA) ── */}
        <div className="p-6 md:p-8 rounded-2xl bg-brand-dark border border-brand-cream/15 shadow-xl flex flex-col gap-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-brand-cream/10">
            <Send className="w-5 h-5 text-brand-blush" />
            <h3 className="font-serif text-xl text-brand-cream font-light">
              Llamada a la Acción de Contacto ({lang.toUpperCase()})
            </h3>
          </div>

          <div>
            <label className="font-sans text-brand-cream/60 text-xs uppercase tracking-wider block mb-1">
              Título del Banner de Contacto
            </label>
            <input
              type="text"
              value={cur.contactPrompt}
              onChange={(e) => updateField("contactPrompt", e.target.value)}
              placeholder="¿Hablamos de tu proyecto o idea artística?"
              className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-sm focus:border-brand-blush outline-none"
            />
          </div>
        </div>
      </div>

      {/* Modal Biblioteca de Medios */}
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={handleMediaSelect}
        initialSelectedUrl={mediaTarget === "photo" ? aboutPhoto : musaeImg}
        uploadFolder="miluarte/sobre-mi"
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
