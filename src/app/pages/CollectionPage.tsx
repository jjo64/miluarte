import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { ease, staggerContainer, staggerItem } from "../tokens";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { useLanguage } from "../context/LanguageContext";


gsap.registerPlugin(Flip);

const artFireGirl  = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/520988252_18317337157235254_3623552272738405742_n_xafgzp.jpg";
const artDiggin    = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/624072385_18076991993069555_3759238577248943847_n_zjw6f8.jpg";
const artMusae     = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/532613326_18320483857235254_170206825296032194_n_mcewf6.jpg";
const artPortraits = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/533637781_18320483821235254_4718922861619683556_n_ddrhz1.jpg";

const vp = { once: true, margin: "-60px" } as const;

// ─── Per-slug content ─────────────────────────────────────────────────────────

interface CollectionMeta {
  title: string;
  label: string;
  statement: string;
  accent: string;
}

const META: Record<string, CollectionMeta> = {
  ilustracion: {
    title: "Ilustración",
    label: "Obra personal",
    statement: "Obra personal que explora la tensión entre forma y vacío. Series que se construyen desde la intuición y se resuelven en el material. Cada pieza es un estado, no una conclusión.",
    accent: "var(--color-brand-blush)",
  },
  diggin: {
    title: "Diggin'",
    label: "Sello musical · Dirección de arte",
    statement: "Portadas, identidad y dirección de arte para el sello independiente Diggin'. Graffiti, psicodelia y hip-hop en formato visual.",
    accent: "var(--color-brand-neon)",
  },
  "concept-art": {
    title: "Concept Art",
    label: "Desarrollo visual",
    statement: "Concept art e ilustración editorial. Personajes, atmósferas y narrativa visual construidos desde la emoción.",
    accent: "var(--color-brand-orange)",
  },
  "diseno-grafico": {
    title: "Diseño Gráfico",
    label: "Identidad visual",
    statement: "Sistemas de identidad, publicaciones y diseño editorial. La imagen al servicio del mensaje.",
    accent: "var(--color-brand-orange)",
  },
  "3d-stands": {
    title: "3D & Stands",
    label: "Diseño de espacios · Ferias",
    statement: "Diseño y visualización 3D de stands y espacios expositivos para ferias y eventos.",
    accent: "var(--color-brand-blush)",
  },
};

// Works grid — editorial asymmetric layout
interface Work {
  id: number | string; title: string; year: string; technique: string;
  size: string; price: string; available: boolean;
  img: string; imgPos: string; gridCol: string; aspect: string;
}

const WORKS_BY_SLUG: Record<string, Work[]> = {
  ilustracion: [
    { id: 1, title: "Sin título (Serie verde)", year: "2024", technique: "Acrílico sobre lienzo",  size: "80 × 60 cm", price: "€480",           available: true,  img: artMusae,     imgPos: "50% 12%", gridCol: "md:col-span-2", aspect: "16/10" },
    { id: 2, title: "Deriva",                  year: "2024", technique: "Óleo sobre tabla",        size: "50 × 70 cm", price: "No disponible",   available: false, img: artPortraits, imgPos: "50% 12%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: 3, title: "Umbral II",               year: "2023", technique: "Técnica mixta",           size: "100 × 80 cm",price: "€650",            available: true,  img: artFireGirl,  imgPos: "50% 22%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: 4, title: "Estructura invisible",    year: "2023", technique: "Acrílico y pigmento",    size: "60 × 60 cm", price: "€320",            available: true,  img: artDiggin,    imgPos: "50% 14%", gridCol: "md:col-span-2", aspect: "16/10" },
  ],
  diggin: [
    { id: "dg1", title: "Smokin' On EP",       year: "2024", technique: "Tom Hodges",              size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811474/Tom_Hodges_-_Smokin_On_EP_eflsuv.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg2", title: "Telling You",         year: "2023", technique: "Daniel Orpi",             size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811474/Telling_You_d1hffh.jpg",         imgPos: "50% 50%", gridCol: "md:col-span-2", aspect: "16/10" },
    { id: "dg3", title: "Shimmy Shake EP",     year: "2024", technique: "Castelho",                size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811472/Castelho_nqzizi.jpg",            imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg4", title: "Guetto Unk EP",       year: "2023", technique: "DIGGS",                   size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811472/DIGGS_-_GUETTO_UNK_EP_xjt6zc.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg5", title: "You4me EP",           year: "2022", technique: "Cribb",                   size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811472/Cribb_-_You4me_EP_fgbk8l.jpg",    imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg6", title: "Kriol EP",            year: "2023", technique: "Kriol",                   size: "12″ Vinyl",           price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811472/Kriol_znr4cu.jpg",             imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg7", title: "Cyava Vol. 1",        year: "2024", technique: "Cyava",                   size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811473/Cyava.1_sja6iz.jpg",             imgPos: "50% 50%", gridCol: "md:col-span-2", aspect: "16/10" },
    { id: "dg8", title: "Super Looper EP",     year: "2023", technique: "Red Effects",             size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811473/Red_Effects_-_Super_Looper_EP_awueze.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg9", title: "Remixes EP",          year: "2024", technique: "Daniel Orpi",             size: "12″ Vinyl",           price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811477/Daniel_Orpi_Chapa_Castelo_Remixes_njsyv9.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg10", title: "Change",             year: "2023", technique: "Daniel Orpi",             size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811476/Daniel_Orpi_-_Change_tk64hl.jpg",   imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg11", title: "Beamer EP",          year: "2024", technique: "Beamer",                  size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811476/Beamer_EP_qg8wyv.jpg",            imgPos: "50% 50%", gridCol: "md:col-span-2", aspect: "16/10" },
    { id: "dg12", title: "Art No Logia",       year: "2024", technique: "Art No Logia",            size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811475/Art_No_Logia_zhqeqm.jpg",       imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg13", title: "Vibin' EP",          year: "2023", technique: "Eros",                    size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811478/Eros_-_Vibin_ft2row.jpg",          imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg14", title: "Bingham EP",         year: "2023", technique: "Fabio Neural",            size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811477/FABIO_NEURAL_BINGHAM_EP_coyy1p.jpg", imgPos: "50% 50%", gridCol: "md:col-span-2", aspect: "16/10" },
    { id: "dg15", title: "Watchu Doin'",       year: "2023", technique: "Hights",                  size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811479/Hights_-_Watchu_Doin_ulrwve.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg16", title: "Red Flag",           year: "2023", technique: "Doke",                    size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811479/Doke_Red_Flag_u1njsw.jpg",         imgPos: "50% 50%", gridCol: "md:col-span-2", aspect: "16/10" },
    { id: "dg17", title: "The Groove Quest Vol. 45", year: "2024", technique: "Varios artistas",   size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811481/The_Groove_Quest_Vol._45_wcqeta.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg18", title: "House Jam EP",       year: "2023", technique: "Rhoowax",                 size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811480/Rhoowax_-_House_Jam_EP_bt9yyq.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg19", title: "Shimmy Shake EP",     year: "2024", technique: "Castilho",                size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811481/CASTILHO_-_SHIMMY_SHAKE_EP_m5pfg5.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg20", title: "Night Heroes",       year: "2024", technique: "Rokke",                   size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811481/Rokke_-_Night_Heroes_c6ekoz.jpg",         imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg21", title: "La puesta de Sol",   year: "2023", technique: "Magnuss",                 size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811483/Magnuss_-_La_puesta_de_Sol_s7hkab.jpg", imgPos: "50% 50%", gridCol: "md:col-span-2", aspect: "16/10" },
    { id: "dg22", title: "Heyyo! EP",          year: "2024", technique: "Lonely and Friends",      size: "12″ Vinyl",           price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811482/LONELY_AND_FRIENDS_HEYYO_EP_xcllie.jpg", imgPos: "50% 50%", gridCol: "md:col-span-2", aspect: "16/10" },
    { id: "dg23", title: "Worxxx Out EP",      year: "2024", technique: "Varios artistas",         size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811484/Worxxx_Out_EP_swxqgn.jpg",       imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg24", title: "Trapped in Bassline EP", year: "2023", technique: "Tyron Amory",         size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811483/Tyron_Amory_-_Trapped_in_Bassline_EP_1_1_ywn0zu.png", imgPos: "50% 50%", gridCol: "md:col-span-3", aspect: "16/9" }
  ]
};

// Das Motel pieces
const DAS_MOTEL = [
  { id: "dm1", title: "Room 12",    year: "2022", img: artFireGirl,  imgPos: "50% 22%" },
  { id: "dm2", title: "Check-out",  year: "2022", img: artDiggin,    imgPos: "50% 14%" },
  { id: "dm3", title: "Last Night", year: "2021", img: artMusae,     imgPos: "50% 45%" },
];

// ─── Work Card ────────────────────────────────────────────────────────────────

function WorkCard({ 
  work, 
  accent, 
  onClick, 
  imgRef 
}: { 
  work: Work; 
  accent: string; 
  onClick: () => void; 
  imgRef: (el: HTMLImageElement | null) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const { t, language } = useLanguage();

  const getLocalizedPrice = (price: string) => {
    if (price === "No disponible") return t("collection.availability.unavailable");
    if (price === "Proyecto musical") return t("collection.availability.musicalProject");
    return price;
  };

  const getLocalizedTechnique = (tech: string) => {
    if (tech === "Acrílico sobre lienzo") return language === "es" ? "Acrílico sobre lienzo" : "Acrylic on canvas";
    if (tech === "Óleo sobre tabla") return language === "es" ? "Óleo sobre tabla" : "Oil on wood panel";
    if (tech === "Técnica mixta") return language === "es" ? "Técnica mixta" : "Mixed media";
    if (tech === "Acrílico y pigmento") return language === "es" ? "Acrílico y pigmento" : "Acrylic and pigment";
    return tech;
  };

  return (
    <motion.div
      variants={staggerItem}
      className={`relative overflow-hidden cursor-pointer col-span-3 ${work.gridCol}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div className="relative overflow-hidden w-full h-full" style={{ aspectRatio: work.aspect }}>
        <img
          ref={imgRef}
          src={work.img}
          alt={work.title}
          className={`w-full h-full object-cover transition-all duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            hovered ? "scale-105 brightness-[0.82] saturate-[1.1]" : "brightness-[0.72]"
          }`}
          style={{ objectPosition: work.imgPos }}
        />

        {/* Museum label overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-brand-bg/97 via-brand-bg/30 to-transparent flex flex-col justify-end p-6 transition-opacity duration-400 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
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
          <p className="font-sans text-brand-cream/50 text-[11px] tracking-wide mb-2.5">
            {work.size}
          </p>
          <p 
            className="font-sans text-[11px] tracking-widest uppercase font-medium"
            style={{ color: work.available ? accent : "rgba(245,237,224,0.35)" }}
          >
            {getLocalizedPrice(work.price)}
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

// ─── Das Motel Card ───────────────────────────────────────────────────────────

function DasMotelCard({ work }: { work: typeof DAS_MOTEL[0] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative overflow-hidden cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="aspect-[3/4] relative overflow-hidden">
        <img
          src={work.img}
          alt={work.title}
          className={`w-full h-full object-cover transition-all duration-[1300ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            hovered ? "grayscale-[100%] brightness-[0.55] scale-[1.04]" : "grayscale-[100%] brightness-[0.38] scale-100"
          }`}
          style={{ objectPosition: work.imgPos }}
        />
        {/* Orange duotone overlay */}
        <div className={`absolute inset-0 bg-brand-orange mix-blend-multiply transition-opacity duration-[1300ms] ${
          hovered ? "opacity-30" : "opacity-60"
        }`} />
        {/* Dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0908]/94 to-transparent to-60%" />
        {/* Label */}
        <div className={`absolute bottom-0 left-0 p-7 transition-opacity duration-900 ${
          hovered ? "opacity-100" : "opacity-55"
        }`}>
          <p className="font-serif text-brand-cream text-2xl font-light italic tracking-wide mb-2">{work.title}</p>
          <p className="font-sans text-brand-cream/35 text-[10px] tracking-widest uppercase">{work.year}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Collection Page ──────────────────────────────────────────────────────────

export function CollectionPage() {
  const { slug = "ilustracion" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const meta = META[slug] ?? META["ilustracion"];
  
  // Localize metadata dynamically
  const localizedMeta = {
    ...meta,
    title: t(`collection.meta.${slug}.title`) || meta.title,
    label: t(`collection.meta.${slug}.label`) || meta.label,
    statement: t(`collection.meta.${slug}.statement`) || meta.statement,
  };

  const [ctaH, setCtaH] = useState(false);
  const works = WORKS_BY_SLUG[slug] ?? WORKS_BY_SLUG["ilustracion"];

  // Localize work titles on the fly if needed
  const getLocalizedWorkTitle = (title: string) => {
    if (title === "Sin título (Serie verde)") return language === "es" ? "Sin título (Serie verde)" : "Untitled (Green Series)";
    if (title === "Estructura invisible") return language === "es" ? "Estructura invisible" : "Invisible Structure";
    return title;
  };

  const localizedWorks = works.map((w) => ({
    ...w,
    title: getLocalizedWorkTitle(w.title),
  }));

  // GSAP Flip states and refs
  const [activeWork, setActiveWork] = useState<Work | null>(null);
  const gridRefs = useRef<Record<string | number, HTMLImageElement | null>>({});
  const modalImgRef = useRef<HTMLImageElement | null>(null);
  const modalOverlayRef = useRef<HTMLDivElement | null>(null);

  const handleWorkClick = (work: Work) => {
    const gridImg = gridRefs.current[work.id];
    if (gridImg) {
      const state = Flip.getState(gridImg);
      (gridImg as any)._flipState = state;
      gsap.set(gridImg, { opacity: 0 });
    }
    setActiveWork(work);
  };

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
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="grid grid-cols-3 gap-0.5 mb-1"
      >
        {localizedWorks.map((w) => (
          <WorkCard 
            key={w.id} 
            work={w} 
            accent={localizedMeta.accent} 
            onClick={() => handleWorkClick(w)}
            imgRef={(el) => { gridRefs.current[w.id] = el; }}
          />
        ))}
      </motion.div>

      {/* ─── Das Motel ──────────────────────────────────────────────────────── */}
      {slug === "ilustracion" && (
        <section className="bg-brand-dark py-24 px-6 md:px-10">
          <div className="mb-16 max-w-[560px]">
            <motion.div
              initial={{ scaleX: 0, originX: 0 }} whileInView={{ scaleX: 1 }} viewport={vp}
              transition={{ duration: 0.5, ease }}
              className="flex gap-2.5 items-center mb-6"
            >
              <div className="w-8 h-0.5 bg-brand-orange" />
              <div className="w-2 h-0.5 bg-brand-orange opacity-35" />
            </motion.div>

            <motion.p
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
              className="font-sans text-brand-orange text-[10px] tracking-[0.32em] uppercase mb-4.5"
            >
              {t("collection.exhibition")}
            </motion.p>

            <motion.h2
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
              className="font-serif text-brand-cream text-[3rem] md:text-[5rem] font-light italic leading-[0.95] tracking-tight mb-6"
            >
              Das Motel
            </motion.h2>

            <motion.p
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
              className="font-sans text-brand-cream/35 text-xs leading-relaxed"
            >
              {t("collection.dasMotelStatement")}
            </motion.p>
          </div>

          {/* Duotone grid */}
          <motion.div
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={vp}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[960px]"
          >
            {DAS_MOTEL.map((w) => (
              <motion.div key={w.id} variants={staggerItem}>
                <DasMotelCard work={w} />
              </motion.div>
            ))}
          </motion.div>

          {/* Ghost watermark */}
          <div className="mt-20 overflow-hidden select-none">
            <p className="font-serif text-brand-cream opacity-5 text-[5rem] md:text-[11rem] font-light italic tracking-tighter leading-none whitespace-nowrap">
              Das Motel
            </p>
          </div>
        </section>
      )}

      {/* Footer strip */}
      <footer className="bg-brand-dark border-t-2 border-brand-orange py-14 px-6 md:px-10 flex flex-col items-center gap-7">
        <motion.p
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
          className="font-serif text-brand-cream text-[1.05rem] font-light opacity-45"
        >
          {t("collection.interest")}
        </motion.p>
        <a
          href="mailto:Miluartedenara@gmail.com"
          className="font-sans bg-brand-orange hover:bg-[#c94520] text-brand-cream text-[10px] tracking-widest uppercase border-none py-4 px-10 cursor-pointer transition-colors duration-300 font-medium no-underline inline-block"
        >
          {t("collection.requestQuote")}
        </a>
        <div className="flex gap-6">
          {["Instagram", "Behance", "LinkedIn"].map((n) => (
            <a key={n} href="#" className="font-sans text-brand-cream/20 hover:text-brand-orange text-[11px] tracking-wider no-underline transition-colors duration-200">{n}</a>
          ))}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 font-sans text-brand-cream/30 hover:text-brand-cream text-[10px] tracking-widest uppercase bg-transparent border-none cursor-pointer mt-2 transition-colors duration-200"
        >
          <ArrowLeft size={12} /> {t("collection.back")}
        </button>
      </footer>

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
          className="relative max-h-[85vh] max-w-[85vw] z-10 flex items-center justify-center"
          style={{ aspectRatio: activeWork?.aspect }}
        >
          {activeWork && (
            <img
              ref={modalImgRef}
              src={activeWork.img}
              alt={activeWork.title}
              className="w-full h-full object-contain cursor-pointer rounded shadow-2xl"
              onClick={closeModal}
            />
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
