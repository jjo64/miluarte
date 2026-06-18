import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function CursorFollower() {
  const [hoveredText, setHoveredText] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Motion values for raw mouse coordinates
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth spring physics for inertia
  const springConfig = { damping: 30, stiffness: 220, mass: 0.6 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Only enable cursor follower on devices with a fine pointer (mouse/stylus)
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setIsDesktop(mediaQuery.matches);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 16); // Center the 32px cursor
      mouseY.set(e.clientY - 16);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Event delegation to catch data-cursor hovers dynamically
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const element = target?.closest("[data-cursor]");
      const cursorAttr = element?.getAttribute("data-cursor");
      if (cursorAttr) {
        setHoveredText(cursorAttr);
        setIsHovered(true);
      } else {
        setHoveredText("");
        setIsHovered(false);
      }
    };

    if (mediaQuery.matches) {
      window.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseleave", handleMouseLeave);
      document.addEventListener("mouseenter", handleMouseEnter);
      window.addEventListener("mouseover", handleMouseOver);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [isVisible, mouseX, mouseY]);

  if (!isDesktop || !isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] border border-brand-blush/50 flex items-center justify-center select-none"
      style={{
        x: cursorX,
        y: cursorY,
        backgroundColor: isHovered ? "rgba(234, 168, 152, 0.22)" : "rgba(234, 168, 152, 0.05)",
      }}
      animate={{
        scale: isHovered ? 2.2 : 1,
        borderColor: isHovered ? "rgba(234, 168, 152, 0.8)" : "rgba(234, 168, 152, 0.4)",
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {isHovered && hoveredText && (
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          className="font-sans text-[5.5px] font-bold tracking-[0.2em] uppercase text-brand-cream bg-brand-ink/75 px-1.5 py-0.5 rounded-sm whitespace-nowrap shadow-sm border border-brand-cream/5"
        >
          {hoveredText}
        </motion.span>
      )}
    </motion.div>
  );
}
