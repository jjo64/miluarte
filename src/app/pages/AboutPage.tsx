import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, ArrowUpRight, Sparkles, FileText, Send, Palette, Box, Disc, Gem } from "lucide-react";
import { SharedFooter } from "../components/SharedFooter";
import { useLanguage } from "../context/LanguageContext";
import { ease, fadeUp, staggerContainer, staggerItem } from "../tokens";
import { getOptimizedImageUrl } from "../utils/cloudinary";

const vp = { once: true, margin: "-60px" } as const;

export function AboutPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    document.title = "Sobre Nerea Lucas Pajares | Miluartedenara";
    const desc = "Conoce a Nerea Lucas Pajares (Miluartedenara). Ilustradora, concept artist y escultora en Madrid y Barcelona. Trayectoria, serie Musae y filosofía creativa.";
    document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
    window.scrollTo(0, 0);
  }, []);

  const profileImg = t("aboutPhoto") || t("resumePhoto") || "https://res.cloudinary.com/doznr2qm4/image/upload/v1785683173/image_cv_nara_xb0v9d.png";
  const musaeArtwork = t("aboutMusaeImg") || "https://res.cloudinary.com/doznr2qm4/image/upload/v1781821775/musae_dkbruz.jpg";

  const disciplines = [
    {
      key: "musae",
      icon: Palette,
      title: t("about.disciplines.musae.title"),
      desc: t("about.disciplines.musae.desc"),
      link: "/coleccion/ilustracion",
    },
    {
      key: "concept",
      icon: Box,
      title: t("about.disciplines.concept.title"),
      desc: t("about.disciplines.concept.desc"),
      link: "/coleccion/concept-art",
    },
    {
      key: "clay",
      icon: Gem,
      title: t("about.disciplines.clay.title"),
      desc: t("about.disciplines.clay.desc"),
      link: "/coleccion/retratos",
    },
    {
      key: "music",
      icon: Disc,
      title: t("about.disciplines.music.title"),
      desc: t("about.disciplines.music.desc"),
      link: "/coleccion/diggin",
    },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-cream transition-colors duration-300">
      {/* Top spacing for fixed header */}
      <div className="pt-28 md:pt-36 pb-20 px-6 md:px-10 max-w-[1140px] mx-auto">

        {/* ── Back Navigation ── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease }}
          className="mb-10 md:mb-14"
        >
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 font-sans text-brand-cream/55 hover:text-brand-blush text-[11px] tracking-[0.2em] uppercase bg-transparent border-none cursor-pointer transition-colors duration-200"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-200" />
            {t("about.backHome")}
          </button>
        </motion.div>

        {/* ── Hero Profile Section ── */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center mb-24 md:mb-32">
          
          {/* Text / Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="flex flex-col"
          >
            <div className="inline-flex items-center gap-2.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-brand-blush animate-pulse" />
              <span className="font-sans text-brand-blush text-[10.5px] tracking-[0.32em] uppercase font-semibold">
                {t("about.eyebrow")}
              </span>
            </div>

            <h1 className="font-serif text-brand-cream text-[3rem] sm:text-[3.8rem] md:text-[4.6rem] font-light leading-[1.02] tracking-tight mb-4">
              Nerea Lucas <br />
              <span className="italic font-normal text-brand-blush">Pajares</span>
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <span className="font-sans text-[11px] tracking-[0.22em] uppercase bg-brand-cream/10 text-brand-cream/90 px-3.5 py-1.5 rounded-full border border-brand-cream/15">
                {t("about.artistTag")}
              </span>
              <span className="font-sans text-brand-cream/40 text-xs">•</span>
              <span className="font-sans text-brand-cream/70 text-xs tracking-wider">
                Madrid / Barcelona
              </span>
            </div>

            <p className="font-serif italic text-brand-wall text-[1.2rem] md:text-[1.45rem] font-light leading-relaxed mb-8 max-w-[540px]">
              {t("about.subtitle")}
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => navigate("/resume")}
                className="font-sans bg-brand-blush text-brand-ink hover:bg-brand-cream hover:text-brand-bg text-[10.5px] tracking-widest uppercase font-semibold py-3.5 px-6 rounded-lg cursor-pointer transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-brand-blush/20"
              >
                <FileText size={14} />
                {t("about.viewResume")}
              </button>

              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-booking-modal"))}
                className="font-sans text-brand-cream border border-brand-cream/20 hover:border-brand-blush hover:text-brand-blush text-[10.5px] tracking-widest uppercase py-3.5 px-6 rounded-lg cursor-pointer bg-brand-cream/5 hover:bg-brand-cream/10 transition-all duration-300 flex items-center gap-2"
              >
                <Send size={13} />
                {t("about.commissionBtn")}
              </button>
            </div>
          </motion.div>

          {/* Visual Showcase (Photo Only) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.25, ease }}
            className="relative"
          >
            {/* Primary Portrait Card */}
            <div className="relative rounded-2xl overflow-hidden border border-brand-cream/15 bg-brand-card shadow-2xl aspect-[4/5] max-w-[440px] mx-auto group">
              <img
                src={getOptimizedImageUrl(profileImg, 900)}
                alt="Nerea Lucas Pajares"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/90 via-transparent to-transparent opacity-80" />
              
              {/* Badge Overlay */}
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between p-3.5 rounded-xl bg-brand-bg/85 backdrop-blur-md border border-brand-cream/10">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-blush" />
                  <div>
                    <p className="font-serif text-sm text-brand-cream leading-none mb-1">Miluartedenara</p>
                    <p className="font-sans text-[10px] text-brand-cream/60 tracking-wider">Concept Art & Ilustración</p>
                  </div>
                </div>
                <span className="font-sans text-[10px] uppercase text-brand-blush tracking-widest font-semibold px-2 py-1 bg-brand-blush/10 rounded-md">
                  Artista
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Artistic Manifesto / Quote ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          className="relative my-20 md:my-28 p-8 md:p-14 rounded-2xl bg-gradient-to-br from-brand-cream/[0.04] to-brand-cream/[0.01] border border-brand-cream/10 text-center max-w-[900px] mx-auto overflow-hidden"
        >
          <div className="absolute -top-12 -left-12 w-36 h-36 bg-brand-blush/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-brand-blush/10 rounded-full blur-3xl pointer-events-none" />
          
          <Sparkles className="mx-auto mb-5 text-brand-blush/80" size={24} />
          <blockquote className="font-serif text-[1.4rem] sm:text-[1.8rem] md:text-[2.1rem] font-light leading-snug text-brand-cream max-w-[760px] mx-auto mb-4">
            {t("about.quote")}
          </blockquote>
          <cite className="font-sans text-[11px] tracking-[0.24em] uppercase text-brand-blush not-italic font-semibold">
            — Nerea Lucas Pajares
          </cite>
        </motion.section>

        {/* ── Biography & Story ── */}
        <section className="mb-24 md:mb-32">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.8fr] gap-10 md:gap-16 items-start">
            
            {/* Left sticky label */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={vp}
              className="md:sticky md:top-32"
            >
              <p className="font-sans text-brand-blush text-[10.5px] tracking-[0.3em] uppercase font-semibold mb-2">
                Historia & Pasión
              </p>
              <h2 className="font-serif text-brand-cream text-[2.2rem] md:text-[2.8rem] font-light leading-tight">
                {t("about.bioTitle")}
              </h2>
              <div className="w-12 h-0.5 bg-brand-blush mt-4 mb-6" />

              {/* Mini Highlights */}
              <div className="flex flex-col gap-3 font-sans text-xs text-brand-cream/70">
                <div className="flex items-center gap-2.5">
                  <span className="text-brand-blush">◆</span>
                  <span>{t("about.stats.master")}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-brand-blush">◆</span>
                  <span>{t("about.stats.focus")}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-brand-blush">◆</span>
                  <span>{t("about.stats.specialty")}</span>
                </div>
              </div>
            </motion.div>

            {/* Right text content */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={vp}
              className="flex flex-col gap-6 text-brand-cream/85 font-sans text-[15px] sm:text-[16px] leading-relaxed"
            >
              <motion.p variants={staggerItem} className="first-letter:text-4xl first-letter:font-serif first-letter:text-brand-blush first-letter:mr-2 first-letter:float-left">
                {t("about.bioP1")}
              </motion.p>

              <motion.p variants={staggerItem}>
                {t("about.bioP2")}
              </motion.p>

              <motion.p variants={staggerItem}>
                {t("about.bioP3")}
              </motion.p>

              {/* Secondary Artwork showcase */}
              <motion.div variants={staggerItem} className="mt-4 rounded-xl overflow-hidden border border-brand-cream/15 shadow-xl relative aspect-[16/9]">
                <img
                  src={getOptimizedImageUrl(musaeArtwork, 1000)}
                  alt="Serie Musae by Nerea Lucas Pajares"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <span className="font-serif italic text-brand-cream text-sm">Serie Musae · Expresión libre y firma de autor</span>
                  <button
                    onClick={() => navigate("/coleccion/ilustracion")}
                    className="font-sans text-[10px] tracking-wider uppercase text-brand-blush hover:text-brand-cream flex items-center gap-1 bg-brand-bg/70 px-3 py-1.5 rounded-md backdrop-blur-sm transition-colors cursor-pointer border-none"
                  >
                    Ver colección <ArrowUpRight size={12} />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── Creative Universes & Disciplines ── */}
        <section className="mb-24 md:mb-32">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            className="text-center max-w-xl mx-auto mb-14"
          >
            <p className="font-sans text-brand-blush text-[10px] tracking-[0.3em] uppercase font-semibold mb-2">
              Disciplinas
            </p>
            <h2 className="font-serif text-brand-cream text-[2.2rem] md:text-[3rem] font-light">
              {t("about.disciplinesTitle")}
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {disciplines.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.key}
                  variants={staggerItem}
                  onClick={() => navigate(item.link)}
                  className="group p-8 rounded-2xl bg-brand-cream/[0.03] hover:bg-brand-cream/[0.07] border border-brand-cream/10 hover:border-brand-blush/40 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-brand-blush/10 text-brand-blush flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-blush group-hover:text-brand-ink transition-all duration-300">
                        <Icon size={22} />
                      </div>
                      <ArrowUpRight size={18} className="text-brand-cream/30 group-hover:text-brand-blush group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>

                    <h3 className="font-serif text-brand-cream text-xl sm:text-2xl font-light mb-3">
                      {item.title}
                    </h3>

                    <p className="font-sans text-brand-cream/70 text-sm leading-relaxed mb-6">
                      {item.desc}
                    </p>
                  </div>

                  <span className="font-sans text-[10.5px] tracking-widest uppercase text-brand-blush font-medium flex items-center gap-1">
                    Explorar proyectos →
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* ── Call To Action / Contact banner ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          className="rounded-3xl p-8 sm:p-12 md:p-16 bg-gradient-to-r from-brand-card via-brand-bg to-brand-card border border-brand-cream/15 text-center relative overflow-hidden shadow-2xl"
        >
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="font-serif text-[2rem] sm:text-[2.6rem] md:text-[3.2rem] font-light text-brand-cream leading-tight mb-4">
              {t("about.contactPrompt")}
            </h2>
            <p className="font-sans text-brand-cream/70 text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
              Desde encargos editoriales, piezas en arcilla e ilustraciones a medida hasta concept art para producciones.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-booking-modal"))}
                className="font-sans bg-brand-blush hover:bg-brand-cream text-brand-ink text-[11px] tracking-widest uppercase font-semibold py-4 px-8 rounded-xl cursor-pointer transition-all duration-300 shadow-xl hover:shadow-brand-blush/25 border-none"
              >
                {t("about.commissionBtn")}
              </button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-contact-modal"))}
                className="font-sans text-brand-cream border border-brand-cream/25 hover:border-brand-cream text-[11px] tracking-widest uppercase font-medium py-4 px-8 rounded-xl cursor-pointer bg-brand-cream/5 hover:bg-brand-cream/10 transition-all duration-300"
              >
                {t("about.contactBtn")}
              </button>
            </div>
          </div>
        </motion.section>

      </div>

      <SharedFooter />
    </div>
  );
}
