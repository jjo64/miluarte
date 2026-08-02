import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { gsap } from "gsap";
import { ArrowUpRight, Sun, Moon } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { getOptimizedImageUrl } from "../utils/cloudinary";

// ─── Navigation types ───────────────────────────────────────────────────────

type NavLink =
  | { label: string; path: string; external?: false; thumbnail?: string }
  | { label: string; href: string; external: true; thumbnail?: string }
  | { label: string; onClick: () => void; external?: never; thumbnail?: string };

interface NavCard {
  label: string;
  bgColor: string;
  links: NavLink[];
}


// ─── Component ────────────────────────────────────────────────────────────────

function LanguageToggle({ variant = "full" }: { variant?: "full" | "compact" }) {
  const { language, setLanguage } = useLanguage();

  if (variant === "compact") {
    // Single-button pill for the top bar: shows current language, tap to switch.
    // Saves the horizontal space the old two-button pill needed.
    const other = language === "es" ? "en" : "es";
    return (
      <button
        onClick={() => setLanguage(other)}
        className="flex items-center justify-center w-8 h-8 bg-brand-cream/5 border border-brand-cream/10 rounded-lg text-brand-cream text-[10px] font-bold tracking-wider hover:bg-brand-cream/10 transition-colors duration-300 cursor-pointer shrink-0"
        aria-label={`Cambiar idioma a ${other === "es" ? "Español" : "English"}`}
      >
        {language.toUpperCase()}
      </button>
    );
  }

  // Full two-button pill, used inside the expanded menu where there's room
  return (
    <div className="flex items-center bg-brand-cream/5 border border-brand-cream/10 rounded-lg p-1 gap-1 relative shrink-0">
      <button
        onClick={() => setLanguage("es")}
        className={`flex-1 px-3 py-1.5 text-xs font-bold tracking-wider rounded-md transition-all duration-300 cursor-pointer ${
          language === "es"
            ? "bg-brand-orange text-brand-bg shadow-sm"
            : "text-brand-cream/60 hover:text-brand-cream"
        }`}
      >
        ES
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`flex-1 px-3 py-1.5 text-xs font-bold tracking-wider rounded-md transition-all duration-300 cursor-pointer ${
          language === "en"
            ? "bg-brand-orange text-brand-bg shadow-sm"
            : "text-brand-cream/60 hover:text-brand-cream"
        }`}
      >
        EN
      </button>
    </div>
  );
}

function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-8 h-8 flex items-center justify-center rounded-lg bg-brand-cream/5 border border-brand-cream/10 text-brand-cream hover:bg-brand-cream/10 transition-colors duration-300 cursor-pointer overflow-hidden shrink-0 ${className}`}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
    >
      <motion.div
        animate={{
          rotate: isDark ? 0 : 90,
          scale: isDark ? 1 : 0,
          opacity: isDark ? 1 : 0,
        }}
        transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
        className="absolute"
      >
        <Moon size={14} />
      </motion.div>
      <motion.div
        animate={{
          rotate: isDark ? -90 : 0,
          scale: isDark ? 0 : 1,
          opacity: isDark ? 0 : 1,
        }}
        transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
        className="absolute"
      >
        <Sun size={14} className="text-brand-orange" />
      </motion.div>
    </button>
  );
}

export function SharedHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  
  const [isOpen, setIsOpen]     = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navRef   = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef    = useRef<gsap.core.Timeline | null>(null);
  const lastWidthRef = useRef(window.innerWidth);
  const expandedRef  = useRef(expanded);

  expandedRef.current = expanded;

  const navCards: NavCard[] = [
    {
      label: t("nav.services"),
      bgColor: theme === "dark" ? "#211B14" : "#EADFD0",
      links: [
        { label: t("services.items.diseno-grafico.label"),  path: "/coleccion/diseno-grafico" },
        { label: t("services.items.3d-stands.label"),     path: "/renders" },
        { label: "Diggin'",         path: "/coleccion/diggin" },
        { label: t("services.items.ilustracion.label"),     path: "/coleccion/ilustracion" },
        { label: t("services.items.concept-art.label"),   path: "/coleccion/concept-art" },
      ],
    },
    {
      label: t("nav.projects"),
      bgColor: theme === "dark" ? "#17120F" : "#FAF6F0",
      links: [
        { 
          label: "Serie Musae", 
          path: "/coleccion/ilustracion",
          thumbnail: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781821775/musae_dkbruz.jpg" 
        },
        { 
          label: "Diggin' label", 
          path: "/coleccion/diggin",
          thumbnail: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811474/Tom_Hodges_-_Smokin_On_EP_eflsuv.jpg" 
        },
        { 
          label: "Animas", 
          path: "/coleccion/animas",
          thumbnail: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820062/1_Melisa_Completo_nwlyro.jpg" 
        },
        { 
          label: "Retratos y más", 
          path: "/coleccion/retratos",
          thumbnail: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820993/2-Retrato-Anna-Karina_cb505e.jpg" 
        },
        { 
          label: "Pasta Ya", 
          path: "/coleccion/pasta-ya",
          thumbnail: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781821171/Bravioli-el-bravo-y-Tortastini_m1owbr.jpg" 
        },
      ],
    },
    {
      label: t("nav.contact"),
      bgColor: theme === "dark" ? "#0D0908" : "#E5D9C8",
      links: [
        { 
          label: "Miluartedenara@gmail.com", 
          onClick: () => window.dispatchEvent(new CustomEvent("open-contact-modal")) 
        },
        { label: "Instagram",       href: "https://www.instagram.com/naraneko13/", external: true },
        { label: "LinkedIn",        href: "https://www.linkedin.com/in/nerealucaspajares4815162342/", external: true },
        { label: t("nav.resume"),   path: "/resume" },
      ],
    },
  ];

  const isMobile = () => window.innerWidth < 768;

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 360;
    // On mobile, limit the menu to 85vh so it never overflows the screen
    const maxH = isMobile() ? window.innerHeight * 0.85 : Infinity;
    const contentEl = navEl.querySelector<HTMLElement>(".card-nav-content");
    const controlsEl = navEl.querySelector<HTMLElement>(".mobile-controls-row");
    const controlsH = controlsEl && isMobile() ? controlsEl.offsetHeight : 0;
    if (contentEl) {
      const prev = { 
        vis: contentEl.style.visibility, 
        pe: contentEl.style.pointerEvents, 
        pos: contentEl.style.position, 
        h: contentEl.style.height 
      };
      contentEl.style.visibility = "visible";
      contentEl.style.pointerEvents = "auto";
      contentEl.style.position = "static";
      contentEl.style.height = "auto";
      void contentEl.offsetHeight; // force repaint
      const total = 60 + controlsH + contentEl.scrollHeight + 16;
      contentEl.style.visibility = prev.vis;
      contentEl.style.pointerEvents = prev.pe;
      contentEl.style.position = prev.pos;
      contentEl.style.height = prev.h;
      return Math.min(total, maxH);
    }
    return Math.min(360, maxH);
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;
    // Reset BOTH the shorthand and overflowY explicitly. GSAP's onComplete
    // callback below sets overflowY: "auto" as an inline style once the menu
    // finishes opening. Setting `overflow: "hidden"` alone does NOT clear
    // that inline overflowY — it's a separate CSS property — so if the
    // timeline gets recreated (route change, theme change) while that
    // leftover "auto" is still applied, the nav keeps showing a scrollbar
    // even while collapsed at height: 60.
    gsap.set(navEl, { height: 60, overflow: "hidden", overflowY: "hidden" });
    gsap.set(cardsRef.current, { y: 30, opacity: 0 });
    const tl = gsap.timeline({ 
      paused: true,
      onComplete: () => {
        // Allow scrolling inside the nav on mobile after open animation
        if (navEl) gsap.set(navEl, { overflowY: "auto" });
      },
      onReverseComplete: () => {
        if (navEl) gsap.set(navEl, { overflow: "hidden", overflowY: "hidden" });
        setExpanded(false);
        document.body.style.overflow = "";
      }
    });
    tl.fromTo(navEl, { height: 60 }, { height: calculateHeight, duration: 0.4, ease: "power3.out" });
    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out", stagger: 0.08 }, "-=0.1");
    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    if (expandedRef.current && tl) {
      // Keep it open if it was already open when theme changed
      tl.progress(1);
    }
    return () => {
      tl?.kill();
      // Belt-and-suspenders: explicitly clear overflowY on unmount/route
      // change too, in case the timeline is killed mid-animation before
      // onComplete/onReverseComplete ever had a chance to fire.
      if (navRef.current) gsap.set(navRef.current, { overflowY: "hidden" });
      tlRef.current = null;
    };
  }, [theme]); // Re-create timeline when theme variables update card layouts

  useLayoutEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width === lastWidthRef.current) return;
      lastWidthRef.current = width;

      if (!tlRef.current) return;
      if (expanded) {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) { newTl.progress(1); tlRef.current = newTl; }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) tlRef.current = newTl;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [expanded, theme]);

  // If the route changes for any reason while the menu is open (e.g. browser
  // back/forward, not just clicking a link inside the menu), snap it closed
  // immediately rather than leaving it expanded with stale GSAP state.
  useEffect(() => {
    if (expanded) {
      setIsOpen(false);
      setExpanded(false);
      document.body.style.overflow = "";
      if (navRef.current) {
        gsap.set(navRef.current, { height: 60, overflow: "hidden", overflowY: "hidden" });
      }
      gsap.set(cardsRef.current, { y: 30, opacity: 0 });
      tlRef.current?.pause(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isOpen) {
      setIsOpen(true);
      setExpanded(true);
      // Lock body scroll on mobile when menu opens
      document.body.style.overflow = "hidden";
      tl.play();
    } else {
      // Move focus out of the menu BEFORE it gets aria-hidden. Without this,
      // clicking a nav link inside the menu leaves that button focused while
      // its container is hidden from assistive tech — browsers warn about
      // this (aria-hidden on a focused descendant) and it's a real a11y bug,
      // not just noise.
      if (
        document.activeElement instanceof HTMLElement &&
        navRef.current?.contains(document.activeElement)
      ) {
        document.activeElement.blur();
      }
      setIsOpen(false);
      tl.reverse();
    }
  };

  const handleNavLink = (path: string) => {
    navigate(path);
    if (expanded) toggleMenu();
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const navEl = navRef.current;
      if (navEl && !navEl.contains(event.target as Node)) {
        toggleMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[1200px] z-50">
      <nav
        ref={navRef}
        className="w-full relative overflow-hidden rounded-2xl border border-brand-cream/10 shadow-2xl bg-brand-bg/90 backdrop-blur-md transition-colors duration-300"
      >
        {/* ── Top bar ── */}
        <div className="h-[60px] flex items-center justify-between px-4 md:px-10 relative z-20 gap-2">
          {/* Hamburger */}
          <button
            className="flex flex-col justify-center items-center gap-1.5 w-6 h-6 bg-transparent border-none cursor-pointer p-0 shrink-0"
            onClick={toggleMenu}
            aria-label={expanded ? t("nav.closeMenu") : t("nav.openMenu")}
          >
            <div className={`w-6 h-[2px] bg-brand-cream transition-transform duration-300 ${isOpen ? "rotate-45 translate-y-[4px]" : ""}`} />
            <div className={`w-6 h-[2px] bg-brand-cream transition-transform duration-300 ${isOpen ? "-rotate-45 -translate-y-[4px]" : ""}`} />
          </button>

          {/* Logo — text (Centered absolutely) */}
          <button
            className="cursor-pointer bg-transparent border-none p-0 flex items-center justify-center absolute left-1/2 -translate-x-1/2"
            onClick={() => handleNavLink("/")}
          >
            <span className="font-serif text-brand-cream text-2xl md:text-3xl font-medium tracking-[0.12em]">
              Miluarte
            </span>
          </button>

          {/* Controls + CTA */}
          <div className="flex items-center gap-1.5 md:gap-3.5 z-20">
            {/* Language + theme toggles: desktop only here, they live inside the menu on mobile */}
            <div className="hidden md:flex items-center gap-3.5">
              <LanguageToggle variant="full" />
              <ThemeToggle />
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-booking-modal"))}
              className="font-sans text-[9px] md:text-[11px] font-bold tracking-[0.08em] md:tracking-[0.15em] uppercase bg-brand-blush text-brand-ink py-2 px-2.5 md:py-2.5 md:px-6 rounded-lg hover:bg-brand-cream hover:text-brand-bg transition-colors duration-300 border-none cursor-pointer inline-flex items-center shrink-0"
            >
              {t("nav.commission")}
            </button>
          </div>
        </div>

        {/* ── Mobile-only controls (language + theme), shown inside the open menu ── */}
        <div 
          className="mobile-controls-row flex md:hidden items-center justify-between gap-3 px-4 pb-4 pt-1"
          style={{ display: expanded ? undefined : "none" }}
        >
          <span className="font-sans text-[10px] font-bold tracking-[0.12em] uppercase text-brand-cream/40">
            {language === "es" ? "Preferencias" : "Preferences"}
          </span>
          <div className="flex items-center gap-2.5">
            <LanguageToggle variant="full" />
            <ThemeToggle />
          </div>
        </div>

        {/* ── Cards ── */}
        <div
          className={`card-nav-content grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 px-4 md:px-8 pb-4 md:pb-6 w-full ${
            expanded ? "overflow-y-auto" : "overflow-hidden"
          }`}
          style={{ 
            maxHeight: 'calc(85vh - 60px)',
            display: expanded ? "grid" : "none"
          }}
          aria-hidden={!expanded}
        >
          {navCards.map((card, idx) => (
            <div
              key={card.label}
              className="p-4 md:p-8 flex flex-col justify-start border border-brand-cream/5 rounded-xl shadow-inner min-h-[160px] md:min-h-[220px]"
              ref={setCardRef(idx)}
              style={{ backgroundColor: card.bgColor, color: "var(--color-brand-cream)" }}
            >
              <div className="font-serif text-brand-cream text-2xl font-light mb-6">
                {card.label}
              </div>

              <div className="flex flex-col gap-4 items-start">
                {card.links.map((lnk, i) => {
                  const linkClass = "font-sans text-brand-cream/80 hover:text-brand-orange text-sm cursor-pointer flex items-center gap-3 bg-transparent border-none p-0 text-left transition-colors duration-200 group w-full";
                  const iconClass = "w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0";
                  const textClass = "font-semibold tracking-wide text-brand-cream/80 group-hover:text-brand-cream transition-colors duration-200";

                  if ("onClick" in lnk) {
                    return (
                      <button
                        key={i}
                        className={linkClass}
                        onClick={() => {
                          lnk.onClick();
                          setIsOpen(false);
                        }}
                      >
                        {lnk.thumbnail ? (
                          <img
                            src={getOptimizedImageUrl(lnk.thumbnail, 80)}
                            alt=""
                            className="w-[30px] h-[30px] rounded-[6px] object-cover flex-shrink-0 border border-brand-cream/15 group-hover:border-brand-orange transition-all duration-250"
                          />
                        ) : (
                          <ArrowUpRight className={iconClass} aria-hidden />
                        )}
                        <span className={textClass}>{lnk.label}</span>
                      </button>
                    );
                  }

                  if ("href" in lnk) {
                    return (
                      <a
                        key={i}
                        className={linkClass}
                        href={lnk.href}
                        target={lnk.href.startsWith("mailto") ? undefined : "_blank"}
                        rel="noopener noreferrer"
                      >
                        {lnk.thumbnail ? (
                          <img
                            src={getOptimizedImageUrl(lnk.thumbnail, 80)}
                            alt=""
                            className="w-[30px] h-[30px] rounded-[6px] object-cover flex-shrink-0 border border-brand-cream/15 group-hover:border-brand-orange transition-all duration-250"
                          />
                        ) : (
                          <ArrowUpRight className={iconClass} aria-hidden />
                        )}
                        <span className={textClass}>{lnk.label}</span>
                      </a>
                    );
                  }
                  return (
                    <button
                      key={i}
                      className={linkClass}
                      onClick={() => handleNavLink(lnk.path)}
                    >
                      {lnk.thumbnail ? (
                        <img
                          src={getOptimizedImageUrl(lnk.thumbnail, 80)}
                          alt=""
                          className="w-[30px] h-[30px] rounded-[6px] object-cover flex-shrink-0 border border-brand-cream/15 group-hover:border-brand-orange transition-all duration-250"
                        />
                      ) : (
                        <ArrowUpRight className={iconClass} aria-hidden />
                      )}
                      <span className={textClass}>{lnk.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}