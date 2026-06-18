import { type Variants } from "motion/react";

export const C = {
  bg:        "#17120F",
  cream:     "#F5EDE0",
  orange:    "#E55427",
  blush:     "#EAA898",
  ink:       "#180E09",
  dark:      "#0D0908",
  neon:      "#B4FF2E",
  musaeWall: "#ECC4B0",
};

export const SERIF = "'Fraunces', Georgia, serif";
export const SANS  = "'Space Grotesk', system-ui, sans-serif";

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
