import { type CSSProperties, useState } from "react";
import { motion } from "motion/react";
import { C, SANS, SERIF, fadeUp } from "../tokens";
import { useLanguage } from "../context/LanguageContext";

const CLIENTS = [
  "DIGGIN' RECORDS",
  "PASTA YA",
  "ESTUDIO NOVA",
  "GALERÍA LUMEN",
  "ANIMAS PROJECT",
  "COLECTIVO TINTA",
];

const vp = { once: true, margin: "-50px" } as const;

const logoStyle = (paused: boolean): CSSProperties => ({
  display:           "flex",
  alignItems:        "center",
  gap:               16,
  animation:         `marquee-scroll 30s linear infinite`,
  animationPlayState: paused ? "paused" : "running",
  willChange:        "transform",
  flexShrink:        0,
});

export function ClientsMarquee() {
  const [paused, setPaused] = useState(false);
  const { t } = useLanguage();

  return (
    <section style={{ backgroundColor: C.dark, padding: "72px 0", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>

      {/* Header */}
      <div style={{ padding: "0 20px", marginBottom: 44, textAlign: "center" }}>
        <motion.p
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
          style={{ fontFamily: SANS, color: C.blush, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
        >
          <span style={{ width: 2, height: 16, backgroundColor: C.blush, display: "inline-block" }} />
          {t("clients.eyebrow") || "CLIENTES & COLABORACIONES"}
        </motion.p>

        <motion.h2
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
          style={{ fontFamily: SERIF, color: C.cream, fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 400, lineHeight: 1.2, marginBottom: 12 }}
        >
          {t("clients.title") || "Marcas, sellos y proyectos con los que he trabajado"}
        </motion.h2>

        <motion.p
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
          style={{ fontFamily: SANS, color: C.secondary, fontSize: "14px", lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}
        >
          {t("clients.description") || "He colaborado con músicos, marcas y proyectos creativos desarrollando identidades visuales e ilustraciones personalizadas."}
        </motion.p>
      </div>

      {/* Marquee */}
      <div
        style={{ overflow: "hidden", cursor: "default" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {/* Two copies for seamless loop */}
        <div style={{ display: "flex", width: "max-content" }}>
          <div style={logoStyle(paused)}>
            {[...CLIENTS, ...CLIENTS].map((name, i) => (
              <LogoChip key={i} name={name} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoChip({ name }: { name: string }) {
  return (
    <div
      style={{
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        border:          "1px solid rgba(255,255,255,0.1)",
        borderRadius:    8,
        padding:         "12px 20px",
        whiteSpace:      "nowrap",
        fontFamily:      SANS,
        fontSize:        "11px",
        letterSpacing:   "0.12em",
        textTransform:   "uppercase",
        color:           "var(--brand-cream, rgba(255,255,255,0.4))",
        opacity:         0.4,
        marginRight:     16,
        flexShrink:      0,
      }}
    >
      {name}
    </div>
  );
}
