import { useState, useEffect, useRef } from "react";
import {
  GraduationCap,
  Briefcase,
  Award,
  Globe,
  Save,
  Plus,
  Trash2,
  Camera,
  ExternalLink,
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { Toast } from "../../components/admin/Toast";
import { useAdminApi } from "../../hooks/useAdminApi";
import { useUpload } from "../../hooks/useUpload";
import { translations as defaultTranslations } from "../../locales/translations";
import { getOptimizedImageUrl } from "../../utils/cloudinary";

type Lang = "es" | "en";

interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  description: string;
}

interface EducationItem {
  degree: string;
  school: string;
  period: string;
}

interface LanguageItem {
  language: string;
  level: string;
}

export function AdminResumeEditor() {
  const { request } = useAdminApi();
  const { uploadImage } = useUpload();

  const [lang, setLang] = useState<Lang>("es");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Foto de perfil del CV
  const [photo, setPhoto] = useState("https://res.cloudinary.com/doznr2qm4/image/upload/v1785683173/image_cv_nara_xb0v9d.png");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Textos y datos del CV
  const [resumeData, setResumeData] = useState<{
    subtitleEs: string;
    subtitleEn: string;
    profileTextEs: string;
    profileTextEn: string;
    skillsDigitalEs: string;
    skillsDigitalEn: string;
    skillsTraditionalEs: string;
    skillsTraditionalEn: string;
    skillsCreativeEs: string;
    skillsCreativeEn: string;
    experienceEs: ExperienceItem[];
    experienceEn: ExperienceItem[];
    educationEs: EducationItem[];
    educationEn: EducationItem[];
    languages: LanguageItem[];
  }>({
    subtitleEs: defaultTranslations.es.resume.subtitle,
    subtitleEn: defaultTranslations.en.resume.subtitle,
    profileTextEs: defaultTranslations.es.resume.profileText,
    profileTextEn: defaultTranslations.en.resume.profileText,
    skillsDigitalEs: defaultTranslations.es.resume.skillsItems.digital,
    skillsDigitalEn: defaultTranslations.en.resume.skillsItems.digital,
    skillsTraditionalEs: defaultTranslations.es.resume.skillsItems.traditional,
    skillsTraditionalEn: defaultTranslations.en.resume.skillsItems.traditional,
    skillsCreativeEs: defaultTranslations.es.resume.skillsItems.creative,
    skillsCreativeEn: defaultTranslations.en.resume.skillsItems.creative,
    experienceEs: [...defaultTranslations.es.resume.experienceItems],
    experienceEn: [...defaultTranslations.en.resume.experienceItems],
    educationEs: [...defaultTranslations.es.resume.educationItems],
    educationEn: [...defaultTranslations.en.resume.educationItems],
    languages: [...defaultTranslations.es.resume.languagesItems],
  });

  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; open: boolean }>({
    message: "",
    type: "success",
    open: false,
  });

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const res = await request<any>("/api/admin/texts");
      if (res) {
        if (res.resumePhoto) setPhoto(res.resumePhoto);

        const esRes = res.es?.resume || {};
        const enRes = res.en?.resume || {};

        setResumeData((prev) => ({
          subtitleEs: esRes.subtitle || prev.subtitleEs,
          subtitleEn: enRes.subtitle || prev.subtitleEn,
          profileTextEs: esRes.profileText || prev.profileTextEs,
          profileTextEn: enRes.profileText || prev.profileTextEn,
          skillsDigitalEs: esRes.skillsItems?.digital || prev.skillsDigitalEs,
          skillsDigitalEn: enRes.skillsItems?.digital || prev.skillsDigitalEn,
          skillsTraditionalEs: esRes.skillsItems?.traditional || prev.skillsTraditionalEs,
          skillsTraditionalEn: enRes.skillsItems?.traditional || prev.skillsTraditionalEn,
          skillsCreativeEs: esRes.skillsItems?.creative || prev.skillsCreativeEs,
          skillsCreativeEn: enRes.skillsItems?.creative || prev.skillsCreativeEn,
          experienceEs: Array.isArray(esRes.experienceItems) ? esRes.experienceItems : prev.experienceEs,
          experienceEn: Array.isArray(enRes.experienceItems) ? enRes.experienceItems : prev.experienceEn,
          educationEs: Array.isArray(esRes.educationItems) ? esRes.educationItems : prev.educationEs,
          educationEn: Array.isArray(enRes.educationItems) ? enRes.educationItems : prev.educationEn,
          languages: Array.isArray(esRes.languagesItems) ? esRes.languagesItems : prev.languages,
        }));
      }
    } catch (err: any) {
      console.warn("Usando datos base de CV:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const res = await uploadImage(file, "miluarte/cv");
      setPhoto(res.secureUrl);
      setHasChanges(true);
      setToast({ message: "Foto de perfil actualizada en el borrador", type: "success", open: true });
    } catch (err: any) {
      setToast({ message: err.message || "Error al subir la foto", type: "error", open: true });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await request("/api/admin/texts", {
        method: "PUT",
        body: JSON.stringify({
          resumePhoto: photo,
          es: {
            resume: {
              subtitle: resumeData.subtitleEs,
              profileText: resumeData.profileTextEs,
              skillsItems: {
                digital: resumeData.skillsDigitalEs,
                traditional: resumeData.skillsTraditionalEs,
                creative: resumeData.skillsCreativeEs,
              },
              experienceItems: resumeData.experienceEs,
              educationItems: resumeData.educationEs,
              languagesItems: resumeData.languages,
            },
          },
          en: {
            resume: {
              subtitle: resumeData.subtitleEn,
              profileText: resumeData.profileTextEn,
              skillsItems: {
                digital: resumeData.skillsDigitalEn,
                traditional: resumeData.skillsTraditionalEn,
                creative: resumeData.skillsCreativeEn,
              },
              experienceItems: resumeData.experienceEn,
              educationItems: resumeData.educationEn,
              languagesItems: resumeData.languages,
            },
          },
        }),
      });

      setHasChanges(false);
      setToast({ message: "¡Currículum actualizado y publicado con éxito!", type: "success", open: true });
    } catch (err: any) {
      setToast({ message: err.message || "Error al guardar el CV", type: "error", open: true });
    } finally {
      setIsSaving(false);
    }
  };

  // Helpers para añadir/eliminar experiencia
  const handleAddExperience = () => {
    const newExpEs: ExperienceItem = {
      period: "2026 — Actualidad",
      role: "Nueva Posición / Proyecto",
      company: "Empresa o Cliente",
      description: "Descripción de responsabilidades y dirección artística.",
    };
    const newExpEn: ExperienceItem = {
      period: "2026 — Present",
      role: "New Position / Project",
      company: "Company or Client",
      description: "Description of responsibilities and artistic direction.",
    };

    setResumeData((prev) => ({
      ...prev,
      experienceEs: [newExpEs, ...prev.experienceEs],
      experienceEn: [newExpEn, ...prev.experienceEn],
    }));
    setHasChanges(true);
  };

  const handleDeleteExperience = (idx: number) => {
    setResumeData((prev) => ({
      ...prev,
      experienceEs: prev.experienceEs.filter((_, i) => i !== idx),
      experienceEn: prev.experienceEn.filter((_, i) => i !== idx),
    }));
    setHasChanges(true);
  };

  // Helpers para educación
  const handleAddEducation = () => {
    const newEduEs: EducationItem = {
      period: "2026",
      degree: "Nuevo Título / Máster / Curso",
      school: "Centro de Estudios o Escuela de Arte",
    };
    const newEduEn: EducationItem = {
      period: "2026",
      degree: "New Degree / Master / Course",
      school: "Art School or University",
    };

    setResumeData((prev) => ({
      ...prev,
      educationEs: [newEduEs, ...prev.educationEs],
      educationEn: [newEduEn, ...prev.educationEn],
    }));
    setHasChanges(true);
  };

  const handleDeleteEducation = (idx: number) => {
    setResumeData((prev) => ({
      ...prev,
      educationEs: prev.educationEs.filter((_, i) => i !== idx),
      educationEn: prev.educationEn.filter((_, i) => i !== idx),
    }));
    setHasChanges(true);
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
            <span>{hasChanges ? "Guardar CV" : "Al día"}</span>
          </>
        )}
      </button>

      <a
        href="/resume"
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-2 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5 transition-all flex items-center gap-1.5 no-underline"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        <span>Ver CV Público</span>
      </a>
    </div>
  );

  return (
    <AdminLayout
      title="Editor de Currículum & Trayectoria"
      subtitle={`Gestiona la experiencia, formación y habilidades de Nerea en ${lang === "es" ? "Español 🇪🇸" : "Inglés 🇬🇧"}`}
      actions={headerActions}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="max-w-4xl mx-auto flex flex-col gap-8 select-none">
        {/* ── 1. Encabezado y Foto de Perfil ── */}
        <div className="p-6 md:p-8 rounded-2xl bg-brand-dark border border-brand-cream/15 shadow-xl flex flex-col sm:flex-row gap-8 items-start sm:items-center">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group/photo relative w-28 h-28 rounded-2xl overflow-hidden bg-brand-bg border-2 border-dashed border-brand-cream/20 hover:border-brand-blush cursor-pointer shadow-md shrink-0"
            title="Haz clic para cambiar la foto del CV"
          >
            <img
              src={getOptimizedImageUrl(photo, 300)}
              alt="Nerea Lucas"
              className="w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-105"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-center p-2">
              <Camera className="w-5 h-5 text-brand-blush" />
              <span className="text-[9px] font-sans font-semibold uppercase text-brand-cream">
                {uploadingPhoto ? "Subiendo..." : "Cambiar Foto"}
              </span>
            </div>
          </div>

          <div className="flex-1 w-full flex flex-col gap-4">
            <div>
              <label className="font-sans text-brand-cream/60 text-xs uppercase tracking-wider block mb-1">
                Subtítulo / Rol Profesional ({lang.toUpperCase()})
              </label>
              <input
                type="text"
                value={lang === "es" ? resumeData.subtitleEs : resumeData.subtitleEn}
                onChange={(e) => {
                  const val = e.target.value;
                  setResumeData((prev) => ({
                    ...prev,
                    [lang === "es" ? "subtitleEs" : "subtitleEn"]: val,
                  }));
                  setHasChanges(true);
                }}
                placeholder="Ilustradora · Diseñadora 3D · Artista Visual"
                className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-sm focus:border-brand-blush outline-none"
              />
            </div>

            <div>
              <label className="font-sans text-brand-cream/60 text-xs uppercase tracking-wider block mb-1">
                Biografía / Texto del Perfil ({lang.toUpperCase()})
              </label>
              <textarea
                rows={3}
                value={lang === "es" ? resumeData.profileTextEs : resumeData.profileTextEn}
                onChange={(e) => {
                  const val = e.target.value;
                  setResumeData((prev) => ({
                    ...prev,
                    [lang === "es" ? "profileTextEs" : "profileTextEn"]: val,
                  }));
                  setHasChanges(true);
                }}
                placeholder="Resumen del perfil y visión profesional..."
                className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-xs leading-relaxed focus:border-brand-blush outline-none resize-y"
              />
            </div>
          </div>
        </div>

        {/* ── 2. Experiencia Profesional ── */}
        <div className="p-6 md:p-8 rounded-2xl bg-brand-dark border border-brand-cream/15 shadow-xl flex flex-col gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-brand-cream/10">
            <div className="flex items-center gap-2.5">
              <Briefcase className="w-5 h-5 text-brand-blush" />
              <h3 className="font-serif text-xl text-brand-cream font-light">
                Experiencia Profesional ({lang.toUpperCase()})
              </h3>
            </div>
            <button
              type="button"
              onClick={handleAddExperience}
              className="px-3.5 py-1.5 rounded-xl bg-brand-blush/20 hover:bg-brand-blush text-brand-blush hover:text-brand-ink text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Experiencia</span>
            </button>
          </div>

          <div className="flex flex-col gap-5">
            {(lang === "es" ? resumeData.experienceEs : resumeData.experienceEn).map((exp, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-brand-bg border border-brand-cream/10 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => {
                      const val = e.target.value;
                      setResumeData((prev) => {
                        const next = JSON.parse(JSON.stringify(prev));
                        const key = lang === "es" ? "experienceEs" : "experienceEn";
                        next[key][idx].role = val;
                        return next;
                      });
                      setHasChanges(true);
                    }}
                    placeholder="Puesto / Cargo"
                    className="flex-1 bg-transparent text-sm font-semibold text-brand-cream focus:text-brand-blush outline-none border-b border-transparent focus:border-brand-blush"
                  />
                  <input
                    type="text"
                    value={exp.period}
                    onChange={(e) => {
                      const val = e.target.value;
                      setResumeData((prev) => {
                        const next = JSON.parse(JSON.stringify(prev));
                        const key = lang === "es" ? "experienceEs" : "experienceEn";
                        next[key][idx].period = val;
                        return next;
                      });
                      setHasChanges(true);
                    }}
                    placeholder="2023 — Actualidad"
                    className="w-36 text-right bg-transparent text-xs font-mono text-brand-blush focus:text-brand-cream outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteExperience(idx)}
                    className="text-brand-cream/40 hover:text-brand-orange p-1 transition-colors cursor-pointer"
                    title="Eliminar experiencia"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => {
                    const val = e.target.value;
                    setResumeData((prev) => {
                      const next = JSON.parse(JSON.stringify(prev));
                      const key = lang === "es" ? "experienceEs" : "experienceEn";
                      next[key][idx].company = val;
                      return next;
                    });
                    setHasChanges(true);
                  }}
                  placeholder="Empresa / Cliente / Sello"
                  className="bg-transparent text-xs text-brand-cream/70 outline-none"
                />

                <textarea
                  rows={2}
                  value={exp.description}
                  onChange={(e) => {
                    const val = e.target.value;
                    setResumeData((prev) => {
                      const next = JSON.parse(JSON.stringify(prev));
                      const key = lang === "es" ? "experienceEs" : "experienceEn";
                      next[key][idx].description = val;
                      return next;
                    });
                    setHasChanges(true);
                  }}
                  placeholder="Descripción del rol..."
                  className="w-full bg-brand-dark/50 border border-brand-cream/10 rounded-lg p-2.5 text-xs text-brand-cream/70 focus:border-brand-blush outline-none resize-y"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. Educación y Formación ── */}
        <div className="p-6 md:p-8 rounded-2xl bg-brand-dark border border-brand-cream/15 shadow-xl flex flex-col gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-brand-cream/10">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-5 h-5 text-brand-blush" />
              <h3 className="font-serif text-xl text-brand-cream font-light">
                Educación & Formación Académica ({lang.toUpperCase()})
              </h3>
            </div>
            <button
              type="button"
              onClick={handleAddEducation}
              className="px-3.5 py-1.5 rounded-xl bg-brand-blush/20 hover:bg-brand-blush text-brand-blush hover:text-brand-ink text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Formación</span>
            </button>
          </div>

          <div className="flex flex-col gap-5">
            {(lang === "es" ? resumeData.educationEs : resumeData.educationEn).map((edu, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-brand-bg border border-brand-cream/10 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => {
                      const val = e.target.value;
                      setResumeData((prev) => {
                        const next = JSON.parse(JSON.stringify(prev));
                        const key = lang === "es" ? "educationEs" : "educationEn";
                        next[key][idx].degree = val;
                        return next;
                      });
                      setHasChanges(true);
                    }}
                    placeholder="Título obtenido"
                    className="flex-1 bg-transparent text-sm font-semibold text-brand-cream focus:text-brand-blush outline-none"
                  />
                  <input
                    type="text"
                    value={edu.period}
                    onChange={(e) => {
                      const val = e.target.value;
                      setResumeData((prev) => {
                        const next = JSON.parse(JSON.stringify(prev));
                        const key = lang === "es" ? "educationEs" : "educationEn";
                        next[key][idx].period = val;
                        return next;
                      });
                      setHasChanges(true);
                    }}
                    placeholder="2021 — 2023"
                    className="w-28 text-right bg-transparent text-xs font-mono text-brand-blush outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteEducation(idx)}
                    className="text-brand-cream/40 hover:text-brand-orange p-1 transition-colors cursor-pointer"
                    title="Eliminar formación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => {
                    const val = e.target.value;
                    setResumeData((prev) => {
                      const next = JSON.parse(JSON.stringify(prev));
                      const key = lang === "es" ? "educationEs" : "educationEn";
                      next[key][idx].school = val;
                      return next;
                    });
                    setHasChanges(true);
                  }}
                  placeholder="Escuela de Arte / Universidad"
                  className="bg-transparent text-xs text-brand-cream/70 outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. Habilidades & Software ── */}
        <div className="p-6 md:p-8 rounded-2xl bg-brand-dark border border-brand-cream/15 shadow-xl flex flex-col gap-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-brand-cream/10">
            <Award className="w-5 h-5 text-brand-blush" />
            <h3 className="font-serif text-xl text-brand-cream font-light">
              Habilidades Técnicas & Artísticas ({lang.toUpperCase()})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase font-sans text-brand-blush font-semibold tracking-wider">
                Digital & Software
              </label>
              <textarea
                rows={3}
                value={lang === "es" ? resumeData.skillsDigitalEs : resumeData.skillsDigitalEn}
                onChange={(e) => {
                  const val = e.target.value;
                  setResumeData((prev) => ({
                    ...prev,
                    [lang === "es" ? "skillsDigitalEs" : "skillsDigitalEn"]: val,
                  }));
                  setHasChanges(true);
                }}
                className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl p-3 text-xs text-brand-cream focus:border-brand-blush outline-none resize-y leading-relaxed"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase font-sans text-brand-blush font-semibold tracking-wider">
                Tradicional & Escultura
              </label>
              <textarea
                rows={3}
                value={lang === "es" ? resumeData.skillsTraditionalEs : resumeData.skillsTraditionalEn}
                onChange={(e) => {
                  const val = e.target.value;
                  setResumeData((prev) => ({
                    ...prev,
                    [lang === "es" ? "skillsTraditionalEs" : "skillsTraditionalEn"]: val,
                  }));
                  setHasChanges(true);
                }}
                className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl p-3 text-xs text-brand-cream focus:border-brand-blush outline-none resize-y leading-relaxed"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase font-sans text-brand-blush font-semibold tracking-wider">
                Concept & Dirección de Arte
              </label>
              <textarea
                rows={3}
                value={lang === "es" ? resumeData.skillsCreativeEs : resumeData.skillsCreativeEn}
                onChange={(e) => {
                  const val = e.target.value;
                  setResumeData((prev) => ({
                    ...prev,
                    [lang === "es" ? "skillsCreativeEs" : "skillsCreativeEn"]: val,
                  }));
                  setHasChanges(true);
                }}
                className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl p-3 text-xs text-brand-cream focus:border-brand-blush outline-none resize-y leading-relaxed"
              />
            </div>
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
