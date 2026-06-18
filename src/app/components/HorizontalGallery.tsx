import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ease } from "../tokens";

gsap.registerPlugin(ScrollTrigger);

const IMAGES = [
  {
    src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/532613326_18320483857235254_170206825296032194_n_mcewf6.jpg",
    alt: "Obra 01",
  },
  {
    src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/533637781_18320483821235254_4718922861619683556_n_ddrhz1.jpg",
    alt: "Obra 02",
  },
  {
    src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/520988252_18317337157235254_3623552272738405742_n_xafgzp.jpg",
    alt: "Obra 03",
  },
  {
    src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/624072385_18076991993069555_3759238577248943847_n_zjw6f8.jpg",
    alt: "Obra 04",
  },
  {
    src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/656284366_18086356694211172_1538926504198666834_n_gwvwyk.webp",
    alt: "Obra 05",
  },
  {
    src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781798241/656747786_18083218367600656_3599812440241416906_n_f8npa1.jpg",
    alt: "Obra 06",
  },
  {
    src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781798241/719099666_18085459703434740_3604615127722183027_n_apifn2.jpg",
    alt: "Obra 07",
  },
  {
    src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781798273/Captura_de_pantalla_2026-06-18_175704_agpitt.png",
    alt: "Obra 08",
  },
];

function GalleryCard({ src, alt, index }: { src: string; alt: string; index: number }) {
  const [hovered, setHovered] = useState(false);
  const num = String(index + 1).padStart(2, "0");

  return (
    <div
      className="flex-shrink-0 w-[80vw] md:w-[32vw] px-2.5 box-content"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden aspect-square">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`w-full h-full object-cover block transition-all duration-700 ease-[cubic-bezier(0.22, 1, 0.36, 1)] ${
            hovered ? "scale-106 brightness-75" : "brightness-90"
          }`}
        />
        {/* Number tag */}
        <div
          className={`absolute top-4 left-4 font-sans text-brand-cream text-[10px] tracking-widest transition-opacity duration-350 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {num}
        </div>
        {/* Orange corner accent on hover */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-brand-orange transition-all duration-400 ease-[cubic-bezier(0.22, 1, 0.36, 1)]"
          style={{ height: hovered ? 3 : 0 }}
        />
      </div>
    </div>
  );
}

export function HorizontalGallery() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stripRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const strip   = stripRef.current;
    if (!wrapper || !strip) return;

    // Wait one frame so DOM measurements are stable
    const raf = requestAnimationFrame(() => {
      const ctx = gsap.context(() => {
        const getStripWidth   = () => strip.scrollWidth;
        const getScrollLength = () => strip.scrollWidth - window.innerWidth;

        gsap.to(strip, {
          scrollTrigger: {
            trigger: wrapper,
            pin: wrapper,
            scrub: 1.5,
            start: "center center",
            end: () => `+=${getStripWidth()}`,
            invalidateOnRefresh: true,
          },
          x: () => -getScrollLength(),
          ease: "none",
        });
      }, wrapper);

      // Store ctx on the element for cleanup
      (wrapper as any)._gsapCtx = ctx;
    });

    return () => {
      cancelAnimationFrame(raf);
      const ctx = (wrapper as any)?._gsapCtx;
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <section className="bg-brand-dark overflow-hidden">

      {/* ── Section header (not pinned) ── */}
      <div className="py-11 px-10 pb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease }}
            className="flex gap-2.5 items-center mb-4.5"
          >
            <div className="w-8 h-0.5 bg-brand-orange" />
            <div className="w-2 h-0.5 bg-brand-orange opacity-35" />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="font-serif text-brand-cream text-[2rem] md:text-[3rem] font-light tracking-tight"
          >
            Galería
          </motion.h2>
        </div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="font-sans text-brand-cream/35 text-xs leading-relaxed max-w-[240px] text-left md:text-right"
        >
          Obras recientes.<br />
          Desplázate para explorar.
        </motion.p>
      </div>

      {/* ── Pinned horizontal strip ── */}
      <div
        ref={wrapperRef}
        className="overflow-hidden h-[75vh] flex items-center"
      >
        <div
          ref={stripRef}
          className="flex flex-nowrap items-center will-change-transform px-[5vw]"
        >
          {IMAGES.map((img, i) => (
            <GalleryCard key={i} src={img.src} alt={img.alt} index={i} />
          ))}
        </div>
      </div>

      {/* ── Drag hint ── */}
      <div className="py-5 px-10 pb-16 flex justify-end">
        <p className="font-sans text-brand-cream/20 text-[10px] tracking-widest uppercase">
          ↔ scroll to navigate
        </p>
      </div>
    </section>
  );
}

// Fade up helper
const fadeUp = {
  hidden:  { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
};
