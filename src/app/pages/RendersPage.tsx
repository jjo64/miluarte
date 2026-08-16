import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { C, RADIUS, ease, fadeUp, staggerContainer, staggerItem } from "../tokens";
import { SharedFooter } from "../components/SharedFooter";
import { useLanguage } from "../context/LanguageContext";
import { getOptimizedImageUrl } from "../utils/cloudinary";

// Registrar GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Tipografía local para esta sección específica
const PLAYFAIR = "'Playfair Display', Georgia, serif";
const DMSANS = "'DM Sans', system-ui, sans-serif";

// ─── Interfaces ──────────────────────────────────────────────────────────────
interface RenderItem {
  id: string;
  title: string;
  client: string;
  year: string;
  badge: string;
  software: string[];
  delivery: string;
  description: string;
  img: string;
  videoSrcMp4?: string;
  videoSrcWebm?: string;
  process: { src: string; label: string }[];
  makingOfVideoMp4?: string;
  makingOfVideoWebm?: string;
}

// ─── Datos de Proyectos 3D (Mixkit Abstract loops + Cloudinary Images) ─────────
export const RENDERS: RenderItem[] = [
  {
    id: "stand-feria-milan",
    title: "Stand Modular de Feria — Milán",
    client: "Fiera Milano S.p.A.",
    year: "2025",
    badge: "STAND · FERIA",
    software: ["Blender", "SketchUp", "AutoCAD"],
    delivery: "Planos técnicos + Renders fotorrealistas",
    description:
      "Propuesta de stand fotorrealista para exhibición de mobiliario de vanguardia. La estructura utiliza materiales ecológicos de alta durabilidad y un sistema modular desmontable de rápida construcción.",
    img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811479/Doke_Red_Flag_u1njsw.jpg",
    videoSrcMp4: "/videos/sample-3d.mp4",
    videoSrcWebm: "/videos/sample-3d.mp4",
    process: [
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781815712/Captura_de_pantalla_2026-06-18_224728_qvosll.png", label: "Boceto en papel" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/532613326_18320483857235254_170206825296032194_n_mcewf6.jpg", label: "Blockout 3D" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/533637781_18320483821235254_4718922861619683556_n_ddrhz1.jpg", label: "Clay render" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811479/Doke_Red_Flag_u1njsw.jpg", label: "Render final" }
    ],
    makingOfVideoMp4: "/videos/sample-bbb.mp4",
    makingOfVideoWebm: "/videos/sample-bbb.mp4"
  },
  {
    id: "altavoz-inteligente",
    title: "Altavoz Hi-Fi Inteligente 3D",
    client: "Soundwave Technologies",
    year: "2024",
    badge: "PRODUCTO · 3D",
    software: ["Cinema 4D", "Octane Render", "Photoshop"],
    delivery: "Renders promocionales + Animación publicitaria",
    description:
      "Visualización publicitaria para el lanzamiento de un altavoz inteligente. Se modelaron con máxima fidelidad las texturas de aluminio cepillado y tela acústica, usando iluminación de estudio realista.",
    img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/532613326_18320483857235254_170206825296032194_n_mcewf6.jpg",
    videoSrcMp4: "/videos/sample-bbb.mp4",
    videoSrcWebm: "/videos/sample-bbb.mp4",
    process: [
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/624072385_18076991993069555_3759238577248943847_n_zjw6f8.jpg", label: "Referencia" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781815712/Captura_de_pantalla_2026-06-18_224728_qvosll.png", label: "Blockout 3D" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/533637781_18320483821235254_4718922861619683556_n_ddrhz1.jpg", label: "Clay render" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/532613326_18320483857235254_170206825296032194_n_mcewf6.jpg", label: "Render final" }
    ]
  },
  {
    id: "pabellon-cristal",
    title: "Pabellón Botánico de Cristal",
    client: "Proyecto de investigación",
    year: "2025",
    badge: "ARQUITECTURA",
    software: ["Blender", "V-Ray", "Photoshop"],
    delivery: "Renders fotorrealistas + Recorrido virtual",
    description:
      "Modelado de un pabellón botánico de cristal integrado en el bosque. Destaca el comportamiento de la luz natural a través de los cristales estructurados y la vegetación circundante.",
    img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/533637781_18320483821235254_4718922861619683556_n_ddrhz1.jpg",
    videoSrcMp4: "/videos/sample-3d.mp4",
    videoSrcWebm: "/videos/sample-3d.mp4",
    process: [
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781815712/Captura_de_pantalla_2026-06-18_224728_qvosll.png", label: "Boceto en papel" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/624072385_18076991993069555_3759238577248943847_n_zjw6f8.jpg", label: "Blockout 3D" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/532613326_18320483857235254_170206825296032194_n_mcewf6.jpg", label: "Clay render" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/533637781_18320483821235254_4718922861619683556_n_ddrhz1.jpg", label: "Render final" }
    ],
    makingOfVideoMp4: "/videos/sample-bbb.mp4",
    makingOfVideoWebm: "/videos/sample-bbb.mp4"
  },
  {
    id: "stand-cosmetica-bio",
    title: "Stand de Cosmética Orgánica",
    client: "Natura Cosmetics",
    year: "2024",
    badge: "STAND · FERIA",
    software: ["Blender", "SketchUp", "Substance Painter"],
    delivery: "Todos (planos técnicos, renders y animación de recorrido)",
    description:
      "Visualización de un stand expositivo de cosmética bio. Combina iluminación cálida con texturas de madera y vegetación para transmitir pureza y sostenibilidad.",
    img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/624072385_18076991993069555_3759238577248943847_n_zjw6f8.jpg",
    videoSrcMp4: "/videos/sample-bbb.mp4",
    videoSrcWebm: "/videos/sample-bbb.mp4",
    process: [
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781815712/Captura_de_pantalla_2026-06-18_224728_qvosll.png", label: "Boceto en papel" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/532613326_18320483857235254_170206825296032194_n_mcewf6.jpg", label: "Blockout 3D" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/533637781_18320483821235254_4718922861619683556_n_ddrhz1.jpg", label: "Clay render" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/624072385_18076991993069555_3759238577248943847_n_zjw6f8.jpg", label: "Render final" }
    ]
  }
];

// ─── RenderCard ───────────────────────────────────────────────────────────────
function RenderCard({
  item,
  colSpan,
  onOpen,
  isTouch,
}: {
  item: RenderItem;
  colSpan: string;
  onOpen: (item: RenderItem) => void;
  isTouch: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Lazy loading con IntersectionObserver (200px margin)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Control de reproducción del vídeo en hover
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isTouch) return;

    if (isHovered) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isHovered, isTouch]);

  return (
    <motion.div
      ref={cardRef}
      variants={staggerItem}
      onClick={() => onOpen(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${colSpan} relative overflow-hidden cursor-pointer rounded-2xl group w-full`}
      style={{
        aspectRatio: "16/9",
        backgroundColor: "var(--brand-dark, #0D0908)",
        border: "1px solid rgba(245, 237, 224, 0.05)",
      }}
    >
      {/* Thumbnail Estática (Hover: se desvanece en desktop) */}
      <img
        src={getOptimizedImageUrl(item.img, 800)}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200 z-10"
        style={{
          opacity: !isTouch && isHovered ? 0 : 1,
        }}
      />

      {/* Vídeo en Hover (Lazy loaded y crossfade) */}
      {!isTouch && isIntersecting && item.videoSrcMp4 && (
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          poster={item.img}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200"
          style={{
            opacity: isHovered ? 1 : 0,
          }}
        >
          <source src={item.videoSrcWebm} type="video/webm" />
          <source src={item.videoSrcMp4} type="video/mp4" />
        </video>
      )}

      {/* Play Button Overlay (Sólo en Dispositivos Touch) */}
      {isTouch && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/25 z-20">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-[#F5EDE0] shadow-lg backdrop-blur-md" 
            style={{ 
              backgroundColor: "rgba(229, 84, 39, 0.9)", // Brand Orange
              border: "1px solid rgba(245, 237, 224, 0.15)"
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 translate-x-[2px]">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Badge en Esquina (Neon Green) */}
      <div
        className="absolute top-4 right-4 z-20 font-sans text-[9px] font-bold tracking-widest uppercase py-1 px-2.5 rounded-md"
        style={{
          fontFamily: DMSANS,
          backgroundColor: "rgba(13, 9, 8, 0.85)",
          color: "#C8FF00",
          border: "1px solid rgba(200, 255, 0, 0.2)",
          backdropFilter: "blur(4px)"
        }}
      >
        {item.badge}
      </div>

      {/* Overlay de información (Visible al hacer hover en desktop, estático en touch) */}
      <div
        className={`absolute inset-x-0 bottom-0 p-5 z-20 flex flex-col justify-end transition-all duration-300 ${
          isTouch ? "opacity-100" : "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
        }`}
        style={{
          background: "linear-gradient(to top, rgba(13, 9, 8, 0.95) 0%, rgba(13, 9, 8, 0.4) 70%, transparent 100%)",
        }}
      >
        <h3 className="font-serif text-[#F5EDE0] text-base font-light leading-tight mb-1" style={{ fontFamily: PLAYFAIR }}>
          {item.title}
        </h3>
        <p className="font-sans text-[10px] tracking-wider uppercase" style={{ fontFamily: DMSANS, color: "var(--brand-secondary, #8A8070)" }}>
          {item.client}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({
  item,
  onClose,
  language,
}: {
  item: RenderItem;
  onClose: () => void;
  language: "es" | "en";
}) {
  const [isZoomed, setIsZoomed] = useState(false);

  // Cerrar al pulsar tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-0 md:p-6 no-print">
      
      {/* Backdrop (Fade-in) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.92 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className="absolute inset-0 bg-black cursor-pointer"
      />

      {/* Contenedor del Lightbox (Scale y Fade) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease }}
        className="relative w-full h-full md:h-auto md:max-h-[92vh] md:max-w-[860px] bg-brand-dark border-0 md:border border-brand-cream/10 md:rounded-2xl shadow-2xl flex flex-col overflow-y-auto"
        style={{
          backgroundColor: "var(--brand-dark, #0D0908)",
        }}
      >
        {/* Cabecera del Lightbox */}
        <div className="sticky top-0 z-30 flex justify-between items-center px-6 py-4 border-b border-brand-cream/10" style={{ backgroundColor: "rgba(13, 9, 8, 0.95)", backdropFilter: "blur(8px)" }}>
          <h2 className="font-serif text-[#F5EDE0] text-base font-normal tracking-wide" style={{ fontFamily: PLAYFAIR }}>
            {item.title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-brand-cream/10 flex items-center justify-center text-brand-secondary hover:text-brand-orange hover:bg-brand-cream/5 cursor-pointer transition-all duration-200"
          >
            ✕
          </button>
        </div>

        {/* Bloque 1 - El render */}
        <div className="w-full bg-black flex items-center justify-center relative overflow-hidden">
          {item.videoSrcMp4 ? (
            <video
              controls
              autoPlay
              className="w-full max-h-[60vh] object-contain bg-black"
              poster={getOptimizedImageUrl(item.img, 1200)}
            >
              <source src={item.videoSrcWebm} type="video/webm" />
              <source src={item.videoSrcMp4} type="video/mp4" />
            </video>
          ) : (
            <div 
              className="w-full overflow-hidden cursor-zoom-in flex items-center justify-center"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <img
                src={getOptimizedImageUrl(item.img, 1200)}
                alt={item.title}
                className="w-full h-auto max-h-[60vh] object-contain transition-transform duration-300"
                style={{
                  transform: isZoomed ? "scale(1.3)" : "scale(1)"
                }}
              />
            </div>
          )}
        </div>

        {/* Bloque 2 - El proceso (making of) */}
        <div className="p-6 md:p-8 flex flex-col gap-6">
          <div>
            <p className="font-sans text-[9px] tracking-[0.3em] font-bold text-brand-orange uppercase mb-4" style={{ fontFamily: DMSANS, color: C.orange }}>
              {language === "es" ? "EL PROCESO" : "THE PROCESS"}
            </p>
            
            {/* Subsección: Software usado */}
            <div className="mb-6">
              <h4 className="font-sans text-[10px] font-bold tracking-wider text-brand-secondary uppercase mb-2" style={{ fontFamily: DMSANS, color: "var(--brand-secondary, #8A8070)" }}>
                {language === "es" ? "Software usado" : "Software used"}
              </h4>
              <div className="flex flex-wrap gap-2">
                {item.software.map((sw) => (
                  <span key={sw} className="font-sans text-xs px-3.5 py-1.5 rounded-full bg-brand-cream/5 border border-brand-cream/10 text-brand-cream" style={{ fontFamily: DMSANS }}>
                    {sw}
                  </span>
                ))}
              </div>
            </div>

            {/* Subsección: Del boceto al render */}
            <div className="mb-6">
              <h4 className="font-sans text-[10px] font-bold tracking-wider text-brand-secondary uppercase mb-3" style={{ fontFamily: DMSANS, color: "var(--brand-secondary, #8A8070)" }}>
                {language === "es" ? "Del boceto al render" : "From sketch to render"}
              </h4>
              
              {/* Carrusel horizontal con snap */}
              <div 
                className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-none"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none"
                }}
              >
                {item.process.map((step, i) => (
                  <div key={i} className="flex-shrink-0 snap-start flex flex-col gap-2" style={{ width: "200px" }}>
                    <div className="w-[200px] h-[150px] overflow-hidden rounded-lg border border-brand-cream/10 bg-brand-dark/30">
                      <img
                        src={getOptimizedImageUrl(step.src, 400)}
                        alt={step.label}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <p className="font-sans text-[11px] text-center text-brand-cream/60" style={{ fontFamily: DMSANS }}>
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Subsección: Vídeo making of (Opcional) */}
            {item.makingOfVideoMp4 && (
              <div className="mb-6">
                <h4 className="font-sans text-[10px] font-bold tracking-wider text-brand-secondary uppercase mb-3" style={{ fontFamily: DMSANS, color: "var(--brand-secondary, #8A8070)" }}>
                  {language === "es" ? "Vídeo making of" : "Making of video"}
                </h4>
                <div className="w-full rounded-lg overflow-hidden border border-brand-cream/10 bg-black">
                  <video controls className="w-full max-h-[30vh] object-cover">
                    <source src={item.makingOfVideoWebm} type="video/webm" />
                    <source src={item.makingOfVideoMp4} type="video/mp4" />
                  </video>
                </div>
              </div>
            )}

            {/* Ficha técnica */}
            <div className="py-6 border-t border-brand-cream/10">
              <h4 className="font-sans text-[10px] font-bold tracking-wider text-brand-secondary uppercase mb-4" style={{ fontFamily: DMSANS, color: "var(--brand-secondary, #8A8070)" }}>
                {language === "es" ? "Ficha Técnica" : "Technical Sheet"}
              </h4>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm mb-6">
                <div>
                  <p className="text-[10px] text-brand-secondary uppercase tracking-widest font-semibold" style={{ fontFamily: DMSANS }}>
                    {language === "es" ? "Cliente" : "Client"}
                  </p>
                  <p className="text-brand-cream font-medium" style={{ fontFamily: DMSANS }}>{item.client}</p>
                </div>
                <div>
                  <p className="text-[10px] text-brand-secondary uppercase tracking-widest font-semibold" style={{ fontFamily: DMSANS }}>
                    {language === "es" ? "Año" : "Year"}
                  </p>
                  <p className="text-brand-cream font-medium" style={{ fontFamily: DMSANS }}>{item.year}</p>
                </div>
                <div>
                  <p className="text-[10px] text-brand-secondary uppercase tracking-widest font-semibold" style={{ fontFamily: DMSANS }}>
                    {language === "es" ? "Tipo" : "Type"}
                  </p>
                  <p className="text-brand-cream font-medium" style={{ fontFamily: DMSANS }}>{item.badge.replace(" · ", " / ")}</p>
                </div>
                <div>
                  <p className="text-[10px] text-brand-secondary uppercase tracking-widest font-semibold" style={{ fontFamily: DMSANS }}>
                    {language === "es" ? "Software" : "Software"}
                  </p>
                  <p className="text-brand-cream font-medium" style={{ fontFamily: DMSANS }}>{item.software.join(", ")}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-brand-secondary uppercase tracking-widest font-semibold" style={{ fontFamily: DMSANS }}>
                    {language === "es" ? "Formato de entrega" : "Delivery format"}
                  </p>
                  <p className="text-brand-cream font-medium" style={{ fontFamily: DMSANS }}>{item.delivery}</p>
                </div>
              </div>

              {/* Botón encargo similar */}
              <button
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new CustomEvent("open-booking-modal"));
                }}
                className="w-full py-4 border border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-brand-ink rounded-lg font-sans font-bold text-xs uppercase tracking-widest cursor-pointer transition-all duration-300"
                style={{ fontFamily: DMSANS }}
              >
                {language === "es" ? "PEDIR UN RENDER SIMILAR →" : "ORDER A SIMILAR RENDER →"}
              </button>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── RendersPage ──────────────────────────────────────────────────────────────
export function RendersPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [active, setActive] = useState<RenderItem | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [dynamicRenders, setDynamicRenders] = useState<RenderItem[]>(() => RENDERS);

  useEffect(() => {
    let isMounted = true;
    async function loadRenders() {
      try {
        const res = await fetch("/api/admin/renders");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && isMounted) {
            setDynamicRenders(data);
          }
        }
      } catch {
        // fallback
      }
    }
    loadRenders();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    document.title = "Diseño 3D y Renders de Stands | Miluartedenara";
    const desc = "Diseño tridimensional, modelado de stands comerciales para ferias y renders fotorrealistas de producto y arquitectura por Nerea Lucas Pajares.";
    document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
  }, []);

  const heroVideoRef = useRef<HTMLDivElement>(null);
  const heroVideoContainerRef = useRef<HTMLDivElement>(null);

  // Detectar dispositivo táctil
  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  // Animación parallax del vídeo del Hero mediante GSAP ScrollTrigger
  useEffect(() => {
    const video = heroVideoRef.current;
    const container = heroVideoContainerRef.current;
    if (!video || !container) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(video, 
        { yPercent: -10 },
        {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  // Alternancia asimétrica de columnas en desktop (60% / 40% o 40% / 60%)
  const getColSpan = (i: number) => {
    const isSecondInRow = i % 2 === 1;
    const isOddRow = Math.floor(i / 2) % 2 === 1;
    if (!isOddRow) {
      return isSecondInRow ? "md:col-span-2" : "md:col-span-3";
    } else {
      return isSecondInRow ? "md:col-span-3" : "md:col-span-2";
    }
  };

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>
      
      {/* ── HERO SECTION ── */}
      <section className="relative pt-32 pb-16 px-6 md:px-10 max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Texto Hero */}
          <div className="w-full lg:w-[40%] flex flex-col justify-center">
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="font-sans text-[10px] tracking-[0.3em] font-semibold text-brand-orange uppercase mb-4"
              style={{ fontFamily: DMSANS, color: C.orange }}
            >
              {language === "es" ? "3D & VISUALIZACIÓN" : "3D & VISUALIZATION"}
            </motion.p>
            
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="font-serif font-light text-brand-cream tracking-tight mb-6"
              style={{ 
                fontFamily: PLAYFAIR, 
                fontSize: "clamp(34px, 5vw, 56px)",
                lineHeight: 1.1 
              }}
            >
              {language === "es" ? "Del plano a la pantalla" : "From blueprint to screen"}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="font-sans text-base leading-relaxed text-brand-secondary"
              style={{ fontFamily: DMSANS, color: C.secondary }}
            >
              {language === "es" 
                ? "Renders, modelado y visualización de espacios, productos y stands. Cada pieza comienza en papel y termina en un mundo tridimensional."
                : "Renders, modeling and visualization of spaces, products and stands. Each piece begins on paper and ends in a three-dimensional world."}
            </motion.p>
          </div>

          {/* Vídeo Hero con Parallax */}
          <div 
            ref={heroVideoContainerRef}
            className="w-full lg:w-[60%] overflow-hidden relative shadow-2xl"
            style={{ borderRadius: "16px", aspectRatio: "16/9" }}
          >
            <div ref={heroVideoRef} className="w-full h-full scale-[1.2]">
              <video
                autoPlay
                muted
                loop
                playsInline
                poster={getOptimizedImageUrl("https://res.cloudinary.com/doznr2qm4/image/upload/v1781811479/Doke_Red_Flag_u1njsw.jpg", 1000)}
                className="w-full h-full object-cover"
              >
                <source src="/videos/sample-bbb.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

        </div>
      </section>

      {/* ── GRID PRINCIPAL ── */}
      <section className="py-20 px-6 md:px-10 bg-brand-dark" style={{ backgroundColor: "var(--brand-dark, #0D0908)", borderTop: "1px solid rgba(255, 255, 255, 0.03)" }}>
        <div className="max-w-[1200px] mx-auto">
          
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="font-sans text-[10px] tracking-[0.3em] font-semibold text-brand-orange uppercase mb-12"
            style={{ fontFamily: DMSANS, color: C.orange }}
          >
            {language === "es" ? "PROYECTOS RECIENTES" : "RECENT PROJECTS"}
          </motion.p>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-5 gap-6"
          >
            {dynamicRenders.map((item, i) => (
              <RenderCard
                key={item.id}
                item={item}
                colSpan={getColSpan(i)}
                onOpen={setActive}
                isTouch={isTouch}
              />
            ))}
          </motion.div>

        </div>
      </section>



      {/* Shared Footer */}
      <SharedFooter />

      {/* Lightbox con AnimatePresence */}
      <AnimatePresence>
        {active && (
          <Lightbox 
            item={active} 
            onClose={() => setActive(null)} 
            language={language}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
