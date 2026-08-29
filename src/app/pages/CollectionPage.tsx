import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { ease, staggerContainer, staggerItem } from "../tokens";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { SharedFooter } from "../components/SharedFooter";
import { useLanguage } from "../context/LanguageContext";
import { getOptimizedImageUrl } from "../utils/cloudinary";
import { NotFoundPage } from "./NotFoundPage";


gsap.registerPlugin(Flip);

const vp = { once: true, margin: "-60px" } as const;

import { META, WORKS_BY_SLUG, CollectionMeta, Work } from "../data/portfolioData";
export { META, WORKS_BY_SLUG };
export type { CollectionMeta, Work };


// ─── Work Card ────────────────────────────────────────────────────────────────

function WorkCard({ 
  work, 
  accent, 
  onClick, 
  imgRef,
  isTwoColumns = false,
  index = 0,
}: { 
  work: Work; 
  accent: string; 
  onClick: () => void; 
  imgRef: (el: HTMLImageElement | null) => void;
  isTwoColumns?: boolean;
  index?: number;
}) {
  const layout = getEditorialLayout(index, isTwoColumns, work.gridCol, work.aspect);
  const [hovered, setHovered] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const cardRectRef = useRef<DOMRect | null>(null);
  const { t, language } = useLanguage();

  const getLocalizedPrice = (price: string) => {
    if (price === "No disponible") return t("collection.availability.unavailable");
    if (price === "Proyecto musical") return t("collection.availability.musicalProject");
    if (price === "Encargo") return language === "es" ? "Encargo" : "Commission";
    if (price === "Campaña") return language === "es" ? "Proyecto de campaña" : "Campaign project";
    return price;
  };

  const getLocalizedTechnique = (tech: string) => {
    if (tech === "Acrílico sobre lienzo") return language === "es" ? "Acrílico sobre lienzo" : "Acrylic on canvas";
    if (tech === "Óleo sobre tabla") return language === "es" ? "Óleo sobre tabla" : "Oil on wood panel";
    if (tech === "Técnica mixta") return language === "es" ? "Técnica mixta" : "Mixed media";
    if (tech === "Acrílico y pigmento") return language === "es" ? "Acrílico y pigmento" : "Acrylic and pigment";
    if (tech === "Carboncillo y acrílico") return language === "es" ? "Carboncillo y acrílico" : "Charcoal and acrylic";
    if (tech === "Técnica mixta · Tríptico") return language === "es" ? "Técnica mixta · Tríptico" : "Mixed media · Triptych";
    if (tech === "Tinta y acuarela") return language === "es" ? "Tinta y acuarela" : "Ink and watercolor";
    
    // Retratos techniques
    if (tech === "Retrato digital · Icono del cine") return language === "es" ? "Retrato digital · Icono del cine" : "Digital portrait · Cinema icon";
    if (tech === "Retrato digital · Icono literario") return language === "es" ? "Retrato digital · Icono literario" : "Digital portrait · Literary icon";
    if (tech === "Retrato digital · Icono del terror") return language === "es" ? "Retrato digital · Icono del terror" : "Digital portrait · Horror icon";
    if (tech === "Cartoon · Caricatura de personaje") return language === "es" ? "Cartoon · Caricatura de personaje" : "Cartoon · Character caricature";
    if (tech === "Escenario · Concept art urbano") return language === "es" ? "Escenario · Concept art urbano" : "Environment · Urban concept art";
    if (tech === "Escenario · Line art final") return language === "es" ? "Escenario · Line art final" : "Environment · Final line art";
    if (tech === "Escenario · Arquitectura fantástica") return language === "es" ? "Escenario · Arquitectura fantástica" : "Environment · Fantastic architecture";
    if (tech === "Escenario · Vista isométrica") return language === "es" ? "Escenario · Vista isométrica" : "Environment · Isometric view";
    if (tech === "Criatura · Diseño de fantasía") return language === "es" ? "Criatura · Diseño de fantasía" : "Creature · Fantasy design";
    if (tech === "Criatura · Diseño de horror") return language === "es" ? "Criatura · Diseño de horror" : "Creature · Horror design";
    if (tech === "Naturaleza · Ilustración científica") return language === "es" ? "Naturaleza · Ilustración científica" : "Nature · Scientific illustration";
    if (tech === "Naturaleza · Insecto a detalle") return language === "es" ? "Naturaleza · Insecto a detalle" : "Nature · Detailed insect";
    if (tech === "Anatomía · Model sheet facial") return language === "es" ? "Anatomía · Model sheet facial" : "Anatomy · Facial model sheet";
    if (tech === "Anatomía · Proporciones cartoon") return language === "es" ? "Anatomía · Proporciones cartoon" : "Anatomy · Cartoon proportions";
    if (tech === "Anatomía · Estudio de edades") return language === "es" ? "Anatomía · Estudio de edades" : "Anatomy · Age study";
    if (tech === "Anatomía · Movimiento y acción") return language === "es" ? "Anatomía · Movimiento y acción" : "Anatomy · Movement and action";
    if (tech === "Estilo · Cyberpunk concept") return language === "es" ? "Estilo · Cyberpunk concept" : "Style · Cyberpunk concept";
    if (tech === "Estilo · Dualidad temporal") return language === "es" ? "Estilo · Dualidad temporal" : "Style · Temporal duality";
    if (tech === "Animales · Estudio de anatomía") return language === "es" ? "Animales · Estudio de anatomía" : "Animals · Anatomy study";
    if (tech === "Naturaleza · Ilustración de aves") return language === "es" ? "Naturaleza · Ilustración de aves" : "Nature · Bird illustration";
    if (tech === "Escenario · Entorno submarino") return language === "es" ? "Escenario · Entorno submarino" : "Environment · Underwater environment";
    if (tech === "Cartoon · Galería de personajes") return language === "es" ? "Cartoon · Galería de personajes" : "Cartoon · Character gallery";
    if (tech === "Escenario · Entorno natural") return language === "es" ? "Escenario · Entorno natural" : "Environment · Natural environment";
    if (tech === "Cartoon · Diseño de criatura") return language === "es" ? "Cartoon · Diseño de criatura" : "Cartoon · Creature design";
    
    // Animas techniques
    if (tech === "Concept Art · Personaje principal") return language === "es" ? "Concept Art · Personaje principal" : "Concept Art · Main character";
    if (tech === "Model sheet · Vistas 360°") return language === "es" ? "Model sheet · Vistas 360°" : "Model sheet · 360° views";
    if (tech === "Model sheet · Dinamismo") return language === "es" ? "Model sheet · Dinamismo" : "Model sheet · Dynamism";
    if (tech === "Model sheet · Emociones") return language === "es" ? "Model sheet · Emociones" : "Model sheet · Emotions";
    if (tech === "Concept Art · Jefe del universo") return language === "es" ? "Concept Art · Jefe del universo" : "Concept Art · Boss character";
    if (tech === "Concept Art · Dúo de jefes") return language === "es" ? "Concept Art · Dúo de jefes" : "Concept Art · Boss duo";
    if (tech === "Concept Art · Antagonista") return language === "es" ? "Concept Art · Antagonista" : "Concept Art · Antagonist";
    if (tech === "Concept Art · Elenco completo") return language === "es" ? "Concept Art · Elenco completo" : "Concept Art · Full cast";
    if (tech === "Concept Art · Trío protagonista") return language === "es" ? "Concept Art · Trío protagonista" : "Concept Art · Protagonist trio";
    if (tech === "Props · Diseño de armas") return language === "es" ? "Props · Diseño de armas" : "Props · Weapon design";
    if (tech === "Props · Objetos narrativos") return language === "es" ? "Props · Objetos narrativos" : "Props · Narrative objects";
    if (tech === "Props · Objeto clave del lore") return language === "es" ? "Props · Objeto clave del lore" : "Props · Key lore object";
    if (tech === "Concept Art · Criaturas del mundo") return language === "es" ? "Concept Art · Criaturas del mundo" : "Concept Art · World creatures";
    if (tech === "Concept Art · Evolución") return language === "es" ? "Concept Art · Evolución" : "Concept Art · Evolution";
    if (tech === "Concept Art · Elenco secundario") return language === "es" ? "Concept Art · Elenco secundario" : "Concept Art · Secondary cast";
    if (tech === "Concept Art · Personaje icónico") return language === "es" ? "Concept Art · Personaje icónico" : "Concept Art · Iconic character";
    if (tech === "Diseño de marca · Mundo propio") return language === "es" ? "Diseño de marca · Mundo propio" : "Brand design · Personal world";
    if (tech === "Diseño · Símbolo del universo") return language === "es" ? "Diseño · Símbolo del universo" : "Design · Universe symbol";
    
    return tech;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    let rect = cardRectRef.current;
    if (!rect) {
      const card = cardRef.current;
      if (!card) return;
      rect = card.getBoundingClientRect();
      cardRectRef.current = rect;
    }
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    const rX = -(mouseY / height) * 8; // max 8 degrees tilt
    const rY = (mouseX / width) * 8;
    setRotate({ x: rX, y: rY });
  };

  const handleMouseLeave = () => {
    cardRectRef.current = null;
    setHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      variants={staggerItem}
      className={`relative overflow-hidden cursor-pointer group col-span-1 ${layout.gridCol}`}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: hovered ? "none" : "transform 0.4s ease-out",
        transformStyle: "preserve-3d",
      }}
      data-cursor={language === "es" ? "Ampliar" : "Zoom"}
    >
      <div className="relative overflow-hidden w-full h-full bg-brand-dark/90" style={{ aspectRatio: layout.aspect }}>
        {work.fitMode === "contain" && (
          <div
            className="absolute inset-0 bg-cover bg-center blur-md opacity-25 scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${getOptimizedImageUrl(work.img, 400)})` }}
          />
        )}
        <img
          ref={imgRef}
          src={getOptimizedImageUrl(work.img, 800)}
          alt={work.title}
          className={`relative z-1 w-full h-full ${
            work.fitMode === "contain" ? "object-contain p-2" : "object-cover"
          } transition-all duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            hovered ? "scale-105 brightness-[0.82] saturate-[1.1]" : "brightness-[0.72]"
          }`}
          style={{ objectPosition: work.imgPos || "50% 50%" }}
        />

        {/* Museum label overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-brand-bg/97 via-brand-bg/30 to-transparent flex flex-col justify-end p-6 transition-opacity duration-400 opacity-100 md:opacity-0 group-hover:opacity-100"
        >
          <p 
            className="font-sans text-[9px] tracking-widest uppercase mb-2.5" 
            style={{ color: accent }}
          >
            {getLocalizedTechnique(work.technique)} · {work.year}
          </p>
          <p className="font-serif text-brand-cream text-lg font-light mb-2 leading-tight">
            {work.title}
          </p>
          <p className="font-sans text-brand-cream/60 text-[11px] tracking-wide">
            {work.size}
          </p>
        </div>

        {/* Accent corner bar */}
        <div 
          className="absolute top-0 right-0 w-[2px] transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]" 
          style={{ 
            height: hovered ? 56 : 0, 
            backgroundColor: accent 
          }} 
        />
      </div>
    </motion.div>
  );
}

// ─── Animas Bible Section ─────────────────────────────────────────────────────

const ANIMAS_SLIDES = [
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/01_Portada_ljcbrq.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/02_Introducción_vopmvs.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/03_Introducción_rpdjrc.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/04_Veive_cgvvbf.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/05_Veive_rftpr5.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/06_Veive_pqy387.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/07_Veive_vee6mz.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/08_Melisa_crsc5e.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/09_Melisa_alxiqu.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/10_Melisa_teoite.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/11_Melisa_yf3wfk.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/12_Osceola_fsumn6.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/13_Osceola_fqorrq.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/14_Osceola_gp4zuk.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/15_Mania_ehtvh0.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/16_Mania_zbpatm.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/17_Feronia_ww6zmk.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/18_Feronia_qmleha.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/19_Atum_y_Satres_myxu2c.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/20_Gran_Espiritu_gnfaxn.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/21_Abuela_Araña_dja5v6.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/22_Vesta_ynqsgg.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/23_Nethus_notptk.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/24_Usil_y_Losna_nib3my.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/25_Nortia_y_Vant_kblzdr.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/26_Nortia_y_Vant_niuvw7.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/27_Line_Up_nhbloe.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/28_Props_sttvlg.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/29_Arte_final_1_nkseuc.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/30_Arte_final_2_ns9rdp.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/31_Resumen_w5ipcb.jpg"
];

function AnimasBibleSection() {
  const { t, language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const updateScrollArrows = () => {
    const el = scrollRef.current;
    if (el) {
      setShowLeftArrow(el.scrollLeft > 10);
      setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (el) {
      const scrollAmount = el.clientWidth * 0.75;
      el.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollLeft > 40);
    updateScrollArrows();
  };

  useEffect(() => {
    updateScrollArrows();
    const handleResize = () => {
      updateScrollArrows();
    };
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(updateScrollArrows, 150);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="bg-brand-dark py-20">
      <div className="px-6 md:px-10 mb-10">
        <motion.div
          initial={{ scaleX: 0, originX: 0 }} whileInView={{ scaleX: 1 }}
          viewport={vp}
          transition={{ duration: 0.5 }}
          className="flex gap-2.5 items-center mb-6"
        >
          <div className="w-8 h-0.5" style={{ backgroundColor: "#C8A96E" }} />
          <div className="w-2 h-0.5 opacity-35" style={{ backgroundColor: "#C8A96E" }} />
        </motion.div>
        <motion.p
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
          className="font-sans text-[10px] tracking-[0.32em] uppercase mb-4" style={{ color: "#C8A96E" }}
        >
          {t("collection.animasBible.tagline")}
        </motion.p>
        <motion.h2
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
          className="font-serif text-brand-cream text-[2.5rem] md:text-[4.5rem] font-light italic leading-[0.95] tracking-tight mb-5"
        >
          {t("collection.animasBible.title")}
        </motion.h2>
        <motion.p
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
          className="font-sans text-brand-cream/65 text-[12px] leading-relaxed max-w-[520px]"
        >
          {t("collection.animasBible.description")}
        </motion.p>
      </div>

      {/* Horizontal scroll strip container */}
      <div className="relative group/slider">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1, backgroundColor: "rgba(200, 169, 110, 0.15)", borderColor: "rgba(200, 169, 110, 0.6)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll("left")}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full border border-[#C8A96E]/20 bg-black/50 backdrop-blur-md text-[#C8A96E] shadow-2xl cursor-pointer transition-all duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </motion.button>
        )}

        {/* Right Arrow Button */}
        {showRightArrow && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1, backgroundColor: "rgba(200, 169, 110, 0.15)", borderColor: "rgba(200, 169, 110, 0.6)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll("right")}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full border border-[#C8A96E]/20 bg-black/50 backdrop-blur-md text-[#C8A96E] shadow-2xl cursor-pointer transition-all duration-300"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </motion.button>
        )}

        {!scrolled && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2 pointer-events-none group-hover/slider:opacity-0 transition-opacity duration-300">
            <span className="font-sans text-[9px] tracking-widest uppercase text-brand-cream/60">
              {language === "es" ? "desplazar" : "scroll"}
            </span>
            <div className="w-6 h-[1px] bg-brand-cream/20" />
          </div>
        )}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto px-6 md:px-10 pb-4 scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {(((t("animasSlides") as any) && Array.isArray(t("animasSlides") as any) && (t("animasSlides") as any).length > 0)
            ? (t("animasSlides") as any)
            : ANIMAS_SLIDES
          ).map((src: string, i: number, arr: string[]) => (
            <div
              key={i}
              className="flex-shrink-0 relative overflow-hidden rounded group"
              style={{ width: "clamp(260px, 28vw, 420px)", aspectRatio: "16/9" }}
            >
              <img
                src={getOptimizedImageUrl(src, 600)}
                alt={`Animas slide ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="absolute bottom-3 left-4 font-sans text-[9px] tracking-widest text-brand-cream/50 uppercase">
                {String(i + 1).padStart(2, "0")} / {arr.length}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ghost watermark */}
      <div className="mt-16 overflow-hidden select-none px-6">
        <p className="font-serif text-brand-cream opacity-[0.03] text-[4rem] md:text-[9rem] font-light italic tracking-tighter leading-none whitespace-nowrap">
          Animas
        </p>
      </div>
    </section>
  );
}

export function getGridColClass(gridCol: string | undefined): string {
  if (!gridCol) return "md:col-span-4";
  if (gridCol === "md:col-span-1") return "md:col-span-4";
  if (gridCol === "md:col-span-2") return "md:col-span-8";
  if (gridCol === "md:col-span-3") return "md:col-span-12";
  return gridCol;
}

// Helper para calcular diseño editorial armónico que nunca se rompe al reordenar
export function getEditorialLayout(index: number, isTwoColumns: boolean = false, customGridCol?: string, customAspect?: string) {
  if (isTwoColumns) {
    return {
      gridCol: "col-span-1",
      aspect: "1/1",
    };
  }

  // Si tiene custom y no queremos forzar patrón:
  if (customGridCol && customAspect) {
    return {
      gridCol: getGridColClass(customGridCol),
      aspect: customAspect,
    };
  }

  // Patrón editorial armónico cíclico de 8 piezas adaptado al grid de 12 columnas
  const pattern = [
    { gridCol: "md:col-span-8", aspect: "3/2" },  // 0: Ancha (2/3)
    { gridCol: "md:col-span-4", aspect: "3/4" },  // 1: Vertical (1/3) -> Fila 1 completa
    { gridCol: "md:col-span-4", aspect: "3/4" },  // 2: Vertical (1/3)
    { gridCol: "md:col-span-8", aspect: "3/2" },  // 3: Ancha (2/3) -> Fila 2 completa
    { gridCol: "md:col-span-4", aspect: "1/1" },  // 4: Cuadrada (1/3)
    { gridCol: "md:col-span-4", aspect: "1/1" },  // 5: Cuadrada (1/3)
    { gridCol: "md:col-span-4", aspect: "1/1" },  // 6: Cuadrada (1/3) -> Fila 3 completa
    { gridCol: "md:col-span-12", aspect: "16/9" }, // 7: Panorámica completa (3/3) -> Fila 4 completa
  ];

  return pattern[index % pattern.length];
}

// ─── Collection Page ──────────────────────────────────────────────────────────

export function CollectionPage() {
  const { slug = "musae" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  const isBase = Boolean(META[slug]);
  const [dynamicMeta, setDynamicMeta] = useState<CollectionMeta | null>(() => META[slug] ?? null);
  const [dynamicWorks, setDynamicWorks] = useState<Work[]>(() => WORKS_BY_SLUG[slug] ?? []);
  const [isLoading, setIsLoading] = useState<boolean>(!isBase);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  // GSAP Flip states and refs
  const [activeWork, setActiveWork] = useState<Work | null>(null);
  const gridRefs = useRef<Record<string | number, HTMLImageElement | null>>({});
  const modalImgRef = useRef<HTMLImageElement | null>(null);
  const modalOverlayRef = useRef<HTMLDivElement | null>(null);

  // Magnifying glass detail zoom state
  const [zoomState, setZoomState] = useState({ show: false, x: 0, y: 0, bgX: 0, bgY: 0 });
  const modalRectRef = useRef<DOMRect | null>(null);
  const [ctaH, setCtaH] = useState(false);

  useEffect(() => {
    if (slug === "ilustracion") {
      navigate("/coleccion/musae", { replace: true });
      return;
    }

    let isMounted = true;

    const activeSlug = slug === "ilustracion" ? "musae" : slug;

    if (META[activeSlug]) {
      setDynamicMeta(META[activeSlug]);
      setDynamicWorks(WORKS_BY_SLUG[activeSlug] ?? []);
      setIsNotFound(false);
      setIsLoading(false);
    } else {
      setDynamicMeta(null);
      setDynamicWorks([]);
      setIsLoading(true);
      setIsNotFound(false);
    }

    async function loadDynamicContent() {
      try {
        // 1. Cargar metadatos de la galería
        const gallRes = await fetch("/api/admin/galleries");
        if (gallRes.ok) {
          const galleries = await gallRes.json();
          if (Array.isArray(galleries)) {
            const found = galleries.find((g: any) => g.slug === slug);
            if (found && isMounted) {
              setDynamicMeta({
                title: found.title,
                label: found.label,
                statement: found.statement,
                accent: found.accent || "var(--color-brand-blush)",
                twoColumns: Boolean(found.twoColumns),
              });
              setIsNotFound(false);
            } else if (!META[slug] && isMounted) {
              setIsNotFound(true);
              setIsLoading(false);
              return;
            }
          }
        } else if (!META[slug] && isMounted) {
          setIsNotFound(true);
          setIsLoading(false);
          return;
        }

        // 2. Cargar obras de la galería
        const worksRes = await fetch(`/api/admin/works?slug=${slug}`);
        if (worksRes.ok) {
          const worksData = await worksRes.json();
          if (Array.isArray(worksData) && isMounted) {
            setDynamicWorks(worksData);
          }
        }
      } catch (err) {
        if (!META[slug] && isMounted) {
          setIsNotFound(true);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDynamicContent();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Helper para traducir solo si la clave realmente existe en el diccionario
  const getSafeTranslation = (key: string, fallback: string) => {
    const res = t(key);
    if (!res || res === key) return fallback;
    return res;
  };

  const meta = dynamicMeta || {
    title: slug,
    label: "Colección",
    statement: "",
    accent: "var(--color-brand-blush)",
    twoColumns: false,
  };

  const localizedMeta = {
    ...meta,
    title: getSafeTranslation(`collection.meta.${slug}.title`, meta.title),
    label: getSafeTranslation(`collection.meta.${slug}.label`, meta.label),
    statement: getSafeTranslation(`collection.meta.${slug}.statement`, meta.statement),
  };

  useEffect(() => {
    if (dynamicMeta) {
      const pageTitle = `${localizedMeta.title} | Portafolio Miluartedenara`;
      document.title = pageTitle;
      if (localizedMeta.statement) {
        document.querySelector('meta[name="description"]')?.setAttribute('content', localizedMeta.statement);
      }
    }
  }, [slug, localizedMeta.title, localizedMeta.statement, dynamicMeta]);

  useLayoutEffect(() => {
    if (activeWork) {
      const gridImg = gridRefs.current[activeWork.id];
      const modalImg = modalImgRef.current;
      const state = (gridImg as any)?._flipState;
      if (modalImg && state) {
        Flip.from(state, {
          targets: modalImg,
          duration: 0.65,
          ease: "power2.out",
        });
        gsap.to(modalOverlayRef.current, {
          opacity: 0.8,
          duration: 0.35,
          ease: "power2.out"
        });
      }
    }
  }, [activeWork]);

  const closeModal = () => {
    if (!activeWork) return;
    setZoomState((prev) => ({ ...prev, show: false }));
    const gridImg = gridRefs.current[activeWork.id];
    const modalImg = modalImgRef.current;
    if (gridImg && modalImg) {
      const state = Flip.getState(modalImg);
      gsap.set(gridImg, { opacity: 1 });
      setActiveWork(null);
      Flip.from(state, {
        targets: gridImg,
        duration: 0.65,
        ease: "power2.inOut",
        absolute: true
      });
      gsap.to(modalOverlayRef.current, {
        opacity: 0,
        duration: 0.35,
        ease: "power2.inOut"
      });
    } else {
      setActiveWork(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeWork]);

  // Conditional early returns AFTER all hooks have executed
  if (isNotFound) {
    return <NotFoundPage />;
  }

  if (isLoading || !dynamicMeta) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-orange border-t-transparent animate-spin" />
      </div>
    );
  }

  const isTwoColumns = meta.twoColumns ?? false;

  // Localize work titles on the fly if needed
  const getLocalizedWorkTitle = (title: string) => {
    if (title === "Sin título (Serie verde)") return language === "es" ? "Sin título (Serie verde)" : "Untitled (Green Series)";
    if (title === "Estructura invisible") return language === "es" ? "Estructura invisible" : "Invisible Structure";
    if (title === "Cabeza (Estudio)") return language === "es" ? "Cabeza (Estudio)" : "Head (Study)";
    if (title === "La cabeza") return language === "es" ? "La cabeza" : "The Head";
    if (title === "Kreativität & Schreibkunst") return language === "es" ? "Kreativität & Schreibkunst" : "Creativity & Writing";
    if (title === "The Earth") return language === "es" ? "La Tierra" : "The Earth";
    if (title === "The Sky") return language === "es" ? "El Cielo" : "The Sky";
    if (title === "The Ocean") return language === "es" ? "El Océano" : "The Ocean";

    // Retratos titles localization
    if (title === "Diferentes Edades — Pelirroja") return language === "es" ? "Diferentes Edades — Pelirroja" : "Different Ages — Redhead";
    if (title === "Diferentes Edades — Japonesa") return language === "es" ? "Diferentes Edades — Japonesa" : "Different Ages — Japanese";
    if (title === "Diferentes Edades — Africano") return language === "es" ? "Diferentes Edades — Africano" : "Different Ages — African";
    if (title === "Poses Dinámicas") return language === "es" ? "Poses Dinámicas" : "Dynamic Poses";
    if (title === "Cuerpos Cartoon") return language === "es" ? "Cuerpos Cartoon" : "Cartoon Bodies";
    if (title === "Expresiones — Estudio") return language === "es" ? "Expresiones — Estudio" : "Expressions — Study";
    if (title === "Ciudad Lovecraft") return language === "es" ? "Ciudad Lovecraft" : "Lovecraft City";
    if (title === "Ciudad Lovecraft — Línea") return language === "es" ? "Ciudad Lovecraft — Línea" : "Lovecraft City — Line";
    if (title === "Fachadas — Mundo propio") return language === "es" ? "Fachadas — Mundo propio" : "Facades — Personal World";
    if (title === "Fachada Isométrica") return language === "es" ? "Fachada Isométrica" : "Isometric Facade";
    if (title === "Espacios Abiertos") return language === "es" ? "Espacios Abiertos" : "Open Spaces";
    if (title === "Espacios Acuáticos") return language === "es" ? "Espacios Acuáticos" : "Aquatic Spaces";
    if (title === "Dragón — Caja Musical") return language === "es" ? "Dragón — Caja Musical" : "Dragon — Music Box";
    if (title === "Criatura Grotesca") return language === "es" ? "Criatura Grotesca" : "Grotesque Creature";
    if (title === "Animales Marinos") return language === "es" ? "Animales Marinos" : "Marine Animals";
    if (title === "Mantis Jade — Detalle") return language === "es" ? "Mantis Jade — Detalle" : "Jade Mantis — Detail";
    if (title === "Aves juntas") return language === "es" ? "Aves juntas" : "Birds Together";
    if (title === "Plantigrados — Color") return language === "es" ? "Plantígrados — Color" : "Plantigrades — Color";
    if (title === "Digitígrados — Color") return language === "es" ? "Digitígrados — Color" : "Digitigrades — Color";
    if (title === "Ungulados — Color") return language === "es" ? "Ungulados — Color" : "Ungulates — Color";
    if (title === "Animal Cartoon") return language === "es" ? "Animal Cartoon" : "Cartoon Animal";
    if (title === "Cartoon — Elenco Completo") return language === "es" ? "Cartoon — Elenco Completo" : "Cartoon — Full Cast";
    if (title === "Cyberpunk — Fusión de eras") return language === "es" ? "Cyberpunk — Fusión de eras" : "Cyberpunk — Fusion of Eras";
    if (title === "Futuro y Pasado") return language === "es" ? "Futuro y Pasado" : "Future and Past";
    return title;
  };

  const works = dynamicWorks;
  const localizedWorks = works.map((w) => ({
    ...w,
    title: getLocalizedWorkTitle(w.title),
  }));

  const handleModalMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    let rect = modalRectRef.current;
    if (!rect) {
      rect = e.currentTarget.getBoundingClientRect();
      modalRectRef.current = rect;
    }
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate background position percentages
    const bgX = (x / rect.width) * 100;
    const bgY = (y / rect.height) * 100;

    setZoomState({
      show: true,
      x: x - 80, // Center of a 160px magnifier
      y: y - 80,
      bgX,
      bgY
    });
  };

  const handleModalMouseLeave = () => {
    modalRectRef.current = null;
    setZoomState((prev) => ({ ...prev, show: false }));
  };

  const handleWorkClick = (work: Work) => {
    const gridImg = gridRefs.current[work.id];
    if (gridImg) {
      const state = Flip.getState(gridImg);
      (gridImg as any)._flipState = state;
      gsap.set(gridImg, { opacity: 0 });
    }
    setActiveWork(work);
  };

  return (
    <div className="bg-brand-bg text-brand-cream min-h-screen">

      {/* Collection header */}
      <div className="pt-32 pb-14 px-6 md:px-10 max-w-[820px]">
        <motion.div
          initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
          className="flex gap-2.5 items-center mb-6"
        >
          <div className="w-8 h-0.5" style={{ backgroundColor: localizedMeta.accent }} />
          <div className="w-2 h-0.5 opacity-35" style={{ backgroundColor: localizedMeta.accent }} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease }}
          className="font-sans text-[10px] tracking-[0.32em] uppercase mb-4.5"
          style={{ color: localizedMeta.accent }}
        >
          {localizedMeta.label}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease }}
          className="font-serif text-brand-cream text-[4rem] md:text-[7rem] font-light leading-[0.92] tracking-tight mb-9"
        >
          {localizedMeta.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.55, ease }}
          className="font-sans text-brand-cream/50 text-[12.5px] leading-relaxed max-w-[500px]"
        >
          {localizedMeta.statement}
        </motion.p>
      </div>

      {/* Editorial works grid */}
      {localizedWorks.length === 0 ? (
        <div className="py-24 px-6 md:px-10 text-center flex flex-col items-center justify-center">
          <p className="font-serif italic text-brand-wall text-base md:text-lg mb-2">
            {language === "es" ? "Próximamente nuevas obras en esta colección." : "New artworks coming soon in this collection."}
          </p>
          <div className="w-8 h-0.5 mt-2" style={{ backgroundColor: localizedMeta.accent, opacity: 0.4 }} />
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className={`grid ${isTwoColumns ? "grid-cols-2" : "grid-cols-1"} ${
            isTwoColumns ? "" : "md:grid-cols-12"
          } gap-4 md:gap-4 mb-1 items-start`}
        >
          {localizedWorks.map((w, idx) => (
            <WorkCard 
              key={w.id} 
              work={w} 
              accent={localizedMeta.accent} 
              onClick={() => handleWorkClick(w)}
              imgRef={(el) => { gridRefs.current[w.id] = el; }}
              isTwoColumns={isTwoColumns}
              index={idx}
            />
          ))}
        </motion.div>
      )}

      {/* ─── Animas: Biblia Visual ───────────────────────────────────────── */}
      {slug === "animas" && (
        <AnimasBibleSection />
      )}

      <SharedFooter />

      {/* GSAP Flip Modal */}
      <div 
        className="fixed inset-0 z-55 flex items-center justify-center transition-all duration-300"
        style={{ 
          visibility: activeWork ? "visible" : "hidden",
          pointerEvents: activeWork ? "auto" : "none"
        }}
      >
        {/* Overlay */}
        <div 
          ref={modalOverlayRef}
          className="absolute inset-0 bg-black opacity-0 cursor-pointer"
          onClick={closeModal}
        />
        
        {/* Modal Content container */}
        <div 
          className="relative max-h-[85vh] max-w-[85vw] z-10 flex items-center justify-center overflow-hidden rounded shadow-2xl select-none"
          style={{ aspectRatio: activeWork?.aspect }}
          onMouseMove={handleModalMouseMove}
          onMouseLeave={handleModalMouseLeave}
        >
          {activeWork && (
            <>
              <img
                ref={modalImgRef}
                src={getOptimizedImageUrl(activeWork.img, 1200)}
                alt={activeWork.title}
                className="w-full h-full object-contain cursor-pointer"
                onClick={closeModal}
              />
              {zoomState.show && (
                <div
                  className="absolute w-[160px] h-[160px] rounded-full pointer-events-none border border-brand-blush/60 shadow-2xl overflow-hidden z-20 hidden md:block"
                  style={{
                    left: zoomState.x,
                    top: zoomState.y,
                    backgroundImage: `url(${getOptimizedImageUrl(activeWork.img, 1600)})`,
                    backgroundPosition: `${zoomState.bgX}% ${zoomState.bgY}%`,
                    backgroundSize: "280%",
                    backgroundRepeat: "no-repeat",
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Fade up animation helper
const fadeUp = {
  hidden:  { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
};
