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

  const getSkillEmoji = (skill: string) => {
    const s = skill.toLowerCase();
    if (s.includes("ilustra")) return "🎨";
    if (s.includes("concept") || s.includes("personaje") || s.includes("character") || s.includes("desarrollo")) return "🧠";
    if (s.includes("gráfi") || s.includes("graph")) return "📖";
    if (s.includes("musi") || s.includes("merch") || s.includes("musical")) return "🎵";
    if (s.includes("joye") || s.includes("clay") || s.includes("arcilla")) return "💍";
    return "✨";
  };

  return (
    <section className="relative min-h-screen bg-brand-bg flex items-center overflow-hidden pt-28 pb-16 md:py-24">
      {/* Content grid */}
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
            className="font-sans text-brand-cream/60 text-[13.5px] leading-relaxed mb-4 max-w-[480px]"
          >
            {t("hero.bio1")}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65, ease }}
            className="font-sans text-brand-cream/45 text-[13.5px] leading-relaxed mb-10 max-w-[480px]"
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

        {/* ── Right: Skills + framed artwork ── */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease }}
          className="flex flex-col justify-center gap-6 mt-8 md:mt-0 order-2"
        >
          {/* Skill tags */}
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="font-sans text-brand-cream/80 text-[11px] tracking-wide border border-brand-cream/15 py-2 px-3.5 rounded-full bg-brand-cream/5 flex items-center gap-2 transition-all duration-300 hover:border-brand-orange hover:text-brand-orange"
              >
                <span>{getSkillEmoji(skill)}</span>
                <span>{skill}</span>
              </span>
            ))}
          </div>

          {/* Framed Miluarte artwork */}
          <div className="relative rounded-lg overflow-hidden shadow-2xl aspect-[4/5] bg-brand-dark">
            <img
              src="https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/520988252_18317337157235254_3623552272738405742_n_xafgzp.jpg"
              alt={t("gallery.alts.obra3")}
              className="w-full h-full object-cover block"
            />
            {/* Small badge overlay */}
            <div className="absolute bottom-3.5 left-3.5 flex items-center gap-2 bg-[#180E09]/78 backdrop-blur-sm py-1.5 px-3 rounded-full border border-brand-cream/10 select-none pointer-events-none">
              <img
                src="https://res.cloudinary.com/doznr2qm4/image/upload/v1781812066/favicon_xih1kk.jpg"
                alt=""
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="font-sans text-brand-cream text-[9px] tracking-widest uppercase">
                Miluarte
              </span>
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

function FeaturedProject() {
  const { t } = useLanguage();

  return (
    <section className="bg-brand-dark py-24 px-6 md:px-10 border-t border-brand-cream/5" id="proyecto-destacado">
      <div className="max-w-[1200px] mx-auto">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: 0.5, ease }}
          className="flex gap-2.5 items-center mb-6"
        >
          <div className="w-8 h-0.5 bg-brand-orange" />
          <div className="w-2 h-0.5 bg-brand-orange opacity-35" />
          <span className="font-sans text-brand-orange text-[10px] tracking-[0.28em] uppercase">
            {t("featured.eyebrow")}
          </span>
        </motion.div>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={vp}
          transition={{ duration: 0.7, ease }}
          className="relative aspect-[16/8] overflow-hidden rounded-md shadow-2xl mb-12 group"
        >
          <span className="absolute top-4 left-4 z-10 bg-brand-orange text-brand-ink font-sans text-[10px] tracking-widest uppercase font-bold py-1.5 px-3.5 rounded-full shadow-md">
            {t("featured.tag")}
          </span>
          <img
            src="https://res.cloudinary.com/doznr2qm4/image/upload/v1781811479/Doke_Red_Flag_u1njsw.jpg"
            alt={t("gallery.alts.obra4")}
            className="w-full h-full object-cover brightness-[0.92] group-hover:scale-103 transition-transform duration-700 ease-out"
          />
        </motion.div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: 0.6, ease }}
          >
            <h2 className="font-serif text-brand-cream text-[1.8rem] md:text-[2.8rem] font-light leading-[1.1] tracking-tight mb-6">
              {t("featured.title")}
            </h2>
            <p className="font-sans text-brand-cream/58 text-[13.5px] leading-relaxed mb-8 max-w-[520px]">
              {t("featured.description")}
            </p>
            {/* Tags */}
            <div className="flex flex-wrap gap-2.5 mb-8">
              {((t("featured.tags") || []) as string[]).map((tag) => (
                <span
                  key={tag}
                  className="font-sans text-brand-orange text-[10.5px] tracking-wide py-1.5 px-3 rounded-full border border-brand-orange/45 bg-brand-orange/5"
                >
                  {tag}
                </span>
              ))}
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-booking-modal"))}
              className="font-sans text-brand-blush text-[10px] tracking-widest uppercase border border-brand-blush/45 py-3.5 px-6 hover:bg-brand-blush hover:text-brand-ink transition-all duration-300 font-medium cursor-pointer"
            >
              {t("featured.viewCase")}
            </button>
          </motion.div>

          {/* Checklist */}
          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: 0.6, delay: 0.15, ease }}
            className="list-none p-0 m-0 flex flex-col gap-3.5"
          >
            {((t("featured.bullets") || []) as string[]).map((bullet) => (
              <li
                key={bullet}
                className="font-sans text-brand-cream/60 text-[12.5px] flex gap-3 items-start"
              >
                <div className="w-1.5 h-1.5 bg-brand-orange rotate-45 flex-shrink-0 mt-2 opacity-70" />
                <span>{bullet}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}

function Clients() {
  const { t } = useLanguage();
  const clientNames = [
    "DIGGIN' RECORDS",
    "PASTA YA",
    "ESTUDIO NOVA",
    "GALERÍA LUMEN",
    "ANIMAS PROJECT",
    "COLECTIVO TINTA"
  ];

  return (
    <section className="bg-brand-bg py-20 px-6 md:px-10 text-center">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: 0.5, ease }}
          className="flex justify-center gap-2.5 items-center mb-6"
        >
          <div className="w-8 h-0.5 bg-brand-orange" />
          <div className="w-2 h-0.5 bg-brand-orange opacity-35" />
          <span className="font-sans text-brand-orange text-[10px] tracking-[0.28em] uppercase">
            {t("clients.eyebrow")}
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: 0.6, ease }}
          className="font-serif text-brand-cream text-[1.6rem] md:text-[2.2rem] font-light mb-4"
        >
          {t("clients.title")}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="font-sans text-brand-cream/45 text-[13px] leading-relaxed max-w-[560px] mx-auto mb-12"
        >
          {t("clients.description")}
        </motion.p>

        {/* Logos Grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: 0.65, delay: 0.2, ease }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {clientNames.map((name) => (
            <div
              key={name}
              className="border border-brand-cream/10 rounded-lg py-7 px-4 flex items-center justify-center font-serif text-[13.5px] tracking-wide text-brand-cream/45 hover:border-brand-orange/45 hover:text-brand-cream hover:bg-brand-cream/5 transition-all duration-300 select-none"
            >
              {name}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function SeoServices() {
  const { t } = useLanguage();
  const keys = ["editorial", "concept", "character", "music", "graphic", "clay"] as const;

  return (
    <section className="bg-brand-bg py-24 px-6 md:px-10 border-t border-brand-cream/5" id="servicios">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: 0.5, ease }}
          className="flex gap-2.5 items-center mb-6"
        >
          <div className="w-8 h-0.5 bg-brand-orange" />
          <div className="w-2 h-0.5 bg-brand-orange opacity-35" />
          <span className="font-sans text-brand-orange text-[10px] tracking-[0.28em] uppercase">
            {t("seoServices.eyebrow")}
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: 0.6, ease }}
          className="font-serif text-brand-cream text-[1.8rem] md:text-[2.6rem] font-light mb-4"
        >
          {t("seoServices.title")}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="font-sans text-brand-cream/55 text-[13.5px] leading-relaxed max-w-[600px] mb-12"
        >
          {t("seoServices.description")}
        </motion.p>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {keys.map((k, i) => (
            <motion.div
              key={k}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={vp}
              transition={{ duration: 0.65, delay: i * 0.05, ease }}
              className="flex flex-col items-start"
            >
              <div className="w-1.5 h-1.5 bg-brand-orange rounded-full mb-3" />
              <h3 className="font-serif text-brand-cream text-[18px] font-normal mb-2.5">
                {t(`seoServices.items.${k}.title`)}
              </h3>
              <p className="font-sans text-brand-cream/50 text-[12.5px] leading-relaxed">
                {t(`seoServices.items.${k}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
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
      <FeaturedProject />
      <Clients />
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
