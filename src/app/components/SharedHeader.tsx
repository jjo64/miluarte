import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { gsap } from "gsap";
import { ArrowUpRight } from "lucide-react";

// ─── Navigation content ───────────────────────────────────────────────────────

type NavLink =
  | { label: string; path: string; external?: false }
  | { label: string; href: string; external: true };

interface NavCard {
  label: string;
  bgColor: string;
  links: NavLink[];
}

const NAV_CARDS: NavCard[] = [
  {
    label: "Servicios",
    bgColor: "#211B14",
    links: [
      { label: "Diseño gráfico",  path: "/coleccion/diseno-grafico" },
      { label: "3D & Stands",     path: "/coleccion/3d-stands" },
      { label: "Diggin'",         path: "/coleccion/diggin" },
      { label: "Ilustración",     path: "/coleccion/ilustracion" },
      { label: "Concept art",     path: "/coleccion/concept-art" },
    ],
  },
  {
    label: "Proyectos",
    bgColor: "#17120F",
    links: [
      { label: "Serie Musae",     path: "/coleccion/ilustracion" },
      { label: "Diggin' label",   path: "/coleccion/diggin" },
      { label: "Tienda",          path: "/coleccion/tienda" },
    ],
  },
  {
    label: "Contacto",
    bgColor: "#0D0908",
    links: [
      { label: "Miluartedenara@gmail.com", href: "mailto:Miluartedenara@gmail.com", external: true },
      { label: "Instagram",       href: "#", external: true },
      { label: "Behance",         href: "#", external: true },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function SharedHeader() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen]     = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navRef   = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef    = useRef<gsap.core.Timeline | null>(null);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 360;
    const contentEl = navEl.querySelector<HTMLElement>(".card-nav-content");
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
      const total = 60 + contentEl.scrollHeight + 16;
      contentEl.style.visibility = prev.vis;
      contentEl.style.pointerEvents = prev.pe;
      contentEl.style.position = prev.pos;
      contentEl.style.height = prev.h;
      return total;
    }
    return 360;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;
    gsap.set(navEl, { height: 60, overflow: "hidden" });
    gsap.set(cardsRef.current, { y: 30, opacity: 0 });
    const tl = gsap.timeline({ paused: true });
    tl.to(navEl, { height: calculateHeight, duration: 0.4, ease: "power3.out" });
    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out", stagger: 0.08 }, "-=0.1");
    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    return () => { tl?.kill(); tlRef.current = null; };
  }, []);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;
      if (expanded) {
        gsap.set(navRef.current, { height: calculateHeight() });
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
  }, [expanded]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!expanded) {
      setIsOpen(true);
      setExpanded(true);
      tl.play(0);
    } else {
      setIsOpen(false);
      tl.eventCallback("onReverseComplete", () => setExpanded(false));
      tl.reverse();
    }
  };

  const handleNavLink = (path: string) => {
    navigate(path);
    if (expanded) toggleMenu();
  };

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[1200px] z-50">
      <nav
        ref={navRef}
        className="w-full relative overflow-hidden rounded-2xl border border-brand-cream/10 shadow-2xl transition-all duration-300"
        style={{ backgroundColor: "#17120F" }}
      >
        {/* ── Top bar ── */}
        <div className="h-[60px] flex items-center justify-between px-6 md:px-10 relative z-20">
          {/* Hamburger */}
          <button
            className="flex flex-col justify-center items-center gap-1.5 w-6 h-6 bg-transparent border-none cursor-pointer p-0"
            onClick={toggleMenu}
            aria-label={expanded ? "Cerrar menú" : "Abrir menú"}
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

          {/* CTA */}
          <a
            href="mailto:Miluartedenara@gmail.com"
            className="font-sans text-[11px] font-bold tracking-[0.15em] uppercase bg-[#EAA898] text-[#180E09] py-2.5 px-6 rounded-lg hover:bg-brand-cream transition-colors duration-300 no-underline inline-flex items-center"
          >
            ENCARGO
          </a>
        </div>

        {/* ── Cards ── */}
        <div className="card-nav-content grid grid-cols-1 md:grid-cols-3 gap-4 px-6 md:px-8 pb-6 w-full" aria-hidden={!expanded}>
          {NAV_CARDS.map((card, idx) => (
            <div
              key={card.label}
              className="p-6 md:p-8 flex flex-col justify-between border border-brand-cream/5 rounded-xl shadow-inner min-h-[220px]"
              ref={setCardRef(idx)}
              style={{ backgroundColor: card.bgColor, color: "var(--color-brand-cream)" }}
            >
              <div className="font-serif text-brand-cream text-2xl font-light mb-6">
                {card.label}
              </div>

              <div className="flex flex-col gap-4 items-start">
                {card.links.map((lnk, i) => {
                  const linkClass = "font-sans text-brand-cream/80 hover:text-brand-orange text-sm cursor-pointer flex items-center gap-2 bg-transparent border-none p-0 text-left transition-colors duration-200 group w-full";
                  const iconClass = "w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0";
                  const textClass = "font-semibold tracking-wide text-brand-cream/80 group-hover:text-brand-cream transition-colors duration-200";

                  if ("href" in lnk) {
                    return (
                      <a
                        key={i}
                        className={linkClass}
                        href={lnk.href}
                        target={lnk.href.startsWith("mailto") ? undefined : "_blank"}
                        rel="noopener noreferrer"
                      >
                        <ArrowUpRight className={iconClass} aria-hidden />
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
                      <ArrowUpRight className={iconClass} aria-hidden />
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
