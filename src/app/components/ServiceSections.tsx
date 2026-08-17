import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { C, SERIF, SANS, RADIUS, ease, fadeUp, staggerContainer, staggerItem } from "../tokens";
import { useLanguage } from "../context/LanguageContext";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { getOptimizedImageUrl } from "../utils/cloudinary";

const artDiggin   = getOptimizedImageUrl("https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/624072385_18076991993069555_3759238577248943847_n_zjw6f8.jpg", 800);
const artMusae    = getOptimizedImageUrl("https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/532613326_18320483857235254_170206825296032194_n_mcewf6.jpg", 800);
const artPortraits = getOptimizedImageUrl("https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/533637781_18320483821235254_4718922861619683556_n_ddrhz1.jpg", 800);

// Cloudinary images for 3D before/after
const IMG_3D_BEFORE = getOptimizedImageUrl("https://res.cloudinary.com/doznr2qm4/image/upload/v1781815712/Captura_de_pantalla_2026-06-18_224728_qvosll.png", 1000);
const IMG_3D_AFTER  = getOptimizedImageUrl("https://res.cloudinary.com/doznr2qm4/image/upload/v1781811479/Doke_Red_Flag_u1njsw.jpg", 1000);

const vp = { once: true, margin: "-60px" } as const;

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
    accent: C.blush,
    slug: "diseno-grafico",
  },
  {
    id: "3d-stands",
    label: "3D & Stands",
    title: "Del plano\na la realidad",
    description: "Diseño y visualización 3D de stands para ferias, productos y espacios. Reconstrucciones arquitectónicas y conversión a planos técnicos listos para fabricación y construcción.",
    bullets: ["Diseño de stands para ferias", "Renders de producto fotorrealistas", "Reconstrucciones arquitectónicas", "Planos técnicos para producción", "Visualización de espacios & interiores"],
    imageLeft: true,
    accent: C.blush,
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
    accent: C.blush,
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
    accent: C.blush,
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
    accent: C.blush,
    slug: "concept-art",
  },
];

// ─── Single service section ───────────────────────────────────────────────────

function ServiceSection({ service, index }: { service: ServiceData; index: number }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [btnH, setBtnH]     = useState(false);
  const [imgH, setImgH]     = useState(false);
  const bg = index % 2 === 0 ? C.bg : C.dark;
  const isDiggin = service.id === "diggin";

  const imageBlock = service.img ? (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={vp}
      transition={{ duration: 0.7, ease }}
      style={{ position: "relative", overflow: "hidden", cursor: "pointer", borderRadius: 12 }}
      onMouseEnter={() => setImgH(true)}
      onMouseLeave={() => setImgH(false)}
    >
      <div style={{ aspectRatio: "4/3", overflow: "hidden", borderRadius: 12 }}>
        <img
          src={service.img}
          alt={service.label}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: service.imgPos || "center",
            transform:  imgH ? "scale(1.06)" : "scale(1)",
            filter:     imgH ? "brightness(0.85) saturate(1.1)" : "brightness(0.75)",
            transition: "transform 0.8s cubic-bezier(0.22,1,0.36,1), filter 0.5s",
            willChange: "transform",
          }}
        />
      </div>
      <div 
        style={{ 
          position: "absolute", 
          bottom: 0, 
          left: 0, 
          right: 0, 
          height: imgH ? 3 : 0, 
          backgroundColor: service.accent,
          transition: "height 0.4s cubic-bezier(0.22,1,0.36,1)",
          borderRadius: "0 0 12px 12px"
        }} 
      />
    </motion.div>
  ) : null;

  const textBlock = (
    <div>
      <motion.div
        initial={{ scaleX: 0, originX: 0 }} whileInView={{ scaleX: 1 }} viewport={vp}
        transition={{ duration: 0.5, ease }}
        style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}
      >
        <div style={{ width: 32, height: 2, backgroundColor: service.accent }} />
        <div style={{ width: 8,  height: 2, backgroundColor: service.accent, opacity: 0.35 }} />
      </motion.div>

      <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
        style={{ fontFamily: SANS, color: service.accent, fontSize: "10px", letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: 12 }}
      >
        {service.label}
      </motion.p>

      <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
        style={{ fontFamily: SERIF, color: C.cream, fontSize: "clamp(1.8rem, 3.6vw, 3rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 20 }}
      >
        {service.title}
      </motion.h2>

      <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
        style={{ fontFamily: SANS, color: C.secondary, fontSize: "14px", lineHeight: 1.8, marginBottom: 24 }}
      >
        {service.description}
      </motion.p>

      {/* Bullets */}
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={vp}
        style={{ display: "flex", flexDirection: "column", marginBottom: 32 }}
      >
        {service.bullets.map((b) => (
          <motion.div 
            key={b} 
            variants={staggerItem} 
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span style={{ color: service.accent, fontSize: "11px", flexShrink: 0 }}>◆</span>
            <span style={{ fontFamily: SANS, color: C.cream, fontSize: "13px", lineHeight: 1.5 }}>{b}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.button
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
        onMouseEnter={() => setBtnH(true)}
        onMouseLeave={() => setBtnH(false)}
        onClick={() => navigate(`/coleccion/${service.slug}`)}
        style={{
          width:           "100%",
          fontFamily:      SANS,
          color:           btnH ? (isDiggin ? C.ink : "#fff") : service.accent,
          backgroundColor: btnH ? service.accent : "transparent",
          fontSize:        "11px",
          letterSpacing:   "0.2em",
          textTransform:   "uppercase",
          border:          `1px solid ${service.accent}`,
          borderRadius:    RADIUS,
          padding:         "14px 28px",
          cursor:          "pointer",
          transition:      "background-color 0.28s, color 0.28s",
          fontWeight:      500,
        }}
      >
        {t("services.viewWorks")}
      </motion.button>
    </div>
  );

  return (
    <section style={{ backgroundColor: bg, padding: "clamp(48px, 8vw, 96px) clamp(20px, 5vw, 56px)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: service.special === "3d-comparison" ? "1fr" : "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: "clamp(32px, 5vw, 64px)",
          alignItems: "center",
        }}
      >
        {service.special === "3d-comparison" ? (
          /* 3D: text on top, full-width comparison below */
          <div>
            <div style={{ maxWidth: 640, marginBottom: 40 }}>{textBlock}</div>
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={vp}
              transition={{ duration: 0.7, ease }}
            >
              <p style={{ fontFamily: SANS, color: C.cream, opacity: 0.3, fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                {t("services.ctaBeforeAfter")}
              </p>
              <BeforeAfterSlider
                beforeSrc={t("servicesImages.stand3dBefore") || IMG_3D_BEFORE}
                afterSrc={t("servicesImages.stand3dAfter") || IMG_3D_AFTER}
                beforeLabel={t("services.render3D")}
                afterLabel={t("services.realResult")}
                height={400}
              />
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
  const { t } = useLanguage();

  const imgDisenoGrafico = t("servicesImages.disenoGrafico") || artDiggin;
  const imgStandBefore    = t("servicesImages.stand3dBefore") || IMG_3D_BEFORE;
  const imgStandAfter     = t("servicesImages.stand3dAfter") || IMG_3D_AFTER;
  const imgDiggin         = t("servicesImages.diggin") || artDiggin;
  const imgIlustracion    = t("servicesImages.ilustracion") || artMusae;
  const imgConceptArt     = t("servicesImages.conceptArt") || artPortraits;

  // Localize services metadata on the fly
  const localizedServices = SERVICES.map((s) => {
    const key = s.slug;
    let dynamicImg = s.img;
    if (s.id === "diseno-grafico") dynamicImg = imgDisenoGrafico;
    if (s.id === "diggin") dynamicImg = imgDiggin;
    if (s.id === "ilustraciones") dynamicImg = imgIlustracion;
    if (s.id === "concept-art") dynamicImg = imgConceptArt;

    return {
      ...s,
      img: dynamicImg,
      label: t(`services.items.${key}.label`) || s.label,
      title: t(`services.items.${key}.title`) || s.title,
      description: t(`services.items.${key}.description`) || s.description,
      bullets: (t(`services.items.${key}.bullets`) as string[]) || s.bullets,
    };
  });

  return (
    <>
      {localizedServices.map((s, i) => (
        <ServiceSection
          key={s.id}
          service={s}
          index={i}
        />
      ))}
    </>
  );
}
