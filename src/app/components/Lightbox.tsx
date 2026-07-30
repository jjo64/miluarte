import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { C, SANS, ease } from "../tokens";

export interface LightboxItem {
  src:          string;
  alt:          string;
  imgPos?:      string;
  title?:       string;
  year?:        string;
  series?:      string;
  format?:      string;
  badge?:       string;
  client?:      string;
  description?: string;
}

interface LightboxProps {
  items:        LightboxItem[];
  initialIndex: number;
  accent:       string;
  onClose:      () => void;
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

export function Lightbox({ items, initialIndex, accent, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex);
  const [loaded, setLoaded] = useState(false);

  const item = items[current];
  const hasPrev = current > 0;
  const hasNext = current < items.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) setCurrent((c) => c - 1);
  }, [hasPrev]);

  const goNext = useCallback(() => {
    if (hasNext) setCurrent((c) => c + 1);
  }, [hasNext]);

  // Reset loaded state when current changes
  useEffect(() => {
    setLoaded(false);
  }, [current]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft")  goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Escape")     onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goPrev, goNext, onClose]);

  // Counter label e.g. "01 / 07"
  const counter = `${String(current + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        backgroundColor: "rgba(0,0,0,0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key="lightbox-container"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.25, ease }}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: 880,
            width: "90vw",
            maxHeight: "90vh",
            overflowY: "auto",
            backgroundColor: C.dark,
            borderRadius: 16,
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Sticky header */}
          <div style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: "rgba(13,9,8,0.95)",
            backdropFilter: "blur(8px)",
            padding: "14px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}>
            {/* Counter */}
            <span style={{
              fontFamily: SANS,
              color: C.secondary,
              fontSize: 11,
              letterSpacing: "0.08em",
              minWidth: 48,
            }}>
              {counter}
            </span>

            {/* Title (absolutely centered) */}
            <span style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: SANS,
              color: C.cream,
              fontSize: 13,
              fontWeight: 500,
              maxWidth: "55%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {item.title ?? ""}
            </span>

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                fontFamily: SANS,
                color: C.secondary,
                fontSize: 18,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0 4px",
                lineHeight: 1,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.cream)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.secondary)}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Image wrapper with nav buttons */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            {!loaded && <Shimmer />}
            <img
              key={item.src}
              src={item.src}
              alt={item.alt}
              onLoad={() => setLoaded(true)}
              style={{
                width: "100%",
                aspectRatio: "4/3",
                objectFit: "cover",
                objectPosition: item.imgPos || "center",
                display: "block",
                opacity: loaded ? 1 : 0,
                transition: "opacity 0.35s",
              }}
            />

            {/* Prev button */}
            {hasPrev && (
              <button
                onClick={goPrev}
                aria-label="Anterior"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 12,
                  transform: "translateY(-50%)",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: C.cream,
                  cursor: "pointer",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                ‹
              </button>
            )}

            {/* Next button */}
            {hasNext && (
              <button
                onClick={goNext}
                aria-label="Siguiente"
                style={{
                  position: "absolute",
                  top: "50%",
                  right: 12,
                  transform: "translateY(-50%)",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: C.cream,
                  cursor: "pointer",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                ›
              </button>
            )}
          </div>

          {/* Info section */}
          <div style={{ padding: "20px 20px 8px" }}>
            {(item.series || item.year) && (
              <p style={{
                fontFamily: SANS,
                color: accent,
                fontSize: 9,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                marginBottom: 6,
                lineHeight: 1,
              }}>
                {[item.series, item.year].filter(Boolean).join(" · ")}
              </p>
            )}

            {item.description && (
              <p style={{
                fontFamily: SANS,
                color: C.secondary,
                fontSize: 13,
                lineHeight: 1.7,
                marginTop: 8,
              }}>
                {item.description}
              </p>
            )}

            {item.format && (
              <p style={{
                fontFamily: SANS,
                color: C.secondary,
                fontSize: 12,
                marginTop: 6,
              }}>
                {item.format}
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
