import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ease } from "../tokens";
import { useLanguage } from "../context/LanguageContext";
import { getOptimizedImageUrl } from "../utils/cloudinary";

gsap.registerPlugin(ScrollTrigger);

const IMAGES = [
  {
    "src": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/TELL_ME_A_JOKE_mq8n1l.jpg",
    "category": "ilustracion",
    "altKey": "obra1"
  },
  {
    "src": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/Paranoia_ieurx1.jpg",
    "category": "concept",
    "altKey": "obra2"
  },
  {
    "src": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/musae_dkbruz.jpg",
    "category": "ilustracion",
    "altKey": "obra3"
  },
  {
    "src": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/diggin/Tom_Hodges_-_Smokin_On_EP_eflsuv.jpg",
    "category": "musica",
    "altKey": "obra4"
  },
  {
    "src": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/animas/1_Melisa_Completo_nwlyro.jpg",
    "category": "concept",
    "altKey": "obra5"
  },
  {
    "src": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/retratos/2-Retrato-Anna-Karina_cb505e.jpg",
    "category": "joyeria",
    "altKey": "obra6"
  },
  {
    "src": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/pasta-ya/Bravioli-el-bravo-y-Tortastini_m1owbr.jpg",
    "category": "concept",
    "altKey": "obra7"
  },
  {
    "src": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/Cabesa_copia_kak4hg.jpg",
    "category": "ilustracion",
    "altKey": "obra8"
  }
];

interface GalleryCardProps {
  src: string;
  altKey: string;
  index: number;
  editable?: boolean;
  onImageClick?: () => void;
}

function GalleryCard({ src, altKey, index, editable, onImageClick }: GalleryCardProps) {
  const [hovered, setHovered] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const cardRectRef = useRef<DOMRect | null>(null);
  const { t } = useLanguage();
  const num = String(index + 1).padStart(2, "0");
  const localizedAlt = t(`gallery.alts.${altKey}`) || "Artwork";

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
    const rX = -(mouseY / height) * 10; // max 10 degrees tilt
    const rY = (mouseX / width) * 10;
    setRotate({ x: rX, y: rY });
  };

  const handleMouseLeave = () => {
    cardRectRef.current = null;
    setHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      className={`flex-shrink-0 w-[80vw] md:w-[32vw] px-2.5 box-content ${editable ? "cursor-pointer" : ""}`}
      onClick={editable && onImageClick ? onImageClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: hovered ? "none" : "transform 0.5s ease-out",
        transformStyle: "preserve-3d",
      }}
      data-cursor={t("process.cursorHint")}
    >
      <div className="relative overflow-hidden aspect-square rounded-lg shadow-xl group/card" style={{ transform: "translateZ(20px)" }}>
        <img
          src={getOptimizedImageUrl(src, 800)}
          alt={localizedAlt}
          loading="lazy"
          className={`w-full h-full object-cover block transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
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

        {/* Overlay en modo editable */}
        {editable && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-3 text-center z-20">
            <div className="w-8 h-8 rounded-full bg-brand-blush text-brand-ink flex items-center justify-center shadow-lg">
              📷
            </div>
            <span className="font-sans text-[11px] font-semibold text-brand-cream tracking-wider uppercase">
              Cambiar Obra #{index + 1}
            </span>
          </div>
        )}

        {/* Blush corner accent on hover */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-brand-blush transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ height: hovered ? 3 : 0 }}
        />
      </div>
    </div>
  );
}

interface HorizontalGalleryProps {
  images?: Array<{ src: string; category?: string; altKey?: string }>;
  onImageClick?: (index: number) => void;
  editable?: boolean;
}

export function HorizontalGallery({ images, onImageClick, editable = false }: HorizontalGalleryProps = {}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stripRef   = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [category, setCategory] = useState<string>("all");
  const [galleryImages, setGalleryImages] = useState(images || IMAGES);
  const { t } = useLanguage();

  useEffect(() => {
    if (images && images.length > 0) {
      setGalleryImages(images);
    }
  }, [images]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadFeatured() {
      try {
        const res = await fetch("/api/admin/galleries");
        if (!res.ok) return;
        const galleries = await res.json();
        if (!Array.isArray(galleries)) return;

        const allFeatured: typeof IMAGES = [];
        for (const g of galleries.slice(0, 4)) {
          const worksRes = await fetch(`/api/admin/works?slug=${g.slug}`);
          if (worksRes.ok) {
            const works = await worksRes.json();
            if (Array.isArray(works)) {
              const featured = works.filter((w: any) => w.featured);
              featured.forEach((w: any, idx: number) => {
                allFeatured.push({
                  src: w.img,
                  category: g.slug === "diggin" ? "musica" : g.slug.includes("concept") ? "concept" : "ilustracion",
                  altKey: `obra${(idx % 8) + 1}`,
                });
              });
            }
          }
        }

        if (allFeatured.length >= 4 && isMounted) {
          setGalleryImages(allFeatured);
        }
      } catch {
        // fallback
      }
    }
    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredImages = category === "all"
    ? galleryImages
    : galleryImages.filter((img) => img.category === category);

  useEffect(() => {
    if (isMobile) return;
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
          x: () => {
            const len = getScrollLength();
            return len > 0 ? -len : 0;
          },
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
  }, [isMobile, category]);

  return (
    <section id="galeria" className="bg-brand-dark overflow-hidden">

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
            <div className="w-8 h-0.5 bg-brand-blush" />
            <div className="w-2 h-0.5 bg-brand-blush opacity-35" />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="font-serif text-brand-cream text-[2rem] md:text-[3rem] font-light tracking-tight"
          >
            {t("gallery.title")}
          </motion.h2>
        </div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="font-sans text-brand-cream/35 text-xs leading-relaxed max-w-[240px] text-left md:text-right whitespace-pre-line"
        >
          {t("gallery.subtitle")}
        </motion.p>
      </div>

      {/* Category Filters */}
      <div className="px-5 md:px-10 pb-6 flex flex-wrap gap-2.5 overflow-x-auto scrollbar-hide">
        {(["all", "ilustracion", "concept", "musica", "joyeria"] as const).map((cat) => {
          const isActive = category === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`font-sans text-[11px] md:text-[12px] tracking-wide py-2 px-4 rounded-full border cursor-pointer transition-all duration-250 whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? "bg-brand-blush text-brand-ink border-brand-blush font-semibold"
                  : "bg-transparent border-brand-cream/15 text-brand-cream/65 hover:border-brand-blush hover:text-brand-blush"
              }`}
            >
              {t(`gallery.filters.${cat}`)}
            </button>
          );
        })}
      </div>

      {/* ── Mobile: horizontal CSS scroll ── */}
      {isMobile ? (
        <div className="flex overflow-x-auto gap-3 px-5 pb-8" style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}>
          {filteredImages.map((img, i) => (
            <GalleryCard
              key={`${category}-${i}`}
              src={img.src}
              altKey={img.altKey}
              index={i}
              editable={editable}
              onImageClick={onImageClick ? () => onImageClick(i) : undefined}
            />
          ))}
        </div>
      ) : (
        /* ── Desktop: GSAP pinned horizontal strip ── */
        <div
          ref={wrapperRef}
          className="overflow-hidden h-[75vh] flex items-center"
        >
          <div
            ref={stripRef}
            className="flex flex-nowrap items-center will-change-transform px-[5vw]"
          >
            {filteredImages.map((img, i) => (
              <GalleryCard
                key={`${category}-${i}`}
                src={img.src}
                altKey={img.altKey}
                index={i}
                editable={editable}
                onImageClick={onImageClick ? () => onImageClick(i) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Drag hint ── */}
      <div className="py-5 px-10 pb-16 flex justify-end">
        <p className="font-sans text-brand-cream/20 text-[10px] tracking-widest uppercase">
          {isMobile ? `← ${t("gallery.hint") || "desliza"} →` : t("gallery.hint")}
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
