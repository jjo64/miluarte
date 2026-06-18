import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ease } from "../tokens";
import { HorizontalGallery } from "../components/HorizontalGallery";
import { ServiceSections } from "../components/ServiceSections";
import { SketchSlider } from "../components/SketchSlider";
import { SharedFooter } from "../components/SharedFooter";
import { useLanguage } from "../context/LanguageContext";

const animasSketch = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781822593/Captura_de_pantalla_2026-06-19_004226_kbbzwm.png";
const animasFinal  = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781822579/Captura_de_pantalla_2026-06-19_004056_lpcimv.png";
const artPortraits = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/533637781_18320483821235254_4718922861619683556_n_ddrhz1.jpg";

const vp = { once: true, margin: "-70px" } as const;

// ─── Hero / Sobre mí ─────────────────────────────────────────────────────────

function Hero() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const skills = (t("hero.skills") || []) as string[];

  return (
    <section className="relative min-h-screen bg-brand-bg flex items-center overflow-hidden pt-24 md:pt-14">
      {/* Ghost background — artPortraits at very low opacity for texture */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <img
          src={artPortraits}
          alt=""
          className="absolute right-0 top-0 w-1/2 h-full object-cover opacity-6 blur-[3px]"
          style={{ objectPosition: "50% 12%" }}
        />
        <div 
          className="absolute inset-0" 
          style={{ background: "linear-gradient(to right, var(--color-brand-bg) 45%, rgba(23,18,15,0.6) 100%)" }} 
        />
      </div>

      {/* Content grid */}
      <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-10 md:gap-16 px-6 md:px-10 py-6 md:py-14 max-w-[1200px] mx-auto">
        
        {/* ── Left: Bio ── */}
        <div className="flex flex-col justify-center order-1">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease }}
            className="font-sans text-brand-blush text-[10px] tracking-[0.34em] uppercase mb-6"
          >
            {t("hero.tagline")}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 52 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.28, ease }}
            className="font-serif text-brand-cream text-[2.8rem] md:text-[5.8rem] leading-[0.95] font-light tracking-tight mb-9 whitespace-pre-line"
          >
            {t("hero.greetingBefore")}
            <em className="italic text-brand-blush">{t("hero.greetingItalic")}</em>
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.65, ease }}
            className="w-11 h-0.5 bg-brand-blush mb-7"
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.78, ease }}
            className="font-sans text-brand-cream/60 text-[13px] leading-relaxed mb-4"
          >
            {t("hero.bio1")}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9, ease }}
            className="font-sans text-brand-cream/45 text-[13px] leading-relaxed mb-12"
          >
            {t("hero.bio2")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.05, ease }}
            className="flex gap-3.5 items-center flex-wrap"
          >
            <button
              onClick={() => navigate("/coleccion/ilustracion")}
              className="font-sans bg-brand-blush text-brand-ink text-[10px] tracking-widest uppercase py-3.5 px-7 cursor-pointer font-medium hover:bg-brand-cream hover:text-brand-bg transition-colors duration-300"
            >
              {t("hero.viewWorks")}
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-booking-modal"))}
              className="font-sans text-brand-blush text-[10px] tracking-widest uppercase border border-brand-blush/45 py-3.5 px-6 cursor-pointer bg-transparent hover:bg-brand-blush hover:text-brand-ink transition-all duration-300"
            >
              {t("hero.sendInquiry")}
            </button>
          </motion.div>
        </div>

        {/* ── Right: Skills + framed artwork ── */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease }}
          className="flex flex-col justify-center gap-8 mt-8 md:mt-0 order-2"
        >
          {/* Skill tags */}
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="font-sans text-brand-blush text-[10px] tracking-wider border border-brand-blush/30 py-1.5 px-3.5 hover:border-brand-blush hover:bg-brand-blush/5 transition-all duration-300"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Framed Miluarte artwork */}
          <div className="border-[3px] border-brand-ink p-1 bg-brand-cream relative shadow-2xl group overflow-hidden">
            <div className="overflow-hidden">
              <img
                src="https://res.cloudinary.com/doznr2qm4/image/upload/v1781812066/favicon_xih1kk.jpg"
                alt="Miluarte — Nerea"
                className="w-full h-auto block transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-brand-ink py-1.5 px-4.5">
              <p className="font-sans text-brand-cream text-[9px] tracking-widest uppercase whitespace-nowrap">
                Miluarte
              </p>
            </div>
          </div>

          {/* Email */}
          <p className="font-sans text-brand-cream/30 text-[11px] tracking-wider">
            Miluartedenara@gmail.com
          </p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-7 right-10 flex flex-col items-center gap-2.5 opacity-30 z-10 hidden md:flex select-none">
        <span className="font-sans text-[9px] tracking-widest uppercase text-brand-cream [writing-mode:vertical-rl]">Scroll</span>
        <div className="w-[1px] h-12 bg-brand-cream" />
      </div>
    </section>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export function HomePage() {
  const { t } = useLanguage();
  return (
    <div className="bg-brand-bg text-brand-cream">
      <Hero />
      <HorizontalGallery />
      <SketchSlider
        sketchImg={animasSketch}
        finalImg={animasFinal}
        sketchImgPos="50% 17%"
        finalImgPos="50% 12%"
        title={t("process.title")}
        subtitle={t("process.subtitle")}
        hint={t("process.hint")}
      />
      <ServiceSections />
      <SharedFooter />
    </div>
  );
}
