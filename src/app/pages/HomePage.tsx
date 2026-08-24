import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { C, SERIF, SANS, ease, fadeUp, staggerContainer, staggerItem } from "../tokens";
import { HorizontalGallery } from "../components/HorizontalGallery";
import { ServiceSections } from "../components/ServiceSections";
import { SketchSlider } from "../components/SketchSlider";
import { SharedFooter } from "../components/SharedFooter";
import { useLanguage } from "../context/LanguageContext";
import { ClientsMarquee } from "../components/ClientsMarquee";
import { getOptimizedImageUrl } from "../utils/cloudinary";

const animasSketch = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781822593/Captura_de_pantalla_2026-06-19_004226_kbbzwm.png";
const animasFinal  = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781822579/Captura_de_pantalla_2026-06-19_004056_lpcimv.png";

const vp = { once: true, margin: "-70px" } as const;

// ─── Hero / Opción B: Showcase Interactivo de Pantalla Completa ──────────────

interface HeroSlide {
  id: string;
  image: string;
  tag: { es: string; en: string };
  title: { es: string; en: string };
  position?: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "destacada",
    image: "https://res.cloudinary.com/doznr2qm4/image/upload/v1787504381/miluarte/ilustracion/axtt8y6owprqrjralpyy.jpg",
    tag: { es: "Obra Destacada", en: "Featured Artwork" },
    title: { es: "Ilustración Digital & Detalle", en: "Digital Illustration & Detail" },
    position: "center 25%",
  },
  {
    id: "musae",
    image: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781821775/musae_dkbruz.jpg",
    tag: { es: "Serie Musae", en: "Musae Series" },
    title: { es: "Firma de Autor & Expresión Libre", en: "Signature Style & Free Expression" },
    position: "center 20%",
  },
  {
    id: "diggin",
    image: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811479/Doke_Red_Flag_u1njsw.jpg",
    tag: { es: "Diggin' Label", en: "Diggin' Label" },
    title: { es: "Dirección de Arte & Música", en: "Art Direction & Music" },
    position: "center 30%",
  },
  {
    id: "animas",
    image: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820062/1_Melisa_Completo_nwlyro.jpg",
    tag: { es: "Universo Animas", en: "Animas Universe" },
    title: { es: "Concept Art & Worldbuilding", en: "Concept Art & Worldbuilding" },
    position: "center 35%",
  },
];

function Hero() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const active = HERO_SLIDES[currentSlide];

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <section 
      className="relative min-h-screen w-full flex items-end overflow-hidden pb-16 md:pb-24 pt-32 bg-brand-bg select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* ── Background Image Crossfade ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={active.id}
            src={getOptimizedImageUrl(active.image, 1920)}
            alt={active.title[language as "es" | "en"] || "Miluarte Art"}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: active.position || "center center" }}
            fetchPriority="high"
          />
        </AnimatePresence>

        {/* Cinematic contrast gradients for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/70 to-brand-bg/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-bg/95 via-brand-bg/45 to-transparent hidden md:block" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* ── Content Foreground ── */}
      <div className="relative z-10 w-full max-w-[1240px] mx-auto px-6 md:px-12 flex flex-col justify-end">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-end">
          
          {/* Left: Bio / Welcome & CTAs */}
          <div className="max-w-[640px]">
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease }}
              className="flex items-center gap-3 mb-4"
            >
              <span className="w-2 h-2 rounded-full bg-brand-blush animate-pulse" />
              <p className="font-sans text-brand-blush text-[10.5px] md:text-[11.5px] tracking-[0.32em] uppercase font-semibold">
                {t("hero.tagline")}
              </p>
            </motion.div>

            {/* Heading: Hola, soy Nerea */}
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.25, ease }}
              className="font-serif text-brand-cream text-[3.2rem] sm:text-[4.4rem] md:text-[5.2rem] leading-[0.95] font-light tracking-tight mb-5 whitespace-pre-line drop-shadow-md"
            >
              {t("hero.greetingBefore")}
              <br />
              <em className="italic font-normal text-brand-blush">{t("hero.greetingItalic")}</em>
            </motion.h1>

            {/* Artline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.35, ease }}
              className="font-serif italic text-brand-cream/90 text-[1.25rem] sm:text-[1.5rem] md:text-[1.7rem] font-light leading-snug mb-8 max-w-[540px] drop-shadow"
            >
              {t("hero.artline")}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.45, ease }}
              className="flex flex-wrap items-center gap-3.5 sm:gap-4"
            >
              <button
                onClick={() => {
                  const el = document.getElementById("proyecto-destacado") || document.getElementById("galeria");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="font-sans bg-brand-blush hover:bg-brand-cream text-brand-ink text-[11px] tracking-widest uppercase font-semibold py-4 px-8 rounded-lg cursor-pointer transition-all duration-300 shadow-xl hover:shadow-brand-blush/25 border-none"
              >
                {t("hero.exploreWorks") || t("hero.viewWorks")} ↓
              </button>

              <button
                onClick={() => navigate("/sobre-mi")}
                className="font-sans text-brand-cream border border-brand-cream/35 hover:border-brand-blush hover:text-brand-blush text-[11px] tracking-widest uppercase font-medium py-4 px-7 rounded-lg cursor-pointer bg-brand-bg/50 hover:bg-brand-bg/80 backdrop-blur-md transition-all duration-300"
              >
                {t("hero.aboutNerea") || "Sobre mí"} →
              </button>
            </motion.div>
          </div>

          {/* Right: Interactive Artwork Showcase Controller */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease }}
            className="flex flex-col gap-4 lg:items-end"
          >
            {/* Active piece badge card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-brand-bg/80 backdrop-blur-md border border-brand-cream/15 max-w-[380px] w-full shadow-2xl">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="font-sans text-[10px] tracking-[0.24em] uppercase text-brand-blush font-semibold flex items-center gap-1.5">
                  <Sparkles size={12} />
                  {active.tag[language as "es" | "en"]}
                </span>
                <span className="font-sans text-[11px] tracking-wider text-brand-cream/60 font-mono">
                  0{currentSlide + 1} / 0{HERO_SLIDES.length}
                </span>
              </div>

              <p className="font-serif text-brand-cream text-base sm:text-lg font-light leading-snug mb-3">
                {active.title[language as "es" | "en"]}
              </p>

              {/* Slide thumbnail navigation pills */}
              <div className="flex items-center gap-2 pt-2 border-t border-brand-cream/10">
                {HERO_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(idx)}
                    className={`relative flex-1 h-2 rounded-full cursor-pointer transition-all duration-300 border-none p-0 overflow-hidden ${
                      idx === currentSlide
                        ? "bg-brand-blush shadow-sm shadow-brand-blush/50"
                        : "bg-brand-cream/20 hover:bg-brand-cream/40"
                    }`}
                    aria-label={`Ver obra ${idx + 1}`}
                  >
                    {idx === currentSlide && (
                      <motion.div
                        layoutId="activeSlideIndicator"
                        className="w-full h-full bg-brand-blush"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </button>
                ))}

                {/* Arrow Controls */}
                <div className="flex items-center gap-1 pl-2 ml-1">
                  <button
                    onClick={handlePrev}
                    aria-label="Obra anterior"
                    className="w-7 h-7 rounded-lg bg-brand-cream/10 hover:bg-brand-cream/20 text-brand-cream flex items-center justify-center cursor-pointer transition-colors border-none p-0"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Obra siguiente"
                    className="w-7 h-7 rounded-lg bg-brand-cream/10 hover:bg-brand-cream/20 text-brand-cream flex items-center justify-center cursor-pointer transition-colors border-none p-0"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-50 z-10 select-none animate-bounce">
        <span className="font-sans text-[9px] tracking-[0.25em] uppercase text-brand-cream">Scroll</span>
        <div className="w-[1px] h-5 bg-brand-cream" />
      </div>
    </section>
  );
}

// ─── Proyecto destacado ──────────────────────────────────────────────────────

function FeaturedProject() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [btnH, setBtnH]     = useState(false);
  const [imgTap, setImgTap] = useState(false);

  return (
    <section style={{ backgroundColor: C.dark, padding: "80px 0", borderTop: "1px solid rgba(255,255,255,0.05)" }} id="proyecto-destacado">
      {/* Label */}
      <motion.p
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
        style={{ fontFamily: SANS, color: C.blush, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "0 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}
      >
        <span style={{ width: 2, height: 16, backgroundColor: C.blush, display: "inline-block" }} />
        {t("featured.eyebrow")}
      </motion.p>

      {/* Featured Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={vp}
        transition={{ duration: 0.7, ease }}
        style={{ position: "relative", overflow: "hidden", marginBottom: 0 }}
        onMouseEnter={() => setImgTap(true)}
        onMouseLeave={() => setImgTap(false)}
        onTouchStart={() => setImgTap(true)}
        onTouchEnd={() => setImgTap(false)}
      >
        <img
          src={getOptimizedImageUrl(t("featured.image") || "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811479/Doke_Red_Flag_u1njsw.jpg", 1200)}
          alt={t("gallery.alts.obra4")}
          loading="lazy"
          style={{
            width:          "100%",
            height:         "clamp(220px, 45vw, 480px)",
            objectFit:      "cover",
            objectPosition: "50% 14%",
            display:        "block",
            transform:      imgTap ? "scale(1.02)" : "scale(1)",
            transition:     "transform 0.6s cubic-bezier(0.22,1,0.36,1)",
            willChange:     "transform",
          }}
        />
        <span style={{ position: "absolute", top: 12, left: 12, backgroundColor: C.blush, color: C.ink, fontFamily: SANS, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 10px", borderRadius: 6 }}>
          {t("featured.tag")}
        </span>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: `linear-gradient(to top, ${C.dark}, transparent)` }} />
      </motion.div>

      {/* Content block */}
      <div style={{ padding: "32px 20px 0", maxWidth: 640, margin: "0 auto" }}>
        <motion.h2
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
          style={{ fontFamily: SERIF, color: C.cream, fontSize: "clamp(1.5rem, 5vw, 2rem)", fontWeight: 400, lineHeight: 1.2, marginBottom: 16 }}
        >
          {t("featured.title")}
        </motion.h2>

        <motion.p
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
          style={{ fontFamily: SANS, color: C.secondary, fontSize: "14px", lineHeight: 1.7, marginBottom: 20 }}
        >
          {t("featured.description")}
        </motion.p>

        {/* Bullets */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={vp}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}
        >
          {((t("featured.bullets") || []) as string[]).map((b) => (
            <motion.div
              key={b}
              variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease } } }}
              style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
            >
              <span style={{ color: C.blush, fontSize: "12px", marginTop: 2, flexShrink: 0 }}>◆</span>
              <span style={{ fontFamily: SANS, color: C.cream, fontSize: "13px", lineHeight: 1.55 }}>{b}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Category tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          {((t("featured.tags") || []) as string[]).map((tag) => (
            <span
              key={tag}
              style={{ fontFamily: SANS, color: C.blush, fontSize: "12px", border: `1px solid ${C.blush}`, borderRadius: "999px", padding: "6px 14px", letterSpacing: "0.04em" }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA button */}
        <motion.button
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
          onClick={() => navigate("/coleccion/diggin")}
          onMouseEnter={() => setBtnH(true)}
          onMouseLeave={() => setBtnH(false)}
          style={{
            width:           "100%",
            fontFamily:      SANS,
            color:           btnH ? "#fff" : C.cream,
            backgroundColor: btnH ? C.blush : "transparent",
            fontSize:        "11px",
            letterSpacing:   "0.2em",
            textTransform:   "uppercase",
            border:          `1px solid ${C.cream}`,
            borderRadius:    8,
            padding:         "14px 24px",
            cursor:          "pointer",
            transition:      "background-color 0.28s, color 0.28s",
            fontWeight:      500,
          }}
        >
          {t("featured.viewCase")}
        </motion.button>
      </div>
    </section>
  );
}

// ─── SeoServices (ServicesOverview style adaptation) ──────────────────────────

function SeoServices() {
  const { t } = useLanguage();
  const keys = ["editorial", "concept", "character", "music", "graphic", "clay"] as const;

  const getServiceIcon = (key: string) => {
    switch (key) {
      case "editorial": return "✏️";
      case "concept":   return "🎭";
      case "character": return "🧍";
      case "music":     return "🎵";
      case "graphic":   return "📐";
      case "clay":      return "💎";
      default:          return "✨";
    }
  };

  return (
    <section style={{ backgroundColor: C.cardBg, padding: "80px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }} id="servicios">
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <motion.p
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
          style={{ fontFamily: SANS, color: C.blush, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}
        >
          <span style={{ width: 2, height: 16, backgroundColor: C.blush, display: "inline-block" }} />
          {t("seoServices.eyebrow")}
        </motion.p>

        <motion.h2
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
          style={{ fontFamily: SERIF, color: C.cream, fontSize: "clamp(1.8rem, 6vw, 2.8rem)", fontWeight: 400, lineHeight: 1.15, marginBottom: 12 }}
        >
          {t("seoServices.title")}
        </motion.h2>

        <motion.p
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
          style={{ fontFamily: SANS, color: C.secondary, fontSize: "14px", lineHeight: 1.7, marginBottom: 48 }}
        >
          {t("seoServices.description")}
        </motion.p>

        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={vp}
          style={{
            display:               "grid",
            gridTemplateColumns:   "repeat(auto-fill, minmax(260px, 1fr))",
            gap:                   0,
          }}
        >
          {keys.map((k) => (
            <motion.div
              key={k}
              variants={staggerItem}
              style={{
                borderTop:     "1px solid rgba(255,255,255,0.08)",
                paddingTop:    24,
                paddingBottom: 24,
                paddingRight:  16,
              }}
            >
              <span style={{ color: C.blush, fontSize: "11px" }}>◆</span>
              <p style={{ fontFamily: SANS, color: C.cream, fontSize: "15px", fontWeight: 500, marginTop: 8, marginBottom: 8 }}>
                {t(`seoServices.items.${k}.title`)}
              </p>
              <p style={{ fontFamily: SANS, color: C.secondary, fontSize: "13px", lineHeight: 1.65 }}>
                {t(`seoServices.items.${k}.description`)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export function HomePage() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = "Miluartedenara | Portafolio de Nerea Lucas Pajares";
    const desc = "Estudio creativo y portafolio artístico de Nerea Lucas Pajares (Miluartedenara). Ilustración, diseño, modelado en arcilla, joyería artesanal y concept art en Madrid y Barcelona.";
    document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
  }, []);

  return (
    <div style={{ backgroundColor: C.bg, color: C.cream }}>
      <Hero />
      <FeaturedProject />
      <ClientsMarquee />
      <HorizontalGallery />
      <SketchSlider
        sketchImg={t("process.sketchImg") || animasSketch}
        finalImg={t("process.finalImg") || animasFinal}
        sketchImgPos="50% 17%"
        finalImgPos="50% 12%"
        title={t("process.title")}
        subtitle={t("process.subtitle")}
        hint={t("process.hint")}
      />
      <SeoServices />
      <ServiceSections />
      <SharedFooter />
    </div>
  );
}
