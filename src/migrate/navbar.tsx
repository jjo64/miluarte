import { type CSSProperties, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { gsap } from "gsap";
import { C, SERIF, SANS } from "../tokens";

import artMusae     from "../../imports/Screenshot_20260617_125349_Chrome.jpg";
import artDiggin    from "../../imports/Screenshot_20260617_125406_Chrome.jpg";
import artPortraits from "../../imports/Screenshot_20260617_125359_Chrome.jpg";
import artFireGirl  from "../../imports/Screenshot_20260617_125355_Chrome.jpg";

// ─── Nav content ─────────────────────────────────────────────────────────────

const SERVICIOS = [
  { label: "Diseño Gráfico",  path: "/coleccion/diseno-grafico" },
  { label: "3D & Renders",    path: "/renders" },
  { label: "Diggin'",         path: "/coleccion/diggin" },
  { label: "Ilustraciones",   path: "/coleccion/ilustracion" },
  { label: "Concept Art",     path: "/coleccion/concept-art" },
];

const PROYECTOS = [
  { label: "Serie Musae",   path: "/coleccion/ilustracion",    thumb: artMusae,     thumbPos: "50% 12%" },
  { label: "Diggin' label", path: "/coleccion/diggin",         thumb: artDiggin,    thumbPos: "50% 14%" },
  { label: "Animas",        path: "/coleccion/animas",         thumb: artFireGirl,  thumbPos: "50% 14%" },
  { label: "Retratos",      path: "/coleccion/ilustracion",    thumb: artPortraits, thumbPos: "50% 12%" },
  { label: "Pasta Ya",      path: "/coleccion/diseno-grafico", thumb: artDiggin,    thumbPos: "50% 14%" },
];

const CONTACTO = [
  { label: "Miluartedenara@gmail.com", href: "mailto:Miluartedenara@gmail.com" },
  { label: "Instagram",  href: "#" },
  { label: "LinkedIn",   href: "#" },
  { label: "Currículum", href: "#" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function NavBar() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const [open, setOpen]       = useState(false);
  const [visible, setVisible] = useState(true);
  const overlayRef  = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  // Hide navbar on scroll down, show on scroll up
  useEffect(() => {
    const onScroll = () => {
      const curr  = window.scrollY;
      const delta = curr - lastScrollY.current;
      if (Math.abs(delta) < 10) return;
      setVisible(delta < 0 || curr < 80);
      lastScrollY.current = curr;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close overlay on route change
  useEffect(() => {
    if (open) closeMenu();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Lock body scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const openMenu = useCallback(() => {
    setOpen(true);
    const overlay = overlayRef.current;
    if (!overlay) return;
    const links = overlay.querySelectorAll<HTMLElement>(".menu-link-row");
    gsap.set(overlay, { display: "flex", clipPath: "inset(0 0 100% 0)" });
    gsap.set(links, { y: 20, opacity: 0 });
    gsap.timeline()
      .to(overlay, { clipPath: "inset(0 0 0% 0)", duration: 0.42, ease: "power3.inOut" })
      .to(links, { y: 0, opacity: 1, stagger: 0.03, duration: 0.38, ease: "power3.out" }, "-=0.18");
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    const overlay = overlayRef.current;
    if (!overlay) return;
    gsap.to(overlay, {
      clipPath: "inset(0 0 100% 0)",
      duration: 0.35,
      ease: "power3.inOut",
      onComplete: () => gsap.set(overlay, { display: "none" }),
    });
  }, []);

  const handlePath = useCallback((path: string) => {
    closeMenu();
    setTimeout(() => navigate(path), 50);
  }, [navigate, closeMenu]);

  // ─── Bar ─────────────────────────────────────────────────────────────────

  const barStyle: React.CSSProperties = {
    position:        "fixed",
    top:             0,
    left:            0,
    right:           0,
    zIndex:          100,
    height:          60,
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "space-between",
    padding:         "0 20px",
    backgroundColor: "rgba(13,13,13,0.85)",
    backdropFilter:  "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom:    "1px solid rgba(255,255,255,0.06)",
    transform:       (!visible && !open) ? "translateY(-100%)" : "translateY(0)",
    transition:      "transform 300ms ease",
    willChange:      "transform",
  };

  // 3-line hamburger or X
  const lineBase: CSSProperties = {
    display:         "block",
    width:           22,
    height:          "1.5px",
    backgroundColor: C.cream,
    transformOrigin: "center",
    transition:      "transform 0.28s ease, opacity 0.22s ease",
    willChange:      "transform",
  };

  return (
    <>
      <nav style={barStyle} aria-label="Navegación principal">
        {/* Hamburger */}
        <button
          onClick={open ? closeMenu : openMenu}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", flexDirection: "column", gap: "5px", lineHeight: 0 }}
        >
          <span style={{ ...lineBase, transform: open ? "translateY(6.5px) rotate(45deg)" : "none" }} />
          <span style={{ ...lineBase, opacity: open ? 0 : 1 }} />
          <span style={{ ...lineBase, transform: open ? "translateY(-6.5px) rotate(-45deg)" : "none" }} />
        </button>

        {/* Logo — absolutely centered */}
        <button
          onClick={() => { if (open) closeMenu(); navigate("/"); }}
          style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontFamily: SERIF, color: C.cream, fontSize: "1.125rem", fontWeight: 400, letterSpacing: "0.04em", background: "none", border: "none", cursor: "pointer", padding: 0, whiteSpace: "nowrap" }}
        >
          Miluarte
        </button>

        {/* ENCARGO pill */}
        <a
          href="mailto:Miluartedenara@gmail.com"
          style={{ fontFamily: SANS, backgroundColor: C.orange, color: "#fff", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "7px 14px", borderRadius: "999px", textDecoration: "none", whiteSpace: "nowrap", fontWeight: 500 }}
        >
          ENCARGO
        </a>
      </nav>

      {/* ─── Fullscreen overlay ─────────────────────────────────────────────── */}
      <div
        ref={overlayRef}
        style={{
          display:        "none",
          position:       "fixed",
          inset:          0,
          zIndex:         200,
          backgroundColor: "#0d0d0d",
          flexDirection:  "column",
          overflowY:      "auto",
          overflowX:      "hidden",
        }}
      >
        {/* Overlay header */}
        <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, position: "relative" }}>
          <button
            onClick={closeMenu}
            aria-label="Cerrar menú"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", flexDirection: "column", gap: "5px", lineHeight: 0 }}
          >
            <span style={{ ...lineBase, transform: "translateY(6.5px) rotate(45deg)" }} />
            <span style={{ ...lineBase, opacity: 0 }} />
            <span style={{ ...lineBase, transform: "translateY(-6.5px) rotate(-45deg)" }} />
          </button>
          <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontFamily: SERIF, color: C.cream, fontSize: "1.125rem" }}>
            Miluarte
          </span>
          <div style={{ width: 30 }} />
        </div>

        {/* Menu sections */}
        <div style={{ padding: "28px 20px 64px", display: "flex", flexDirection: "column", gap: 40 }}>

          {/* — Servicios — */}
          <div>
            <p style={{ fontFamily: SANS, color: C.orange, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
              Servicios
            </p>
            {SERVICIOS.map((item) => (
              <div key={item.label} className="menu-link-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <button
                  onClick={() => handlePath(item.path)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                >
                  <span style={{ color: C.orange, fontSize: "15px", lineHeight: 1 }}>↗</span>
                  <span style={{ fontFamily: SERIF, color: C.cream, fontSize: "22px", fontWeight: 400 }}>{item.label}</span>
                </button>
              </div>
            ))}
          </div>

          {/* — Proyectos — */}
          <div>
            <p style={{ fontFamily: SANS, color: C.orange, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
              Proyectos
            </p>
            {PROYECTOS.map((item) => (
              <div key={item.label} className="menu-link-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <button
                  onClick={() => handlePath(item.path)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 0", background: "none", border: "none", cursor: "pointer" }}
                >
                  <img
                    src={item.thumb}
                    alt=""
                    loading="lazy"
                    style={{ width: 40, height: 40, objectFit: "cover", objectPosition: item.thumbPos, borderRadius: 8, flexShrink: 0 }}
                  />
                  <span style={{ fontFamily: SERIF, color: C.cream, fontSize: "22px", fontWeight: 400 }}>{item.label}</span>
                </button>
              </div>
            ))}
          </div>

          {/* — Contacto — */}
          <div>
            <p style={{ fontFamily: SANS, color: C.orange, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
              Contacto
            </p>
            {CONTACTO.map((item) => (
              <div key={item.label} className="menu-link-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <a
                  href={item.href}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", textDecoration: "none" }}
                  target={item.href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                >
                  <span style={{ color: C.secondary, fontSize: "15px", lineHeight: 1 }}>↗</span>
                  <span style={{ fontFamily: SANS, color: C.secondary, fontSize: "16px" }}>{item.label}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
