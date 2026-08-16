import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles } from "lucide-react";
import { C, SERIF, SANS, ease, fadeUp } from "../../tokens";
import { useAdminApi } from "../../hooks/useAdminApi";

export function AdminLogin() {
  const [email, setEmail] = useState("miluartedenara@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setToken } = useAdminApi();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password.trim()) {
      setLocalError("Por favor completa tu correo y contraseña");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Credenciales incorrectas o error en el servidor");
      }

      if (data?.token) {
        setToken(data.token);
        navigate("/admin", { replace: true });
      } else {
        throw new Error("No se recibió token de autorización");
      }
    } catch (err: any) {
      setLocalError(err.message || "Error al iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Luces sutiles de fondo para estética premium */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-blush/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[420px] bg-brand-dark/95 border border-brand-cream/10 rounded-2xl p-8 md:p-10 shadow-2xl relative z-10 backdrop-blur-md"
      >
        {/* Encabezado */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-blush/10 border border-brand-blush/20 text-brand-blush mb-4"
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>

          <p className="font-sans text-brand-blush text-[10px] tracking-[0.3em] uppercase mb-2">
            Panel de Administración
          </p>
          <h1 className="font-serif text-brand-cream text-3xl md:text-4xl font-light tracking-tight">
            Miluarte <span className="italic text-brand-blush">CMS</span>
          </h1>
          <p className="font-serif italic text-brand-wall text-xs mt-2">
            Gestión integral de galerías, obras y contenidos
          </p>
        </div>

        {/* Mensaje de error */}
        {localError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3.5 bg-brand-orange/15 border border-brand-orange/30 rounded-xl text-brand-cream text-xs leading-relaxed"
          >
            {localError}
          </motion.div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-brand-cream/70 text-[11px] tracking-wider uppercase font-medium">
              Correo Electrónico
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-brand-cream/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nerea@miluarte.com"
                required
                className="w-full bg-brand-bg/80 border border-brand-cream/15 rounded-xl pl-10 pr-4 py-3 text-brand-cream text-sm placeholder:text-brand-cream/30 focus:border-brand-blush focus:ring-1 focus:ring-brand-blush/30 outline-none transition-all"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="font-sans text-brand-cream/70 text-[11px] tracking-wider uppercase font-medium">
                Contraseña
              </label>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-brand-cream/40" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-brand-bg/80 border border-brand-cream/15 rounded-xl pl-10 pr-11 py-3 text-brand-cream text-sm placeholder:text-brand-cream/30 focus:border-brand-blush focus:ring-1 focus:ring-brand-blush/30 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-brand-cream/40 hover:text-brand-cream transition-colors p-1"
                aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Botón Acceder */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 font-sans bg-brand-blush hover:bg-brand-cream text-brand-ink text-xs font-semibold tracking-widest uppercase py-3.5 px-6 rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-brand-ink/20 border-t-brand-ink rounded-full animate-spin" />
            ) : (
              <>
                <span>Entrar al Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Link para volver a la home */}
        <div className="mt-8 text-center pt-6 border-t border-brand-cream/5">
          <a
            href="/"
            className="font-sans text-brand-cream/50 hover:text-brand-blush text-xs transition-colors no-underline"
          >
            ← Volver a miluartedenara.com
          </a>
        </div>
      </motion.div>
    </div>
  );
}
