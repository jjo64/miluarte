import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { C, SANS, SERIF, RADIUS, ease, fadeUp } from "../tokens";

interface SketchSliderProps {
  sketchImg: string;
  finalImg: string;
  title: string;
  subtitle: string;
  hint: string;
  sketchImgPos?: string;
  finalImgPos?: string;
}

export function SketchSlider({ 
  sketchImg, 
  finalImg, 
  title, 
  subtitle, 
  hint,
  sketchImgPos = "50% 12%",
  finalImgPos = "50% 12%"
}: SketchSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos]         = useState(0.5);  // 0–1
  const dragging              = useRef(false);

  const getRelativePos = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return 0.5;
    return Math.min(Math.max((clientX - rect.left) / rect.width, 0.05), 0.95);
  }, []);

  const onMouseDown = useCallback(() => { dragging.current = true; }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos(getRelativePos(e.clientX));
    };
    const onMouseUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [getRelativePos]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchStart = () => { dragging.current = true; };
    const onTouchMove  = (e: TouchEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      e.stopPropagation();
      setPos(getRelativePos(e.touches[0].clientX));
    };
    const onTouchEnd = () => { dragging.current = false; };

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove",  onTouchMove,  { passive: false });
    container.addEventListener("touchend",   onTouchEnd);

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove",  onTouchMove);
      container.removeEventListener("touchend",   onTouchEnd);
    };
  }, [getRelativePos]);

  const pct = `${pos * 100}%`;
  const vp = { once: true, margin: "-60px" } as const;

  return (
    <section style={{ backgroundColor: C.bg, padding: "80px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        
        {/* Eyebrow */}
        <motion.p
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
          style={{ fontFamily: SANS, color: C.blush, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}
        >
          <span style={{ width: 2, height: 16, backgroundColor: C.blush, display: "inline-block" }} />
          {title}
        </motion.p>

        {/* Subtitle */}
        <motion.h2
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
          style={{ fontFamily: SERIF, color: C.cream, fontSize: "clamp(1.8rem, 6vw, 2.8rem)", fontWeight: 400, lineHeight: 1.15, marginBottom: 16 }}
        >
          {subtitle}
        </motion.h2>

        {/* Hint text */}
        <motion.p
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp}
          style={{ fontFamily: SANS, color: C.secondary, fontSize: "14px", lineHeight: 1.7, marginBottom: 32 }}
        >
          {hint}
        </motion.p>

        {/* Slider container */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={vp}
          transition={{ duration: 0.7, ease }}
          ref={containerRef}
          onMouseDown={onMouseDown}
          style={{
            position:      "relative",
            width:         "100%",
            height:        340,
            borderRadius:  12,
            overflow:      "hidden",
            cursor:        "ew-resize",
            userSelect:    "none",
            touchAction:   "none",
          }}
        >
          {/* Final Art (Background / After) */}
          <img
            src={finalImg}
            alt="Arte final"
            loading="lazy"
            draggable={false}
            style={{
              position:   "absolute",
              inset:      0,
              width:      "100%",
              height:     "100%",
              objectFit:  "cover",
              objectPosition: finalImgPos,
              filter:     "brightness(0.85)",
              pointerEvents: "none",
            }}
          />

          {/* Sketch / Lineart (Clipped overlay / Before) */}
          <div
            style={{
              position:    "absolute",
              inset:       0,
              overflow:    "hidden",
              clipPath:    `polygon(0 0, ${pct} 0, ${pct} 100%, 0 100%)`,
              willChange:  "clip-path",
            }}
          >
            <img
              src={sketchImg}
              alt="Boceto"
              loading="lazy"
              draggable={false}
              style={{
                position:   "absolute",
                inset:      0,
                width:      "100%",
                height:     "100%",
                objectFit:  "cover",
                objectPosition: sketchImgPos,
                filter:     "saturate(0) contrast(1.8) brightness(0.7) invert(0.1)",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Divider line */}
          <div
            style={{
              position:        "absolute",
              top:             0,
              bottom:          0,
              left:            pct,
              width:           2,
              backgroundColor: C.cream,
              transform:       "translateX(-50%)",
              willChange:      "left",
              pointerEvents:   "none",
            }}
          />

          {/* Handle circle */}
          <div
            style={{
              position:        "absolute",
              top:             "50%",
              left:            pct,
              transform:       "translate(-50%, -50%)",
              width:           36,
              height:          36,
              borderRadius:    "50%",
              backgroundColor: C.cream,
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "center",
              fontFamily:      SANS,
              fontSize:        "13px",
              color:           C.ink,
              fontWeight:      600,
              boxShadow:       "0 2px 12px rgba(0,0,0,0.45)",
              willChange:      "left",
              pointerEvents:   "none",
            }}
          >
            ↔
          </div>

          {/* Labels */}
          <span style={{ position: "absolute", bottom: 12, left: 12, fontFamily: SANS, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.cream, background: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: 4, pointerEvents: "none" }}>
            Boceto
          </span>
          <span style={{ position: "absolute", bottom: 12, right: 12, fontFamily: SANS, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.cream, background: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: 4, pointerEvents: "none" }}>
            Arte Final
          </span>

        </motion.div>
      </div>
    </section>
  );
}
