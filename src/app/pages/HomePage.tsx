import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { C, SERIF, SANS, ease, fadeUp, staggerContainer, staggerItem } from "../tokens";
import { HorizontalGallery } from "../components/HorizontalGallery";
import { ServiceSections } from "../components/ServiceSections";
import { SketchSlider } from "../components/SketchSlider";
import { SharedFooter } from "../components/SharedFooter";
import { useLanguage } from "../context/LanguageContext";
import { ClientsMarquee } from "../components/ClientsMarquee";
import { getOptimizedImageUrl } from "../utils/cloudinary";

const animasSketch = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781822593/miluarte/archivo/Captura_de_pantalla_2026-06-19_004226_kbbzwm.png";
const animasFinal  = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781822579/miluarte/archivo/Captura_de_pantalla_2026-06-19_004056_lpcimv.png";

const vp = { once: true, margin: "-70px" } as const;

// ─── Hero / Full-Screen Art Showcase ─────────────────────────────────────────

function Hero() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const heroBgImage = t("hero.image") || "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/axtt8y6owprqrjralpyy.jpg";

  return (
    <section className="relative min-h-screen w-full flex items-end overflow-hidden pb-16 md:pb-24 pt-32 bg-brand-bg">
      {/* ── Background Artwork Full-Screen ── */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <motion.img
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          src={getOptimizedImageUrl(heroBgImage, 1920)}
          alt="Miluartedenara Art Showcase"
          className="w-full h-full object-cover object-[center_30%] md:object-[center_25%]"
          fetchPriority="high"
        />

        {/* Cinematic atmospheric overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/65 to-brand-bg/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-bg/90 via-brand-bg/40 to-transparent hidden md:block" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* ── Content Foreground ── */}
      <div className="relative z-10 w-full max-w-[1240px] mx-auto px-6 md:px-12 flex flex-col justify-end">
        <div className="max-w-[680px]">
          {/* Eyebrow / Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
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
            transition={{ duration: 0.85, delay: 0.3, ease }}
            className="font-serif text-brand-cream text-[3.2rem] sm:text-[4.4rem] md:text-[5.4rem] leading-[0.95] font-light tracking-tight mb-5 whitespace-pre-line drop-shadow-md"
          >
            {t("hero.greetingBefore")}
            <br />
            <em className="italic font-normal text-brand-blush">{t("hero.greetingItalic")}</em>
          </motion.h1>

          {/* Artline / Slogan */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.45, ease }}
            className="font-serif italic text-brand-cream/90 text-[1.25rem] sm:text-[1.5rem] md:text-[1.75rem] font-light leading-snug mb-8 max-w-[560px] drop-shadow"
          >
            {t("hero.artline")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.55, ease }}
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
      </div>

      {/* Artwork signature badge (bottom-right desktop) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="absolute bottom-8 right-10 hidden lg:flex items-center gap-3 bg-brand-bg/75 backdrop-blur-md py-2 px-4 rounded-full border border-white/10 select-none pointer-events-none z-10"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-brand-blush" />
        <span className="font-serif italic text-brand-cream/80 text-xs tracking-wider">
          Miluartedenara · Portfolio Artístico
        </span>
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 z-10 select-none animate-bounce">
        <span className="font-sans text-[9px] tracking-[0.25em] uppercase text-brand-cream">Scroll</span>
        <div className="w-[1px] h-6 bg-brand-cream" />
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
          src={getOptimizedImageUrl(t("featured.image") || "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811479/miluarte/renders/Doke_Red_Flag_u1njsw.jpg", 1200)}
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
