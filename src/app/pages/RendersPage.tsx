import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { C, SERIF, SANS, RADIUS, ease, fadeUp, staggerContainer, staggerItem } from "../tokens";
import { SharedFooter } from "../components/SharedFooter";
import { useLanguage } from "../context/LanguageContext";

// ─── Viewport config ────────────────────────────────────────────────────────
const vp = { once: true, margin: "-60px" } as const;

// ─── Cloudinary images ───────────────────────────────────────────────────────
const IMG_WIREFRAME    = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781815712/Captura_de_pantalla_2026-06-18_224728_qvosll.png";
const IMG_RENDER_FINAL = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811479/Doke_Red_Flag_u1njsw.jpg";
const IMG_3D_A         = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/624072385_18076991993069555_3759238577248943847_n_zjw6f8.jpg";
const IMG_3D_B         = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/532613326_18320483857235254_170206825296032194_n_mcewf6.jpg";
const IMG_3D_C         = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/533637781_18320483821235254_4718922861619683556_n_ddrhz1.jpg";

// ─── Types ───────────────────────────────────────────────────────────────────
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
  imgPos?: string;
  process: { src: string; label: string }[];
  videoSrc?: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const RENDERS: RenderItem[] = [
  {
    id: "stand-feria-01",
    title: "Stand Feria del Mueble",
    client: "Proyecto comercial",
    year: "2024",
    badge: "STAND · FERIA",
    software: ["Blender", "SketchUp"],
    delivery: "Renders + Planos técnicos",
    description:
      "Diseño y visualización completa de stand modular para feria. Del boceto inicial al render fotorrealista listo para fabricación.",
    img: IMG_WIREFRAME,
    imgPos: "50% 30%",
    process: [
      { src: IMG_WIREFRAME,    label: "Blockout 3D" },
      { src: IMG_RENDER_FINAL, label: "Render final" },
    ],
  },
  {
    id: "producto-3d-01",
    title: "Visualización de Producto",
    client: "Diggin' Records",
    year: "2024",
    badge: "PRODUCTO · 3D",
    software: ["Blender", "Photoshop"],
    delivery: "Renders HD + Animación",
    description:
      "Render fotorrealista de producto para campaña musical. Iluminación de estudio y materiales procedurales.",
    img: IMG_RENDER_FINAL,
    imgPos: "50% 50%",
    process: [
      { src: IMG_3D_A,         label: "Referencia" },
      { src: IMG_RENDER_FINAL, label: "Resultado" },
    ],
  },
  {
    id: "arquitectura-01",
    title: "Reconstrucción Arquitectónica",
    client: "Proyecto interno",
    year: "2025",
    badge: "ARQUITECTURA",
    software: ["Blender", "AutoCAD"],
    delivery: "Planos técnicos + Renders",
    description:
      "Reconstrucción y visualización de espacio arquitectónico. Modelado desde planos 2D hasta render ambiental.",
    img: IMG_3D_B,
    imgPos: "50% 20%",
    process: [
      { src: IMG_3D_B, label: "Wireframe" },
      { src: IMG_3D_C, label: "Clay render" },
    ],
  },
  {
    id: "stand-modular-02",
    title: "Módulo Expositivo",
    client: "Cliente B",
    year: "2025",
    badge: "STAND · EXPOSICIÓN",
    software: ["Cinema 4D", "Blender"],
    delivery: "Renders + Animación 360°",
    description:
      "Módulo expositivo polivalente diseñado para múltiples configuraciones. Visualización completa con materiales finales.",
    img: IMG_3D_C,
    imgPos: "50% 15%",
    process: [
      { src: IMG_3D_C,      label: "Modelo 3D" },
      { src: IMG_WIREFRAME, label: "Plano técnico" },
    ],
  },
];

// ─── RenderCard ───────────────────────────────────────────────────────────────
function RenderCard({
  item,
  colSpan,
  onOpen,
}: {
  item: RenderItem;
  colSpan: string;
  onOpen: (item: RenderItem) => void;
}) {
  return (
    <motion.div
      variants={staggerItem}
      className={`${colSpan} relative overflow-hidden cursor-pointer rounded-sm`}
      style={{ aspectRatio: "4/3" }}
      onClick={() => onOpen(item)}
    >
      {/* Main image */}
      <img
        src={item.img}
        alt={item.title}
        style={{ objectPosition: item.imgPos ?? "50% 50%" }}
        className="w-full h-full object-cover brightness-75 hover:brightness-90 hover:scale-105 transition-all duration-700"
      />

      {/* Badge */}
      <span
        className="absolute top-3 right-3 font-sans text-[9px] tracking-widest uppercase rounded-full border border-brand-cream/10"
        style={{
          fontFamily: SANS,
          padding: "4px 10px",
          background: "rgba(0,0,0,0.60)",
          backdropFilter: "blur(4px)",
          color: "rgba(245,237,224,0.80)",
        }}
      >
        {item.badge}
      </span>

      {/* Hover overlay */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 hover:opacity-100 transition-opacity duration-400"
        style={{
          background:
            "linear-gradient(to top, var(--brand-bg, #17120F) 0%, rgba(23,18,15,0.40) 55%, transparent 100%)",
        }}
      >
        <p
          style={{
            fontFamily: SERIF,
            color: C.cream,
            fontSize: "1rem",
            fontWeight: 400,
            lineHeight: 1.2,
            marginBottom: "4px",
          }}
        >
          {item.title}
        </p>
        <p
          style={{
            fontFamily: SANS,
            color: C.blush,
            fontSize: "10px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
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
}: {
  item: RenderItem;
  onClose: () => void;
}) {
  const [ctaHover, setCtaHover] = useState(false);

  // ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const fields: { label: string; value: string }[] = [
    { label: "Cliente",   value: item.client },
    { label: "Año",       value: item.year },
    { label: "Tipo",      value: item.badge },
    { label: "Software",  value: item.software.join(", ") },
    { label: "Entrega",   value: item.delivery },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.88)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.3, ease }}
        className="relative w-full max-w-[860px] max-h-[92vh] overflow-y-auto rounded-t-2xl md:rounded-xl"
        style={{ backgroundColor: C.dark }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex justify-between items-center px-6 py-4"
          style={{
            background: "rgba(13,9,8,0.95)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid rgba(245,237,224,0.08)",
          }}
        >
          <span style={{ fontFamily: SERIF, color: C.cream, fontSize: "1.1rem" }}>
            {item.title}
          </span>
          <button
            onClick={onClose}
            style={{ fontFamily: SANS, color: C.secondary, background: "none", border: "none", cursor: "pointer", fontSize: "1rem" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = C.cream)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = C.secondary)}
          >
            ✕
          </button>
        </div>

        {/* Main image */}
        <img
          src={item.img}
          alt={item.title}
          className="w-full object-cover"
          style={{
            aspectRatio: "16/9",
            objectPosition: item.imgPos ?? "50% 50%",
          }}
        />

        {/* Process strip */}
        {item.process.length > 0 && (
          <div className="px-6 pt-6 pb-4">
            <p
              style={{
                fontFamily: SANS,
                color: C.blush,
                fontSize: "9px",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              EL PROCESO
            </p>
            <div
              className="flex gap-3 pb-2"
              style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
            >
              {item.process.map((step, i) => (
                <div key={i} className="flex-shrink-0 rounded overflow-hidden" style={{ width: "140px" }}>
                  <img
                    src={step.src}
                    alt={step.label}
                    className="w-full object-cover"
                    style={{ aspectRatio: "4/3" }}
                  />
                  <p
                    className="text-center mt-1"
                    style={{
                      fontFamily: SANS,
                      color: C.secondary,
                      fontSize: "9px",
                    }}
                  >
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical sheet */}
        <div
          className="px-6 py-5 grid grid-cols-2 gap-x-6 gap-y-3"
          style={{ borderTop: "1px solid rgba(245,237,224,0.08)" }}
        >
          {fields.map((f) => (
            <div key={f.label}>
              <p
                style={{
                  fontFamily: SANS,
                  color: C.secondary,
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "2px",
                }}
              >
                {f.label}
              </p>
              <p style={{ fontFamily: SANS, color: C.cream, fontSize: "12px" }}>
                {f.value}
              </p>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="px-6 pb-4" style={{ borderTop: "1px solid rgba(245,237,224,0.08)", paddingTop: "16px" }}>
          <p
            style={{
              fontFamily: SANS,
              color: C.secondary,
              fontSize: "13px",
              lineHeight: 1.7,
            }}
          >
            {item.description}
          </p>
        </div>

        {/* CTA button */}
        <div className="mx-6 mb-6">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-booking-modal"))}
            onMouseEnter={() => setCtaHover(true)}
            onMouseLeave={() => setCtaHover(false)}
            style={{
              width: "100%",
              border: `1px solid ${C.blush}`,
              color: ctaHover ? C.ink : C.blush,
              backgroundColor: ctaHover ? C.blush : "transparent",
              fontFamily: SANS,
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              padding: "14px 28px",
              borderRadius: RADIUS,
              cursor: "pointer",
              transition: "background-color 0.28s, color 0.28s",
            }}
          >
            PEDIR UN RENDER SIMILAR →
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── RendersPage ──────────────────────────────────────────────────────────────
export function RendersPage() {
  useLanguage(); // keep context subscribed for future i18n
  const [active, setActive] = useState<RenderItem | null>(null);
  const [ctaHover, setCtaHover] = useState(false);

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "clamp(96px, 12vw, 140px) clamp(20px, 5vw, 56px) clamp(48px, 6vw, 80px)",
        }}
      >
        <div
          className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] items-center"
          style={{ gap: "48px", maxWidth: "1200px", margin: "0 auto" }}
        >
          {/* Left: text */}
          <div>
            {/* Decorative bar */}
            <motion.div
              initial={{ scaleX: 0, originX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={vp}
              transition={{ duration: 0.5, delay: 0.1, ease }}
              className="flex gap-2.5 items-center mb-6"
            >
              <div className="w-8 h-0.5" style={{ backgroundColor: C.blush }} />
              <div className="w-2 h-0.5 opacity-35" style={{ backgroundColor: C.blush }} />
            </motion.div>

            {/* Eyebrow */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={vp}
              style={{
                fontFamily: SANS,
                color: C.blush,
                fontSize: "10px",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              3D &amp; VISUALIZACIÓN
            </motion.p>

            {/* H1 */}
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={vp}
              style={{
                fontFamily: SERIF,
                color: C.cream,
                fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
                fontWeight: 400,
                lineHeight: 0.95,
                whiteSpace: "pre-line",
                marginBottom: "28px",
              }}
            >
              {"Del plano\na la pantalla"}
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={vp}
              style={{
                fontFamily: SANS,
                color: C.secondary,
                fontSize: "14px",
                lineHeight: 1.8,
                maxWidth: "520px",
              }}
            >
              Renders, modelado y visualización de espacios, productos y stands.
              Cada pieza comienza en papel y termina en un mundo tridimensional.
            </motion.p>
          </div>

          {/* Right: hero image */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            style={{ borderRadius: "12px", overflow: "hidden", aspectRatio: "16/9" }}
          >
            <img
              src={IMG_RENDER_FINAL}
              alt="Render 3D destacado"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* ── Grid de renders ───────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: C.dark,
          padding: "clamp(48px, 8vw, 96px) clamp(20px, 5vw, 56px)",
        }}
      >
        {/* Eyebrow */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          style={{
            fontFamily: SANS,
            color: C.blush,
            fontSize: "10px",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            marginBottom: "24px",
          }}
        >
          TRABAJOS
        </motion.p>

        {/* Stagger grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          className="grid grid-cols-1 md:grid-cols-5 gap-1"
        >
          {RENDERS.map((item, i) => {
            // Alternating asymmetric columns: odd indices → 3/2, even indices → 2/3
            const isOdd = i % 2 !== 0;
            const colA = isOdd ? "md:col-span-3" : "md:col-span-2";
            const colB = isOdd ? "md:col-span-2" : "md:col-span-3";
            // Each item occupies one "slot" in pairs
            const colSpan = i % 2 === 0 ? colA : colB;
            return (
              <RenderCard
                key={item.id}
                item={item}
                colSpan={colSpan}
                onOpen={setActive}
              />
            );
          })}
        </motion.div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: C.bg,
          padding: "clamp(72px, 10vw, 120px) clamp(20px, 5vw, 56px)",
          borderTop: "1px solid rgba(245,237,224,0.05)",
        }}
      >
        <div style={{ maxWidth: "760px" }}>
          {/* Eyebrow */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            style={{
              fontFamily: SANS,
              color: C.blush,
              fontSize: "10px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              marginBottom: "20px",
            }}
          >
            ¿NECESITAS VISUALIZAR TU PROYECTO?
          </motion.p>

          {/* H2 */}
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            style={{
              fontFamily: SERIF,
              color: C.cream,
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              fontWeight: 400,
              whiteSpace: "pre-line",
              lineHeight: 1.1,
              marginBottom: "20px",
            }}
          >
            {"Del papel a la pantalla,\nsin sorpresas"}
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            style={{
              fontFamily: SANS,
              color: C.secondary,
              fontSize: "14px",
              lineHeight: 1.8,
              marginBottom: "36px",
              maxWidth: "540px",
            }}
          >
            Presentamos cada proyecto con renders de alta fidelidad antes de pasar
            a producción. Sin ambigüedades, sin revisiones infinitas.
          </motion.p>

          {/* CTA button */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
          >
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-booking-modal"))}
              onMouseEnter={() => setCtaHover(true)}
              onMouseLeave={() => setCtaHover(false)}
              style={{
                backgroundColor: ctaHover ? "rgba(234,168,152,0.85)" : C.blush,
                color: C.ink,
                fontFamily: SANS,
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                padding: "16px 36px",
                borderRadius: RADIUS,
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.25s",
              }}
            >
              Pedir presupuesto
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <SharedFooter />

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {active && (
          <Lightbox item={active} onClose={() => setActive(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
