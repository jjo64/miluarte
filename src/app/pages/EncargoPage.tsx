import { useEffect } from "react";
import { useNavigate } from "react-router";

export function EncargoPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir al inicio del portfolio
    navigate("/", { replace: true });
    
    // Disparar el evento global para abrir el modal del formulario
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("open-booking-modal"));
    }, 150);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center" style={{ backgroundColor: "var(--brand-bg, #17120F)" }}>
      <div className="animate-pulse text-brand-blush font-sans text-sm tracking-widest uppercase" style={{ color: "var(--brand-blush, #EAA898)" }}>
        Cargando formulario...
      </div>
    </div>
  );
}
