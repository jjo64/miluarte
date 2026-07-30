import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { C, SANS } from "../tokens";
import { Lightbox, type LightboxItem } from "./Lightbox";

export type { LightboxItem };

interface GalleryGridProps {
  items:       LightboxItem[];
  accent:      string;
  twoColumns?: boolean;
}

function Shimmer() {
  return (
    <>
      <style>{`
        @keyframes shimmer-anim {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }
      `}</style>
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(90deg, #1a1a1a 25%, #242424 50%, #1a1a1a 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer-anim 1.5s infinite",
      }} />
    </>
  );
}

interface GalleryCardProps {
  item:       LightboxItem;
  accent:     string;
  twoColumns: boolean;
  onTap:      () => void;
  index:      number;
}

function GalleryCard({ item, accent, twoColumns, onTap, index }: GalleryCardProps) {
  const [loaded, setLoaded]   = useState(false);
  const [pressed, setPressed] = useState(false);
  const isNeon    = accent === "#C8FF00";
  const badgeText = item.badge || item.series;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px", amount: 0.1 }}
      transition={{
        duration: 0.45,
        delay: Math.min(index, 8) * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        transform: pressed ? "scale(0.97)" : "scale(1)",
        transition: "transform 100ms",
        aspectRatio: twoColumns ? "1/1" : undefined,
        backgroundColor: "#1a1a1a",
      }}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => { setPressed(false); onTap(); }}
      onClick={onTap}
    >
      {!loaded && <Shimmer />}
      <img
        src={item.src}
        alt={item.alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{
          width: "100%",
          height: twoColumns ? "100%" : undefined,
          objectFit: "cover",
          objectPosition: item.imgPos || "center",
          display: "block",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.35s",
        }}
      />
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)",
        pointerEvents: "none",
      }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 14 }}>
          {(item.client || item.year) && (
            <p style={{
              fontFamily: SANS,
              color: accent,
              fontSize: "9px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 4,
              lineHeight: 1,
            }}>
              {[item.client, item.year].filter(Boolean).join(" · ")}
            </p>
          )}
          <p style={{
            fontFamily: SANS,
            color: "#fff",
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: 1.25,
            marginBottom: 4,
          }}>
            {item.title}
          </p>
          {(item.format || item.series) && (
            <p style={{
              fontFamily: SANS,
              color: "rgba(255,255,255,0.6)",
              fontSize: "11px",
              marginBottom: 6,
            }}>
              {item.format || item.series}
            </p>
          )}
          {badgeText && (
            <span style={{
              display: "inline-block",
              backgroundColor: accent,
              color: isNeon ? C.ink : "#fff",
              fontFamily: SANS,
              fontSize: "8px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "3px 8px",
              borderRadius: "999px",
            }}>
              {badgeText}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function GalleryGrid({ items, accent, twoColumns = false }: GalleryGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <section style={{
      padding: "clamp(32px, 5vw, 64px) 0",
      backgroundColor: C.bg,
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: twoColumns
          ? "repeat(2, 1fr)"
          : "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
        gap: twoColumns ? 8 : 12,
        padding: "0 20px 48px",
      }}>
        {items.map((item, i) => (
          <GalleryCard
            key={item.src + i}
            item={item}
            accent={accent}
            twoColumns={twoColumns}
            index={i}
            onTap={() => setSelectedIndex(i)}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <Lightbox
            items={items}
            initialIndex={selectedIndex}
            accent={accent}
            onClose={() => setSelectedIndex(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
