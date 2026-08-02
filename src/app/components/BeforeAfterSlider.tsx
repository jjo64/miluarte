import { useRef, useState, useEffect, useCallback } from "react";
import { C, SANS } from "../tokens";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeAlt?: string;
  afterAlt?: string;
  height?: number;
  beforeFilter?: string;
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "ANTES",
  afterLabel  = "DESPUÉS",
  beforeAlt   = "Antes",
  afterAlt    = "Después",
  height      = 340,
  beforeFilter,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerRect = useRef<DOMRect | null>(null);
  const [pos, setPos]         = useState(0.5);  // 0–1
  const dragging              = useRef(false);

  const updateRect = useCallback(() => {
    if (containerRef.current) {
      containerRect.current = containerRef.current.getBoundingClientRect();
    }
  }, []);

  const getRelativePos = useCallback((clientX: number) => {
    let rect = containerRect.current;
    if (!rect) {
      if (containerRef.current) {
        rect = containerRef.current.getBoundingClientRect();
        containerRect.current = rect;
      }
    }
    if (!rect) return 0.5;
    return Math.min(Math.max((clientX - rect.left) / rect.width, 0.05), 0.95);
  }, []);

  // Recalculate container geometry if window resizes
  useEffect(() => {
    const handleResize = () => {
      containerRect.current = null;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mouse events
  const onMouseDown = useCallback(() => {
    updateRect();
    dragging.current = true;
  }, [updateRect]);

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

  // Touch events — must be added non-passively to allow preventDefault
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchStart = () => {
      updateRect();
      dragging.current = true;
    };
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
  }, [getRelativePos, updateRect]);

  const pct = `${pos * 100}%`;

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      style={{
        position:      "relative",
        width:         "100%",
        height,
        borderRadius:  12,
        overflow:      "hidden",
        cursor:        "ew-resize",
        userSelect:    "none",
        touchAction:   "none",
      }}
    >
      {/* Before */}
      <img
        src={beforeSrc}
        alt={beforeAlt}
        loading="lazy"
        draggable={false}
        style={{
          position:   "absolute",
          inset:      0,
          width:      "100%",
          height:     "100%",
          objectFit:  "cover",
          filter:     beforeFilter,
          pointerEvents: "none",
        }}
      />

      {/* After — clipped to right of handle */}
      <div
        style={{
          position:    "absolute",
          inset:       0,
          overflow:    "hidden",
          clipPath:    `inset(0 0 0 ${pct})`,
          willChange:  "clip-path",
        }}
      >
        <img
          src={afterSrc}
          alt={afterAlt}
          loading="lazy"
          draggable={false}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
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
        {beforeLabel}
      </span>
      <span style={{ position: "absolute", bottom: 12, right: 12, fontFamily: SANS, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.cream, background: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: 4, pointerEvents: "none" }}>
        {afterLabel}
      </span>
    </div>
  );
}
