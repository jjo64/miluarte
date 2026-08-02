import { useNavigate } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export function SharedFooter() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const handleOpenBooking = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-booking-modal"));
  };

  const workLinks = [
    { label: t("services.items.diseno-grafico.label") || "Diseño Gráfico", slug: "diseno-grafico" },
    { label: t("services.items.3d-stands.label") || "3D & Stands", slug: "3d-stands" },
    { label: "Diggin'", slug: "diggin" },
    { label: t("services.items.ilustracion.label") || "Ilustraciones", slug: "ilustracion" },
    { label: t("services.items.concept-art.label") || "Concept Art", slug: "concept-art" },
  ];

  return (
    <footer className="bg-brand-dark border-t border-brand-cream/10 pt-20 pb-12 px-6 md:px-10 overflow-hidden select-none">
      <div className="max-w-[1100px] mx-auto">
        
        {/* ── Top Section: Large CTA ── */}
        <div className="mb-20 group">
          <a
            href="#"
            onClick={handleOpenBooking}
            className="inline-block no-underline"
          >
            <p className="font-sans text-brand-orange text-[10px] tracking-[0.3em] uppercase mb-4 transition-transform duration-300 group-hover:translate-x-1">
              {language === "es" ? "¿Tienes un proyecto?" : "Have a project?"}
            </p>
            <h2 className="font-serif text-brand-cream text-[2.6rem] md:text-[4.8rem] font-light leading-[1.05] tracking-tight hover:text-brand-blush transition-colors duration-500 cursor-pointer flex flex-wrap items-center gap-x-6">
              <span>
                {language === "es" ? "¿Necesitas visualizar tu proyecto" : "Need to visualize your project"}
              </span>
              <span className="italic text-brand-blush font-light group-hover:text-brand-orange transition-colors duration-500 flex items-center gap-3">
                {language === "es" ? "antes de construirlo?" : "before building it?"}
                <ArrowUpRight className="w-8 h-8 md:w-14 md:h-14 stroke-[1] transition-transform duration-300 group-hover:translate-x-2 group-hover:-translate-y-2" />
              </span>
            </h2>
          </a>
        </div>

        {/* ── Middle Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-12 mb-16 pt-10 border-t border-brand-cream/5">
          
          {/* Col 1: Bio / Brand */}
          <div className="flex flex-col justify-between gap-6">
            <div>
              <p className="font-serif text-brand-cream text-2xl font-light tracking-wide mb-4">Miluarte</p>
              <p className="font-sans text-brand-cream/65 text-xs leading-relaxed max-w-[280px]">
                {t("footer.studio")}
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex flex-wrap gap-5">
              <a
                href="https://www.instagram.com/naraneko13/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-brand-cream/60 hover:text-brand-orange text-xs no-underline transition-colors duration-250 hover:underline"
              >
                Instagram
              </a>
              <a
                href="https://www.linkedin.com/in/nerealucaspajares4815162342/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-brand-cream/60 hover:text-brand-orange text-xs no-underline transition-colors duration-250 hover:underline"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <p className="font-sans text-brand-orange text-[9px] tracking-widest uppercase mb-6">
              {t("footer.work")}
            </p>
            <div className="flex flex-col gap-3.5 items-start">
              {workLinks.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/coleccion/${item.slug}`)}
                  className="font-sans text-brand-cream/65 hover:text-brand-cream text-xs bg-transparent border-none p-0 cursor-pointer transition-colors duration-200 hover:underline text-left"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Col 3: Contact details / CTA */}
          <div className="flex flex-col justify-between items-start gap-8">
            <div>
              <p className="font-sans text-brand-orange text-[9px] tracking-widest uppercase mb-6">
                {t("footer.contact")}
              </p>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-contact-modal"))}
                className="font-sans text-brand-cream/65 hover:text-brand-orange text-xs mb-1.5 bg-transparent border-none p-0 cursor-pointer transition-colors duration-200 hover:underline text-left block"
              >
                hola@miluartedenara.com
              </button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-contact-modal"))}
                className="font-sans text-brand-cream/60 hover:text-brand-orange text-[11px] bg-transparent border-none p-0 cursor-pointer transition-colors duration-200 hover:underline text-left block"
              >
                Miluartedenara@gmail.com
              </button>
            </div>

            <div className="flex flex-col gap-3.5 items-start">
              <button
                onClick={() => navigate("/resume")}
                className="font-sans text-brand-blush hover:text-brand-cream text-xs bg-transparent border-none p-0 cursor-pointer transition-colors duration-200 hover:underline text-left font-medium"
              >
                {language === "es" ? "Ver Currículum (CV) →" : "View Resume / CV →"}
              </button>
              
              <button
                onClick={handleOpenBooking}
                className="font-sans bg-brand-blush hover:bg-brand-cream text-brand-ink text-[10px] tracking-widest uppercase border-none py-3.5 px-6 rounded-lg cursor-pointer transition-colors duration-300 font-semibold shadow-lg"
              >
                {t("footer.budget")}
              </button>
            </div>
          </div>

        </div>

        {/* ── Bottom Strip ── */}
        <div className="border-t border-brand-cream/5 pt-8 flex flex-col md:flex-row justify-between gap-4 font-sans text-brand-cream/50 text-[10.5px]">
          <p>{t("footer.rights")}</p>
          <p className="flex items-center gap-1.5">
            <span>{t("footer.madeWithCriteria")}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
          </p>
        </div>

      </div>
    </footer>
  );
}
