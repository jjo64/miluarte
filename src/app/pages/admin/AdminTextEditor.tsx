import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Save, Sparkles, FileText, CheckCircle2, ChevronDown, RefreshCw } from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { LanguageTabs } from "../../components/admin/LanguageTabs";
import { Toast } from "../../components/admin/Toast";
import { SiteTexts } from "../../types/cms";
import { useAdminApi } from "../../hooks/useAdminApi";

export function AdminTextEditor() {
  const [texts, setTexts] = useState<SiteTexts>({ es: {}, en: {} });
  const [activeLang, setActiveLang] = useState<"es" | "en">("es");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    hero: true,
    footer: true,
    services: false,
  });

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; open: boolean }>({
    message: "",
    type: "success",
    open: false,
  });

  const { request } = useAdminApi();

  const fetchTexts = async () => {
    try {
      setLoading(true);
      const data = await request<SiteTexts>("/api/admin/texts");
      setTexts(data);
    } catch (err: any) {
      setToast({
        message: "Error al cargar textos: " + (err.message || "Fallo de conexión"),
        type: "error",
        open: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTexts();
  }, []);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateField = (path: string[], value: any) => {
    setHasChanges(true);
    setTexts((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      let cur = next[activeLang];
      for (let i = 0; i < path.length - 1; i++) {
        if (!cur[path[i]]) cur[path[i]] = {};
        cur = cur[path[i]];
      }
      cur[path[path.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await request("/api/admin/texts", {
        method: "PUT",
        body: JSON.stringify(texts),
      });
      setHasChanges(false);
      setToast({ message: "¡Todos los textos han sido actualizados en vivo!", type: "success", open: true });
    } catch (err: any) {
      setToast({ message: err.message || "Error al guardar los textos", type: "error", open: true });
    } finally {
      setSaving(false);
    }
  };

  const curLangTexts = texts[activeLang] || {};
  const hero = curLangTexts.hero || {};
  const footer = curLangTexts.footer || {};
  const services = curLangTexts.services?.items || {};

  const headerActions = (
    <div className="flex items-center gap-3">
      <LanguageTabs activeLanguage={activeLang} onChange={setActiveLang} />

      <button
        onClick={handleSave}
        disabled={saving}
        className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md ${
          hasChanges
            ? "bg-brand-blush hover:bg-brand-cream text-brand-ink animate-pulse"
            : "bg-brand-cream/10 text-brand-cream/60 hover:bg-brand-cream/20"
        }`}
      >
        {saving ? (
          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Save className="w-3.5 h-3.5" />
        )}
        <span>{hasChanges ? "Guardar Cambios" : "Guardado"}</span>
      </button>
    </div>
  );

  return (
    <AdminLayout
      title="Editor de Textos y Traducciones"
      subtitle="Edita la biografía, portada, servicios y pies de página en Español e Inglés"
      actions={headerActions}
    >
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-brand-dark/50 border border-brand-cream/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-4xl pb-20 select-none">
          {/* Indicador de idioma activo */}
          <div className="p-4 rounded-2xl bg-brand-dark border border-brand-cream/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeLang === "es" ? "🇪🇸" : "🇬🇧"}</span>
              <div>
                <p className="font-serif text-sm text-brand-cream font-light">
                  Editando contenido en: <strong className="text-brand-blush">{activeLang === "es" ? "Español" : "Inglés"}</strong>
                </p>
                <p className="font-sans text-[11px] text-brand-cream/50">
                  Los cambios afectarán a los visitantes que naveguen en este idioma
                </p>
              </div>
            </div>

            <button
              onClick={fetchTexts}
              title="Restablecer textos cargados"
              className="p-2 rounded-xl text-brand-cream/50 hover:text-brand-cream hover:bg-brand-cream/5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* ── 1. PORTADA & HERO ── */}
          <div className="rounded-2xl bg-brand-dark border border-brand-cream/10 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("hero")}
              className="w-full p-5 flex items-center justify-between bg-brand-dark hover:bg-brand-cream/5 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-blush/15 text-brand-blush border border-brand-blush/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-brand-cream font-light">Portada (Hero) & Biografía</h3>
                  <p className="font-sans text-xs text-brand-cream/50">Textos principales que ve el usuario al entrar</p>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-brand-cream/40 transition-transform duration-300 ${
                  openSections.hero ? "rotate-180" : ""
                }`}
              />
            </button>

            {openSections.hero && (
              <div className="p-6 pt-2 border-t border-brand-cream/5 flex flex-col gap-4">
                {/* Tagline */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                    Tagline Superior
                  </label>
                  <input
                    type="text"
                    value={hero.tagline || ""}
                    onChange={(e) => updateField(["hero", "tagline"], e.target.value)}
                    placeholder="Ilustradora & artista digital · Madrid"
                    className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-sm focus:border-brand-blush outline-none"
                  />
                </div>

                {/* Título y Nombre */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                      Saludo inicial
                    </label>
                    <input
                      type="text"
                      value={hero.greetingBefore || ""}
                      onChange={(e) => updateField(["hero", "greetingBefore"], e.target.value)}
                      placeholder="Hola,\nsoy "
                      className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-sm focus:border-brand-blush outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                      Nombre Artístico (Cursiva)
                    </label>
                    <input
                      type="text"
                      value={hero.greetingItalic || ""}
                      onChange={(e) => updateField(["hero", "greetingItalic"], e.target.value)}
                      placeholder="Nerea"
                      className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-sm focus:border-brand-blush outline-none"
                    />
                  </div>
                </div>

                {/* Frase artística */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                    Frase Artística / Declaración
                  </label>
                  <input
                    type="text"
                    value={hero.artline || ""}
                    onChange={(e) => updateField(["hero", "artline"], e.target.value)}
                    placeholder="Transformo ideas en mundos visuales con alma."
                    className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-sm focus:border-brand-blush outline-none"
                  />
                </div>

                {/* Párrafos de biografía */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                    Biografía — Párrafo 1
                  </label>
                  <textarea
                    rows={3}
                    value={hero.bio1 || ""}
                    onChange={(e) => updateField(["hero", "bio1"], e.target.value)}
                    className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl p-3 text-brand-cream text-sm focus:border-brand-blush outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                    Biografía — Párrafo 2
                  </label>
                  <textarea
                    rows={2}
                    value={hero.bio2 || ""}
                    onChange={(e) => updateField(["hero", "bio2"], e.target.value)}
                    className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl p-3 text-brand-cream text-sm focus:border-brand-blush outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Botones de acción CTA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                      Botón "Ver trabajos"
                    </label>
                    <input
                      type="text"
                      value={hero.viewWorks || ""}
                      onChange={(e) => updateField(["hero", "viewWorks"], e.target.value)}
                      className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-3.5 py-2 text-brand-cream text-xs focus:border-brand-blush outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                      Botón "Escribir encargo"
                    </label>
                    <input
                      type="text"
                      value={hero.sendInquiry || ""}
                      onChange={(e) => updateField(["hero", "sendInquiry"], e.target.value)}
                      className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-3.5 py-2 text-brand-cream text-xs focus:border-brand-blush outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── 2. SERVICIOS ── */}
          <div className="rounded-2xl bg-brand-dark border border-brand-cream/10 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("services")}
              className="w-full p-5 flex items-center justify-between bg-brand-dark hover:bg-brand-cream/5 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-orange/15 text-brand-orange border border-brand-orange/30 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-brand-cream font-light">Secciones de Servicios</h3>
                  <p className="font-sans text-xs text-brand-cream/50">Diseño Gráfico, 3D, Diggin', Ilustración, Concept Art</p>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-brand-cream/40 transition-transform duration-300 ${
                  openSections.services ? "rotate-180" : ""
                }`}
              />
            </button>

            {openSections.services && (
              <div className="p-6 pt-2 border-t border-brand-cream/5 flex flex-col gap-6">
                {Object.entries(services).map(([key, srv]: [string, any]) => (
                  <div key={key} className="p-4 rounded-xl bg-brand-bg/60 border border-brand-cream/10 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-brand-cream/5 pb-2">
                      <span className="font-serif text-base text-brand-blush font-light">{srv.label || key}</span>
                      <span className="font-mono text-[10px] text-brand-cream/40">{key}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="font-sans text-brand-cream/60 text-[11px] uppercase">Etiqueta / Label</label>
                        <input
                          type="text"
                          value={srv.label || ""}
                          onChange={(e) => updateField(["services", "items", key, "label"], e.target.value)}
                          className="bg-brand-dark border border-brand-cream/10 rounded-lg px-3 py-1.5 text-xs text-brand-cream outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-sans text-brand-cream/60 text-[11px] uppercase">Título</label>
                        <input
                          type="text"
                          value={srv.title || ""}
                          onChange={(e) => updateField(["services", "items", key, "title"], e.target.value)}
                          className="bg-brand-dark border border-brand-cream/10 rounded-lg px-3 py-1.5 text-xs text-brand-cream outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-sans text-brand-cream/60 text-[11px] uppercase">Descripción</label>
                      <textarea
                        rows={2}
                        value={srv.description || ""}
                        onChange={(e) => updateField(["services", "items", key, "description"], e.target.value)}
                        className="bg-brand-dark border border-brand-cream/10 rounded-lg p-2 text-xs text-brand-cream outline-none resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── 3. FOOTER & CONTACTO ── */}
          <div className="rounded-2xl bg-brand-dark border border-brand-cream/10 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("footer")}
              className="w-full p-5 flex items-center justify-between bg-brand-dark hover:bg-brand-cream/5 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-cream/10 text-brand-cream border border-brand-cream/20 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-brand-cream font-light">Pie de Página (Footer)</h3>
                  <p className="font-sans text-xs text-brand-cream/50">Texto del estudio creativo y créditos</p>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-brand-cream/40 transition-transform duration-300 ${
                  openSections.footer ? "rotate-180" : ""
                }`}
              />
            </button>

            {openSections.footer && (
              <div className="p-6 pt-2 border-t border-brand-cream/5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-brand-cream/70 text-xs uppercase tracking-wider font-medium">
                    Descripción del Estudio Creativo
                  </label>
                  <textarea
                    rows={3}
                    value={footer.studio || ""}
                    onChange={(e) => updateField(["footer", "studio"], e.target.value)}
                    placeholder="Estudio creativo multidisciplinar...\nIlustración, diseño y dirección de arte."
                    className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl p-3 text-brand-cream text-sm focus:border-brand-blush outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Save Bar when changes exist */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-brand-dark/95 backdrop-blur-md border border-brand-blush/40 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce">
          <p className="font-sans text-xs text-brand-cream font-medium">
            Hay modificaciones sin guardar en los textos ({activeLang.toUpperCase()})
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-brand-blush hover:bg-brand-cream text-brand-ink text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
          >
            {saving ? "Guardando..." : "Guardar Ahora"}
          </button>
        </div>
      )}

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
