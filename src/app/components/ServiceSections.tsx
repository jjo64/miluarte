import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ease, staggerContainer, staggerItem } from "../tokens";

import artDiggin    from "../../assets/diggin-cover.png";
import artMusae     from "../../assets/musae-series.png";
import artPortraits from "../../assets/portrait-deriva.png";
import artFireGirl  from "../../assets/fire-girl.png";

gsap.registerPlugin(ScrollTrigger);

// Placeholder images for 3D before/after — using high quality unsplash art renders
const IMG_3D_BEFORE = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800";
const IMG_3D_AFTER  = "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800";

const vp = { once: true, margin: "-60px" } as const;

// ─── Before / After comparison (GSAP ScrollTrigger) ─────────────────────────

function BeforeAfterComparison() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const raf = requestAnimationFrame(() => {
      const ctx = gsap.context(() => {
        const afterDiv = el.querySelector<HTMLElement>(".ba-after");
        const afterImg = el.querySelector<HTMLElement>(".ba-after img");
        if (!afterDiv || !afterImg) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "center center",
            end: () => `+=${el.offsetWidth}`,
            scrub: true,
            pin: true,
            anticipatePin: 1,
          },
          defaults: { ease: "none" },
        });

        tl.fromTo(afterDiv, { xPercent: 100, x: 0 }, { xPercent: 0 })
          .fromTo(afterImg,  { xPercent: -100, x: 0 }, { xPercent: 0 }, 0);
      }, el);

      (el as any)._ctx = ctx;
    });

    return () => {
      cancelAnimationFrame(raf);
      (sectionRef.current as any)?._ctx?.revert();
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative pb-[56.25%] overflow-hidden">
      {/* Before — 3D render */}
      <div className="absolute inset-0">
        <img
          src={IMG_3D_BEFORE}
          alt="Render 3D"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* After — resultado / foto real */}
      <div className="ba-after absolute inset-0 overflow-hidden">
        <img
          src={IMG_3D_AFTER}
          alt="Resultado real"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Labels */}
      <span className="absolute top-4.5 left-4.5 z-10 font-sans text-brand-cream text-[9px] tracking-widest uppercase bg-[#17120f]/78 py-1.5 px-3.5">
        Render 3D
      </span>
      <span className="absolute top-4.5 right-4.5 z-10 font-sans text-brand-cream text-[9px] tracking-widest uppercase bg-[#17120f]/78 py-1.5 px-3.5">
        Resultado real
      </span>

      {/* Divider line */}
      <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-brand-cream/35 z-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-brand-cream text-brand-ink w-8 h-8 rounded-full flex items-center justify-center font-sans text-[11px] font-semibold pointer-events-none select-none">
        ↔
      </div>
    </div>
  );
}

// ─── Service data ─────────────────────────────────────────────────────────────

interface ServiceData {
  id: string;
  label: string;
  title: string;
  description: string;
  bullets: string[];
  img?: string;
  imgPos?: string;
  imageLeft: boolean;
  accent: string;
  slug: string;
  special?: "3d-comparison";
}

const SERVICES: ServiceData[] = [
  {
    id: "diseno-grafico",
    label: "Diseño Gráfico",
    title: "Identidad visual\ny comunicación",
    description: "Desde el logotipo hasta el catálogo completo. Banners, publicidad, retoque y composición fotográfica con Photoshop, e ilustración técnica para proyectos comerciales.",
    bullets: ["Logotipos & identidad visual", "Banners & material publicitario", "Catálogos & diseño editorial", "Composición fotográfica", "Ilustración técnica & planos"],
    img: artDiggin,
    imgPos: "50% 14%",
    imageLeft: true,
    accent: "var(--color-brand-blush)",
    slug: "diseno-grafico",
  },
  {
    id: "3d-stands",
    label: "3D & Stands",
    title: "Del plano\na la realidad",
    description: "Diseño y visualización 3D de stands para ferias, productos y espacios. Reconstrucciones arquitectónicas y conversión a planos técnicos listos para fabricación y construcción.",
    bullets: ["Diseño de stands para ferias", "Renders de producto fotorrealistas", "Reconstrucciones arquitectónicas", "Planos técnicos para producción", "Visualización de espacios & interiores"],
    imageLeft: true,
    accent: "var(--color-brand-orange)",
    slug: "3d-stands",
    special: "3d-comparison",
  },
  {
    id: "diggin",
    label: "Diggin'",
    title: "Diseñadora oficial\ndel sello musical",
    description: "Dirección de arte completa para el sello musical independiente Diggin'. Portadas, identidad visual, ilustraciones para campañas y videoclips animados.",
    bullets: ["Portadas de álbum & EP", "Identidad visual del sello", "Ilustraciones musicales", "Videoclips animados", "Merchandising musical"],
    img: artDiggin,
    imgPos: "50% 14%",
    imageLeft: false,
    accent: "var(--color-brand-neon)",
    slug: "diggin",
  },
  {
    id: "ilustraciones",
    label: "Ilustraciones",
    title: "Arte personal\nsin filtros",
    description: "Obra libre y la serie Musae. Personajes femeninos, naturaleza subvertida y mundos propios en tinta y color. También muñecas personalizadas, arte en arcilla y joyería artesanal.",
    bullets: ["Serie Musae — prints firmados", "Retratos & encargos personales", "Muñecas articuladas a medida", "Arte en arcilla & escultura", "Joyería artesanal"],
    img: artMusae,
    imgPos: "50% 12%",
    imageLeft: true,
    accent: "var(--color-brand-blush)",
    slug: "ilustracion",
  },
  {
    id: "concept-art",
    label: "Concept Art",
    title: "Del concepto\nal universo",
    description: "No solo el dibujo final: el proceso completo de construir un mundo visual desde cero. Personajes con ficha técnica, escenarios coherentes y props diseñados para funcionar en la narrativa.",
    bullets: ["Diseño de personajes & fichas técnicas", "Escenarios & worldbuilding", "Props & objetos narrativos", "Biblias visuales & guías de estilo", "Concept para videojuegos & animación"],
    img: artPortraits,
    imgPos: "50% 12%",
    imageLeft: false,
    accent: "var(--color-brand-orange)",
    slug: "concept-art",
  },
];

// ─── Single service section ───────────────────────────────────────────────────

function ServiceSection({ service, index }: { service: ServiceData; index: number }) {
  const navigate = useNavigate();
  const [imgHovered, setImgHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const bgClass = index % 2 === 0 ? "bg-brand-bg" : "bg-brand-dark";

  const imageBlock = service.img ? (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={vp}
      transition={{ duration: 0.7, ease }}
      className="relative overflow-hidden cursor-pointer w-full"
      onMouseEnter={() => setImgHovered(true)}
      onMouseLeave={() => setImgHovered(false)}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={service.img}
          alt={service.label}
          className={`w-full h-full object-cover transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            imgHovered ? "scale-106 brightness-[0.85] saturate-[1.1]" : "brightness-[0.75]"
          }`}
          style={{ objectPosition: service.imgPos || "center" }}
        />
      </div>
      {/* Accent bar bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]" 
        style={{ 
          height: imgHovered ? 3 : 0, 
          backgroundColor: service.accent 
        }} 
      />
    </motion.div>
  ) : null;

  const textBlock = (
    <div>
      {/* Ink line */}
      <motion.div
        initial={{ scaleX: 0, originX: 0 }} whileInView={{ scaleX: 1 }} viewport={vp}
        transition={{ duration: 0.5, ease }}
        className="flex gap-2.5 items-center mb-4.5"
      >
        <div className="w-8 h-0.5" style={{ backgroundColor: service.accent }} />
        <div className="w-2 h-0.5 opacity-35" style={{ backgroundColor: service.accent }} />
      </motion.div>

      <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
        className="font-sans text-[10px] tracking-[0.28em] uppercase mb-4"
        style={{ color: service.accent }}
      >
        {service.label}
      </motion.p>

      <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
        className="font-serif text-brand-cream text-[1.9rem] md:text-[3.2rem] font-light leading-[1.05] tracking-tight mb-6 whitespace-pre-line"
      >
        {service.title}
      </motion.h2>

      <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
        className="font-sans text-brand-cream/55 text-[13px] leading-relaxed mb-7"
      >
        {service.description}
      </motion.p>

      {/* Bullets */}
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={vp}
        className="flex flex-col gap-2.5 mb-9"
      >
        {service.bullets.map((b) => (
          <motion.div key={b} variants={staggerItem} className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rotate-45 flex-shrink-0 opacity-65" style={{ backgroundColor: service.accent }} />
            <span className="font-sans text-brand-cream/60 text-[12.5px] leading-normal">{b}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.button
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => setBtnHovered(false)}
        onClick={() => navigate(`/coleccion/${service.slug}`)}
        className="font-sans text-[10px] tracking-widest uppercase border py-3 px-7 cursor-pointer transition-all duration-300 font-medium"
        style={{
          color: btnHovered ? "var(--color-brand-ink)" : service.accent,
          backgroundColor: btnHovered ? service.accent : "transparent",
          borderColor: service.accent,
        }}
      >
        Ver trabajos
      </motion.button>
    </div>
  );

  return (
    <section className={`${bgClass} py-20 px-6 md:px-10 border-t border-brand-cream/5`}>
      <div
        className={`max-w-[1160px] mx-auto grid ${
          service.special ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
        } gap-16 items-center`}
      >
        {service.special === "3d-comparison" ? (
          /* 3D: text on top, full-width comparison below */
          <div>
            <div className="max-w-[640px] mb-12">{textBlock}</div>
            <motion.div
              initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={vp}
              transition={{ duration: 0.7, ease }}
            >
              <p className="font-sans text-brand-cream/30 text-[10px] tracking-widest uppercase mb-3.5 text-center">
                ↔ Desplázate para ver antes & después
              </p>
              <BeforeAfterComparison />
            </motion.div>
          </div>
        ) : service.imageLeft ? (
          <>{imageBlock}{textBlock}</>
        ) : (
          <>{textBlock}{imageBlock}</>
        )}
      </div>
    </section>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function ServiceSections() {
  return (
    <>
      {SERVICES.map((s, i) => <ServiceSection key={s.id} service={s} index={i} />)}
    </>
  );
}

// Fade up helper
const fadeUp = {
  hidden:  { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
};
