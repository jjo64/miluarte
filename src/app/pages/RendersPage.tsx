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

import { RENDERS, RenderItem } from "../data/rendersData";
export { RENDERS };
export type { RenderItem };

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

// Helper para renderizar cualquier tipo de video (YouTube, Vimeo, Drive o MP4)
function renderUniversalVideo(url?: string, poster?: string, className: string = "w-full max-h-[60vh] object-contain bg-black") {
  if (!url) return null;

  // 1. YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return (
      <div className="w-full aspect-video max-h-[60vh] bg-black flex items-center justify-center">
        <iframe
          src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`}
          title="Video Player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  // 2. Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return (
      <div className="w-full aspect-video max-h-[60vh] bg-black flex items-center justify-center">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`}
          title="Vimeo Player"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  // 3. Google Drive preview
  if (url.includes("drive.google.com")) {
    const driveEmbed = url.replace(/\/view(\?.*)?$/, "/preview");
    return (
      <div className="w-full aspect-video max-h-[60vh] bg-black flex items-center justify-center">
        <iframe
          src={driveEmbed}
          title="Google Drive Player"
          allow="autoplay"
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  // 4. Video directo MP4/WebM
  return (
    <video
      controls
      autoPlay
      className={className}
      poster={poster}
    >
      <source src={url} type="video/mp4" />
      <source src={url} type="video/webm" />
    </video>
  );
}

// ─── RenderLightbox ───────────────────────────────────────────────────────────
function RenderLightbox({
  item,
  onClose,
  isTouch,
}: {
  item: RenderItem | null;
  onClose: () => void;
  isTouch: boolean;
}) {
  const { language } = useLanguage();
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (item) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 overflow-hidden">
      {/* Backdrop oscuro */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        className="absolute inset-0 bg-black cursor-pointer"
      />

      {/* Contenedor del Lightbox (Scale y Fade) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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

        {/* Bloque 1 - El render o Video */}
        <div className="w-full bg-black flex items-center justify-center relative overflow-hidden">
          {item.videoSrcMp4 ? (
            renderUniversalVideo(item.videoSrcMp4, getOptimizedImageUrl(item.img, 1200))
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

        {/* Bloque 2 - El Proceso de Trabajo */}
        <div className="p-6 md:p-8 bg-brand-dark" style={{ backgroundColor: "var(--brand-dark, #0D0908)" }}>
          <div className="max-w-[720px] mx-auto">
            
            {/* Descripción del Proyecto */}
            <div className="mb-8">
              <h3 className="font-serif text-[#F5EDE0] text-lg mb-2 font-normal" style={{ fontFamily: PLAYFAIR }}>
                {language === "es" ? "Concepto del Proyecto" : "Project Concept"}
              </h3>
              <p className="font-sans text-xs md:text-sm text-brand-cream/70 leading-relaxed" style={{ fontFamily: DMSANS }}>
                {item.description}
              </p>
            </div>

            {/* Subsección: Proceso (4 pasos) */}
            {item.process && item.process.length > 0 && (
              <div className="mb-8">
                <h4 className="font-sans text-[10px] font-bold tracking-wider text-brand-secondary uppercase mb-4" style={{ fontFamily: DMSANS, color: "var(--brand-secondary, #8A8070)" }}>
                  {language === "es" ? "Fases del desarrollo" : "Development stages"}
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {item.process.map((step, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black/40 border border-brand-cream/10 relative group">
                        <img 
                          src={getOptimizedImageUrl(step.src, 400)} 
                          alt={step.label}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute top-1.5 left-1.5 font-sans text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-brand-cream/90" style={{ fontFamily: DMSANS }}>
                          0{i + 1}
                        </span>
                      </div>
                      <p className="font-sans text-[11px] text-brand-cream/80 font-medium truncate" style={{ fontFamily: DMSANS }}>
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subsección: Vídeo making of (Opcional) */}
            {item.makingOfVideoMp4 && (
              <div className="mb-6">
                <h4 className="font-sans text-[10px] font-bold tracking-wider text-brand-secondary uppercase mb-3" style={{ fontFamily: DMSANS, color: "var(--brand-secondary, #8A8070)" }}>
                  {language === "es" ? "Vídeo making of" : "Making of video"}
                </h4>
                <div className="w-full rounded-lg overflow-hidden border border-brand-cream/10 bg-black">
                  {renderUniversalVideo(item.makingOfVideoMp4, undefined, "w-full max-h-[30vh] object-cover")}
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
                poster={getOptimizedImageUrl("https://res.cloudinary.com/doznr2qm4/image/upload/v1781811479/miluarte/renders/Doke_Red_Flag_u1njsw.jpg", 1000)}
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
          <RenderLightbox 
            item={active} 
            onClose={() => setActive(null)} 
            isTouch={isTouch}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
