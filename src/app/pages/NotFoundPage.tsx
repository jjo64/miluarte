import { useNavigate } from "react-router";
import { C, SERIF, SANS } from "../tokens";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
      <p style={{ fontFamily: SANS, color: C.orange, fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase" }}>404</p>
      <h1 style={{ fontFamily: SERIF, color: C.cream, fontSize: "clamp(3rem, 6vw, 5rem)", fontWeight: 300, letterSpacing: "-0.02em" }}>Página no encontrada</h1>
      <button
        onClick={() => navigate("/")}
        style={{ fontFamily: SANS, color: C.cream, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", background: "none", border: `1px solid ${C.orange}`, padding: "12px 28px", cursor: "pointer" }}
      >
        Volver al inicio
      </button>
    </div>
  );
}
