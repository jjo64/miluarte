import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { C, SERIF, SANS, fadeUp } from "../tokens";
import { CollectionHeader } from "../components/CollectionHeader";
import { GalleryGrid, type LightboxItem } from "../components/GalleryGrid";

import artDiggin    from "../../imports/Screenshot_20260617_125406_Chrome.jpg";
import artMusae     from "../../imports/Screenshot_20260617_125349_Chrome.jpg";
import artPortraits from "../../imports/Screenshot_20260617_125359_Chrome.jpg";
import artFireGirl  from "../../imports/Screenshot_20260617_125355_Chrome.jpg";

const vp = { once: true, margin: "-50px" } as const;

// ─── Per-slug configuration ───────────────────────────────────────────────────

interface SlugConfig {
  label:       string;
  title:       string;
  description: string;
  accent:      string;
  twoColumns:  boolean;
  items:       LightboxItem[];
  ctaText?:    string;
}

const CONFIGS: Record<string, SlugConfig> = {
  diggin: {
    label:       "SELLO MUSICAL · DIRECCIÓN DE ARTE",
    title:       "Diggin'",
    description: "Portadas, identidad y dirección de arte para el sello independiente Diggin'. Graffiti, psicodelia y hip-hop en formato visual.",
    accent:      C.neon,
    twoColumns:  true,
    ctaText:     "¿Tu sello necesita identidad visual?",
    items: [
      { src: artDiggin, alt: "Smokin' On EP",   title: "Smokin' On EP",   client: "Tom Hodges", year: "2024", format: "12\" Vinyl / Digital", badge: "PROYECTO MUSICAL", description: "Portada y diseño completo para el EP de debut de Tom Hodges en Diggin' Records." },
      { src: artDiggin, alt: "Dancing Around",  title: "Dancing Around",  client: "Castiho",    year: "2024", format: "Digital Single",        badge: "PROYECTO MUSICAL", description: "Single artwork con estética psicodélica y referencias al arte graffiti." },
      { src: artDiggin, alt: "Sundance EP",     title: "Sundance EP",     client: "Art No Legia", year: "2024", format: "EP Digital",          badge: "PROYECTO MUSICAL" },
      { src: artDiggin, alt: "Vibin' EP",       title: "Vibin' EP",       client: "Eros",       year: "2023", format: "EP Digital",            badge: "PROYECTO MUSICAL" },
      { src: artDiggin, alt: "Red Flager",      title: "Red Flager",      client: "Doke",       year: "2023", format: "12\" Vinyl",            badge: "PROYECTO MUSICAL" },
      { src: artDiggin, alt: "Remember Again",  title: "Remember Again",  client: "Cyava",      year: "2023", format: "Album Digital",         badge: "PROYECTO MUSICAL" },
      { src: artDiggin, alt: "Night Heroes",    title: "Night Heroes",    client: "Rokke",      year: "2024", format: "EP Digital",            badge: "PROYECTO MUSICAL" },
    ],
  },

  ilustracion: {
    label:       "OBRA PERSONAL",
    title:       "Ilustración",
    description: "Obra personal que explora la tensión entre forma y vacío. Series que se construyen desde la intuición y se resuelven en el material. Cada pieza es un estado, no una conclusión.",
    accent:      C.orange,
    twoColumns:  false,
    items: [
      { src: artMusae,     alt: "Musae I",    title: "Musae I",      series: "SERIE MUSAE", description: "Primera pieza de la serie Musae. Retrato interior de una figura entre la lluvia y el fuego." },
      { src: artPortraits, alt: "Retrato",    title: "Retrato",      series: "OBRA LIBRE",  description: "Serie de retratos experimentales sobre identidad y forma." },
      { src: artFireGirl,  alt: "Llamas",     title: "Llamas",       series: "SERIE MUSAE", description: "Figura femenina entre llamas. Transformación y renacimiento." },
      { src: artMusae,     alt: "Musae II",   title: "Musae II",     series: "SERIE MUSAE" },
      { src: artPortraits, alt: "Musae III",  title: "Musae III",    series: "SERIE MUSAE" },
      { src: artFireGirl,  alt: "Sin título", title: "Sin título",   series: "OBRA LIBRE" },
    ],
  },

  "concept-art": {
    label:       "DESARROLLO VISUAL",
    title:       "Concept Art",
    description: "Concept art e ilustración editorial. Personajes, atmósferas y narrativa visual construidos desde la emoción.",
    accent:      C.orange,
    twoColumns:  false,
    items: [
      { src: artPortraits, alt: "Personaje A",  title: "Concept — Personaje A",    series: "CONCEPT ART", description: "Diseño de personaje con ficha técnica completa y variantes de color." },
      { src: artMusae,     alt: "Escenario",    title: "Escenario — Bosque oscuro", series: "CONCEPT ART" },
      { src: artFireGirl,  alt: "Personaje B",  title: "Concept — Personaje B",    series: "CONCEPT ART" },
      { src: artPortraits, alt: "Props",        title: "Props — Artefactos",        series: "CONCEPT ART" },
    ],
  },

  "diseno-grafico": {
    label:       "IDENTIDAD VISUAL",
    title:       "Diseño Gráfico",
    description: "Desde el logotipo hasta el catálogo completo. Banners, publicidad, retoque y composición fotográfica con Photoshop.",
    accent:      C.blush,
    twoColumns:  false,
    items: [
      { src: artDiggin,    alt: "Logotipo",  title: "Identidad corporativa", client: "Cliente A", year: "2024" },
      { src: artPortraits, alt: "Catálogo",  title: "Catálogo editorial",    client: "Cliente B", year: "2024" },
      { src: artMusae,     alt: "Banner",    title: "Banner publicitario",   client: "Cliente C", year: "2025" },
    ],
  },

  "3d-stands": {
    label:       "3D & VISUALIZACIÓN",
    title:       "3D & Stands",
    description: "Diseño y visualización 3D de stands para ferias, productos y espacios. Reconstrucciones arquitectónicas y planos técnicos para fabricación.",
    accent:      C.orange,
    twoColumns:  false,
    items: [
      { src: artDiggin,    alt: "Stand 1",  title: "Stand Feria del Mueble", client: "Cliente A", year: "2024", badge: "STAND · FERIA" },
      { src: artPortraits, alt: "Stand 2",  title: "Módulo Expositivo",      client: "Cliente B", year: "2025", badge: "ARQUITECTURA" },
      { src: artMusae,     alt: "Render 3D", title: "Producto 3D",           client: "Cliente C", year: "2024", badge: "PRODUCTO · 3D" },
    ],
  },
};

const FALLBACK: SlugConfig = {
  label: "COLECCIÓN", title: "Obras", description: "Selección de trabajos de Nerea.",
  accent: C.orange, twoColumns: false, items: [],
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate  = useNavigate();
  const cfg       = (slug && CONFIGS[slug]) ? CONFIGS[slug] : FALLBACK;
  const [btnH, setBtnH] = useState(false);

  return (
    <div style={{ backgroundColor: C.bg, color: C.cream, minHeight: "100dvh" }}>
      <CollectionHeader
        label={cfg.label}
        title={cfg.title}
        description={cfg.description}
        accent={cfg.accent}
      />

      {cfg.items.length > 0 ? (
        <GalleryGrid items={cfg.items} accent={cfg.accent} twoColumns={cfg.twoColumns} />
      ) : (
        <div style={{ padding: "48px 20px", textAlign: "center" }}>
          <p style={{ fontFamily: SANS, color: C.secondary, fontSize: "14px" }}>Pronto habrá trabajos aquí.</p>
        </div>
      )}

      {/* Bottom CTA */}
      <section style={{ padding: "72px 20px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {cfg.ctaText && (
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
            style={{ fontFamily: SERIF, color: C.cream, fontSize: "clamp(1.5rem, 5vw, 2.4rem)", fontWeight: 400, lineHeight: 1.15, marginBottom: 32 }}>
            {cfg.ctaText}
          </motion.h2>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <motion.a variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
            href="mailto:Miluartedenara@gmail.com"
            style={{ display: "inline-block", fontFamily: SANS, backgroundColor: C.orange, color: "#fff", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", padding: "15px 32px", borderRadius: 8, textDecoration: "none", fontWeight: 500 }}>
            PIDE PRESUPUESTO
          </motion.a>

          <motion.button variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
            onClick={() => navigate(-1)}
            onMouseEnter={() => setBtnH(true)}
            onMouseLeave={() => setBtnH(false)}
            style={{ fontFamily: SANS, color: btnH ? C.cream : C.secondary, background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "15px 24px", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", transition: "color 0.25s" }}>
            ← Volver
          </motion.button>
        </div>
      </section>
    </div>
  );
}
