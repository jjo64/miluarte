import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { ease } from "../tokens";

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
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  // Add event listeners on window during drag for smooth tracking off-container
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    const onTouchMoveWindow = (e: TouchEvent) => {
      if (!isDragging) return;
      handleTouchMove(e);
    };

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchmove", onTouchMoveWindow, { passive: true });
      window.addEventListener("touchend", onMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMoveWindow);
      window.removeEventListener("touchend", onMouseUp);
    };
  }, [isDragging]);

  return (
    <section className="bg-brand-dark py-24 px-6 md:px-10 border-t border-brand-cream/5">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-12 md:gap-16 items-center">
        
        {/* Left column: Text */}
        <div>
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease }}
            className="flex gap-2.5 items-center mb-5"
          >
            <div className="w-8 h-0.5 bg-brand-orange" />
            <div className="w-2 h-0.5 bg-brand-orange opacity-35" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease }}
            className="font-sans text-[10px] tracking-[0.28em] uppercase text-brand-orange mb-4"
          >
            {title}
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease }}
            className="font-serif text-brand-cream text-[2.2rem] md:text-[3.4rem] font-light leading-[1.05] tracking-tight mb-6"
          >
            {subtitle}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, ease }}
            className="font-sans text-brand-cream/55 text-[13px] leading-relaxed mb-6"
          >
            {hint}
          </motion.p>
        </div>

        {/* Right column: Slider container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease }}
          className="relative w-full aspect-[4/3] overflow-hidden select-none border border-brand-cream/10 rounded-xl shadow-2xl cursor-ew-resize"
          ref={containerRef}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
            handleMove(e.clientX);
          }}
          onTouchStart={(e) => {
            setIsDragging(true);
            handleMove(e.touches[0].clientX);
          }}
          data-cursor={hint}
        >
          {/* Final Art (Background) */}
          <div className="absolute inset-0 bg-brand-bg select-none pointer-events-none">
            <img
              src={finalImg}
              alt="Arte final"
              className="w-full h-full object-cover filter brightness-[0.85]"
              style={{ objectPosition: finalImgPos }}
            />
          </div>

          {/* Sketch / Lineart (Overlay layer, clipped horizontally) */}
          <div
            className="absolute inset-0 overflow-hidden select-none pointer-events-none"
            style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
          >
            <img
              src={sketchImg}
              alt="Boceto"
              className="absolute inset-0 w-full h-full object-cover filter saturate-0 contrast-[1.8] brightness-[0.7] invert-[0.1]"
              style={{
                width: containerRef.current?.getBoundingClientRect().width || "100%",
                height: "100%",
                maxWidth: "none",
                objectPosition: sketchImgPos
              }}
            />
          </div>

          {/* Slider line separator */}
          <div
            className="absolute top-0 bottom-0 w-[1.5px] bg-brand-cream/30 pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            {/* Center handle knob */}
            <div 
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-brand-cream/30 flex items-center justify-center shadow-lg transition-transform duration-300 ${
                isDragging ? "scale-110 bg-brand-orange border-brand-orange text-brand-ink" : "bg-[#17120f]/80 text-brand-cream"
              }`}
            >
              <span className="font-sans text-[10px] tracking-normal font-semibold">↔</span>
            </div>
          </div>

          {/* Labels for user feedback */}
          <span className="absolute bottom-4 left-4 z-10 font-sans text-brand-cream/60 text-[9px] tracking-widest uppercase bg-[#17120f]/78 py-1.5 px-3.5 rounded-sm">
            Boceto
          </span>
          <span className="absolute bottom-4 right-4 z-10 font-sans text-brand-cream/60 text-[9px] tracking-widest uppercase bg-[#17120f]/78 py-1.5 px-3.5 rounded-sm">
            Arte Final
          </span>
        </motion.div>

      </div>
    </section>
  );
}
