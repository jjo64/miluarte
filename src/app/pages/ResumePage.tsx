import { useEffect } from "react";
import { useNavigate } from "react-router";
import { SharedFooter } from "../components/SharedFooter";
import { motion } from "motion/react";
import { ArrowLeft, Printer, Mail, Instagram, Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { ease, fadeUp, staggerContainer, staggerItem } from "../tokens";
import { getOptimizedImageUrl } from "../utils/cloudinary";

export function ResumePage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  useEffect(() => {
    document.title = "Currículum Vitae (CV) | Nerea Lucas Pajares";
    const desc = "Currículum académico y trayectoria profesional de Nerea Lucas Pajares (Miluartedenara). Artista visual, diseñadora 3D e ilustradora.";
    document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Typecast or read list structure from translation helper
  const experienceItems = t("resume.experienceItems") || [];
  const educationItems = t("resume.educationItems") || [];
  const languagesItems = t("resume.languagesItems") || [];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-cream print:bg-white print:text-neutral-900">
      
      {/* ── Print Styles Override ── */}
      <style>{`
        @media print {
          nav, 
          footer,
          .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: #1a1a1a !important;
          }
          .print-container {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          .print-text-dark {
            color: #111111 !important;
          }
          .print-text-muted {
            color: #555555 !important;
          }
          .print-border {
            border-color: #dddddd !important;
          }
          .print-bullet {
            background-color: #111111 !important;
          }
        }
      `}</style>

      <div className="max-w-[920px] mx-auto print-container pt-28 pb-20 px-6 md:px-10 print:pt-0 print:pb-0">
        
        {/* ── Navigation & Actions (Hidden during print) ── */}
        <div className="flex justify-between items-center mb-12 no-print">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 font-sans text-brand-cream/50 hover:text-brand-cream text-[10px] tracking-widest uppercase bg-transparent border-none cursor-pointer transition-colors duration-200"
          >
            <ArrowLeft size={14} /> {t("resume.back")}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 font-sans bg-brand-blush hover:bg-brand-cream text-brand-ink text-[10px] tracking-widest uppercase border-none py-2.5 px-5 rounded-lg cursor-pointer transition-colors duration-300 font-medium shadow-md"
          >
            <Printer size={13} /> {t("resume.downloadPDF")}
          </button>
        </div>

        {/* ── Header / Intro ── */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="border-b border-brand-cream/15 pb-9 mb-10 print-border print:pb-6 print:mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 items-end">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <img
                src={getOptimizedImageUrl(t("resumePhoto") || "https://res.cloudinary.com/doznr2qm4/image/upload/v1785683173/image_cv_nara_xb0v9d.png", 300)}
                alt="Nerea Lucas Pajares"
                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border border-brand-cream/15 shadow-sm shrink-0 print:w-20 print:h-20"
              />
              <div>
                <h1 className="font-serif text-[2.5rem] md:text-[3.2rem] font-light leading-[1.05] tracking-tight mb-3 print-text-dark print:text-[2rem]">
                  Nerea Lucas Pajares
                </h1>
                <p className="font-sans text-brand-blush text-[12px] md:text-[13px] tracking-[0.2em] uppercase font-medium print-text-dark print:tracking-[0.15em] print:text-[11px]">
                  {t("resume.subtitle")}
                </p>
              </div>
            </div>
            
            {/* Contact Details Grid */}
            <div className="flex flex-col gap-2 font-sans text-brand-cream/60 text-xs md:items-end print-text-muted print:text-[10px] print:gap-1">
              <a 
                href="mailto:Miluartedenara@gmail.com" 
                onClick={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent("open-contact-modal"));
                }}
                className="flex items-center gap-2 hover:text-brand-orange no-underline transition-colors duration-200 cursor-pointer"
              >
                <Mail size={12} className="text-brand-blush print-text-dark" /> Miluartedenara@gmail.com
              </a>
              <a href="https://www.instagram.com/naraneko13/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-brand-orange no-underline transition-colors duration-200">
                <Instagram size={12} className="text-brand-blush print-text-dark" /> @naraneko13
              </a>
              <span className="flex items-center gap-2">
                <Globe size={12} className="text-brand-blush print-text-dark" /> miluartedenara.com
              </span>
            </div>
          </div>
        </motion.header>

        {/* ── Main content grid ── */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-[1.7fr_1fr] gap-10 md:gap-14 print:grid-cols-[1.7fr_1fr] print:gap-8"
        >
          {/* Left Column (Profile & Experience) */}
          <div className="flex flex-col gap-10 print:gap-8">
            {/* About / Profile */}
            <motion.section variants={staggerItem}>
              <h2 className="font-serif text-brand-blush text-xl font-light italic tracking-wide mb-4 print-text-dark print:text-[15px] print:not-italic print:font-bold">
                {t("resume.sections.profile")}
              </h2>
              <p className="font-sans text-brand-cream/70 text-[13px] leading-relaxed print-text-muted print:text-[11px]">
                {t("resume.profileText")}
              </p>
            </motion.section>

            {/* Experience */}
            <motion.section variants={staggerItem}>
              <h2 className="font-serif text-brand-blush text-xl font-light italic tracking-wide mb-6 print-text-dark print:text-[15px] print:not-italic print:font-bold print:mb-4">
                {t("resume.sections.experience")}
              </h2>
              
              <div className="flex flex-col gap-8 print:gap-5">
                {Array.isArray(experienceItems) && experienceItems.map((item: any, index: number) => (
                  <div key={index} className="group relative">
                    <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                      <h3 className="font-sans text-brand-cream text-[13.5px] font-semibold tracking-wide print-text-dark print:text-[11.5px]">
                        {item.role}
                      </h3>
                      <span className="font-sans text-brand-blush text-[11px] tracking-wider font-medium shrink-0 print-text-dark print:text-[10px]">
                        {item.period}
                      </span>
                    </div>
                    <p className="font-sans text-brand-cream/45 text-[11px] tracking-wider uppercase mb-3 print-text-muted print:text-[10px] print:mb-1">
                      {item.company}
                    </p>
                    <p className="font-sans text-brand-cream/60 text-[12.5px] leading-relaxed print-text-muted print:text-[10.5px]">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Right Column (Education, Skills & Languages) */}
          <div className="flex flex-col gap-10 print:gap-8">
            {/* Education */}
            <motion.section variants={staggerItem}>
              <h2 className="font-serif text-brand-blush text-xl font-light italic tracking-wide mb-6 print-text-dark print:text-[15px] print:not-italic print:font-bold print:mb-4">
                {t("resume.sections.education")}
              </h2>
              
              <div className="flex flex-col gap-6 print:gap-4">
                {Array.isArray(educationItems) && educationItems.map((item: any, index: number) => (
                  <div key={index}>
                    <h3 className="font-sans text-brand-cream text-[13px] font-semibold mb-1 print-text-dark print:text-[11px]">
                      {item.degree}
                    </h3>
                    <p className="font-sans text-brand-cream/50 text-[11px] print-text-muted print:text-[10px] mb-1.5">
                      {item.school}
                    </p>
                    <p className="font-sans text-brand-blush text-[10.5px] tracking-wider print-text-muted print:text-[9.5px]">
                      {item.period}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Skills */}
            <motion.section variants={staggerItem}>
              <h2 className="font-serif text-brand-blush text-xl font-light italic tracking-wide mb-6 print-text-dark print:text-[15px] print:not-italic print:font-bold print:mb-4">
                {t("resume.sections.skills")}
              </h2>
              
              <div className="flex flex-col gap-4 font-sans text-[12px] leading-relaxed print-text-muted print:text-[10.5px]">
                <div>
                  <span className="font-semibold text-brand-cream print-text-dark block mb-1">
                    {language === "es" ? "Herramientas Digitales" : "Digital Tools"}
                  </span>
                  <p className="text-brand-cream/65 print-text-muted">
                    {t("resume.skillsItems.digital")}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-brand-cream print-text-dark block mb-1">
                    {language === "es" ? "Técnicas Tradicionales" : "Traditional Techniques"}
                  </span>
                  <p className="text-brand-cream/65 print-text-muted">
                    {t("resume.skillsItems.traditional")}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-brand-cream print-text-dark block mb-1">
                    {language === "es" ? "Dirección & Concepto" : "Concept & Direction"}
                  </span>
                  <p className="text-brand-cream/65 print-text-muted">
                    {t("resume.skillsItems.creative")}
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Languages */}
            <motion.section variants={staggerItem}>
              <h2 className="font-serif text-brand-blush text-xl font-light italic tracking-wide mb-6 print-text-dark print:text-[15px] print:not-italic print:font-bold print:mb-4">
                {t("resume.sections.languages")}
              </h2>
              
              <div className="flex flex-col gap-3.5 print:gap-2">
                {Array.isArray(languagesItems) && languagesItems.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center font-sans text-xs">
                    <span className="font-semibold text-brand-cream print-text-dark print:text-[10.5px]">
                      {item.language}
                    </span>
                    <span className="text-brand-blush font-medium print-text-muted print:text-[10px]">
                      {item.level}
                    </span>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>
        </motion.div>
      </div>
      <SharedFooter />
    </div>
  );
}
