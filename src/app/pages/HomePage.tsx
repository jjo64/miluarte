import { useState } from "react";
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

const animasSketch = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781822593/Captura_de_pantalla_2026-06-19_004226_kbbzwm.png";
const animasFinal  = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781822579/Captura_de_pantalla_2026-06-19_004056_lpcimv.png";

const vp = { once: true, margin: "-70px" } as const;

// ─── Hero / Sobre mí ─────────────────────────────────────────────────────────

function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen bg-brand-bg flex items-center overflow-hidden pt-28 pb-16 md:py-24">
      {/* Content grid — stacks on mobile, two-col on desktop */}
      <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-12 md:gap-16 px-6 md:px-10 max-w-[1200px] mx-auto">

        {/* ── Left: Bio ── */}
        <div className="flex flex-col justify-center order-1">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease }}
            className="font-sans text-brand-blush text-[10px] tracking-[0.34em] uppercase mb-4"
          >
            {t("hero.tagline")}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease }}
            className="font-serif text-brand-cream text-[2.6rem] md:text-[4.6rem] leading-[0.98] font-light tracking-tight mb-4 whitespace-pre-line"
          >
            {t("hero.greetingBefore")}
            <br />
            <em className="italic text-brand-blush">{t("hero.greetingItalic")}</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease }}
            className="font-serif italic text-brand-wall text-[1.15rem] md:text-[1.5rem] font-light leading-relaxed mb-6 max-w-[480px]"
          >
            {t("hero.artline")}
          </motion.p>

          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.45, ease }}
            className="w-11 h-0.5 bg-brand-blush mb-7"
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease }}
            className="font-sans text-brand-cream/80 text-[13.5px] leading-relaxed mb-4 max-w-[480px]"
          >
            {t("hero.bio1")}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65, ease }}
            className="font-sans text-brand-cream/70 text-[13.5px] leading-relaxed mb-10 max-w-[480px]"
          >
            {t("hero.bio2")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75, ease }}
            className="flex gap-3.5 items-center flex-wrap"
          >
            <button
              onClick={() => {
                const el = document.getElementById("galeria");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
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

        {/* ── Right: Framed artwork ── */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease }}
          className="flex flex-col justify-start mt-4 md:mt-0 order-2 gap-5"
        >
          {/* Framed Miluarte artwork */}
          <div className="relative rounded-lg overflow-hidden shadow-2xl aspect-[4/5] bg-brand-dark">
            <img
              src={getOptimizedImageUrl("https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/520988252_18317337157235254_3623552272738405742_n_xafgzp.jpg", 800)}
              alt={t("gallery.alts.obra3")}
              className="w-full h-full object-cover block"
              fetchPriority="high"
            />
            {/* Small badge overlay */}
            <div className="absolute bottom-3.5 left-3.5 flex items-center gap-2 bg-[#180E09]/78 backdrop-blur-sm py-1.5 px-3 rounded-full border border-white/10 select-none pointer-events-none">
              <img
                src={getOptimizedImageUrl("https://res.cloudinary.com/doznr2qm4/image/upload/v1781812066/favicon_xih1kk.jpg", 80)}
                alt=""
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="font-sans text-[#F5EDE0] text-[9px] tracking-widest uppercase">
                Miluarte
              </span>
            </div>
          </div>

          {/* Email */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-contact-modal"))}
            className="font-sans text-brand-cream/60 hover:text-brand-orange text-[11px] tracking-wider bg-transparent border-none p-0 cursor-pointer transition-colors duration-200 hover:underline block"
          >
            Miluartedenara@gmail.com
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-7 right-10 flex flex-col items-center gap-2.5 opacity-65 z-10 hidden md:flex select-none">
        <span className="font-sans text-[9px] tracking-widest uppercase text-brand-cream [writing-mode:vertical-rl]">Scroll</span>
        <div className="w-[1px] h-12 bg-brand-cream" />
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
          src={getOptimizedImageUrl("https://res.cloudinary.com/doznr2qm4/image/upload/v1781811479/Doke_Red_Flag_u1njsw.jpg", 1200)}
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
  return (
    <div style={{ backgroundColor: C.bg, color: C.cream }}>
      <Hero />
      <FeaturedProject />
      <ClientsMarquee />
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
      <SeoServices />
      <ServiceSections />
      <SharedFooter />
    </div>
  );
}
