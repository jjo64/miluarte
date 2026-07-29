import { type Variants } from "motion/react";

export const C = {
  bg:        "var(--brand-bg, #17120F)",
  cream:     "var(--brand-cream, #F5EDE0)",
  orange:    "var(--brand-orange, #E55427)",
  blush:     "var(--brand-blush, #EAA898)",
  ink:       "var(--brand-ink, #180E09)",
  dark:      "var(--brand-dark, #0D0908)",
  neon:      "var(--brand-neon, #B4FF2E)",
  musaeWall: "var(--brand-wall, #ECC4B0)",
  cardBg:    "var(--brand-dark, #0D0908)",
  secondary: "var(--brand-secondary, #8A8070)",
};


export const SERIF = "'Fraunces', Georgia, serif";
export const SANS  = "'Space Grotesk', system-ui, sans-serif";

export const RADIUS      = "12px";
export const RADIUS_PILL = "999px";

export const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
};

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.55, ease } },
};

export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease } },
};
