import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Images,
  Box,
  FileText,
  MessageSquare,
  Share2,
  History,
  Download,
  ExternalLink,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Sliders,
  Eye,
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { useAdminApi } from "../../hooks/useAdminApi";
import { fadeUp, staggerContainer, staggerItem } from "../../tokens";

export function AdminDashboard() {
  const { request } = useAdminApi();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({
    galleriesCount: 8,
    worksCount: 87,
    newMessagesCount: 0,
    lastUpdate: "Hoy",
  });

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        const [galleries, contact, booking] = await Promise.all([
          request<any[]>("/api/admin/galleries").catch(() => []),
          request<any[]>("/api/admin/messages?type=contact").catch(() => []),
          request<any[]>("/api/admin/messages?type=booking").catch(() => []),
        ]);

        const gList = Array.isArray(galleries) ? galleries : [];
        const cList = Array.isArray(contact) ? contact : [];
        const bList = Array.isArray(booking) ? booking : [];
        const unreadCount = [...cList, ...bList].filter((m: any) => !m.read).length;

        setStats({
          galleriesCount: gList.length || 8,
          worksCount: 87,
          newMessagesCount: unreadCount,
          lastUpdate: "Hoy",
        });
      } catch (e) {
        // Fallback stats
      }
    }
    loadDashboardStats();
  }, [request]);

  const handleExportBackup = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem("miluarte_admin_token");
      const res = await fetch("/api/admin/export", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("No se pudo generar el backup");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `miluarte-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "Error al exportar backup. Verifica tu conexión.");
    } finally {
      setExporting(false);
    }
  };

  const headerActions = (
    <div className="flex items-center gap-2.5">
      <button
        onClick={() => navigate("/admin/inicio")}
        className="px-3.5 py-1.5 rounded-xl bg-brand-blush/15 hover:bg-brand-blush text-brand-blush hover:text-brand-ink border border-brand-blush/30 text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Editar Inicio (Live)</span>
      </button>

      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/80 hover:text-brand-cream hover:bg-brand-cream/5 transition-all flex items-center gap-1.5 no-underline"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Ver Web</span>
      </a>
    </div>
  );

  return (
    <AdminLayout
      title="Panel de Control"
      subtitle="Gestión integral del portafolio artístico de Nerea"
      actions={headerActions}
    >
      <div className="flex flex-col gap-10 select-none">
        {/* Welcome message */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <p className="font-sans text-brand-blush text-[10px] tracking-[0.3em] uppercase mb-2">
            Panel de Administración
          </p>
          <h1 className="font-serif text-3xl md:text-5xl font-light text-brand-cream tracking-tight">
            Hola de nuevo, <span className="italic text-brand-blush">Nerea</span> 👋
          </h1>
          <p className="font-serif italic text-brand-wall text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            Aquí puedes gestionar todas tus galerías de arte, subir nuevas obras, personalizar los textos en español e inglés y previsualizar tu inicio en tiempo real.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <motion.div
            variants={staggerItem}
            onClick={() => navigate("/admin/galerias")}
            className="p-5 rounded-2xl bg-brand-dark border border-brand-cream/10 hover:border-brand-blush/30 transition-all cursor-pointer relative overflow-hidden group"
          >
            <p className="font-sans text-[10px] tracking-wider uppercase text-brand-cream/60">Galerías Activas</p>
            <p className="font-serif text-3xl md:text-4xl text-brand-cream mt-2 font-light">{stats.galleriesCount}</p>
            <div className="absolute top-4 right-4 text-brand-blush/30 group-hover:text-brand-blush transition-colors">
              <Images className="w-5 h-5" />
            </div>
          </motion.div>

          <motion.div
            variants={staggerItem}
            onClick={() => navigate("/admin/inicio")}
            className="p-5 rounded-2xl bg-brand-dark border border-brand-cream/10 hover:border-brand-orange/30 transition-all cursor-pointer relative overflow-hidden group"
          >
            <p className="font-sans text-[10px] tracking-wider uppercase text-brand-cream/60">Portada / Inicio</p>
            <p className="font-serif text-2xl md:text-3xl text-brand-blush mt-2 font-light flex items-center gap-1.5">
              <span>Live Edit</span>
            </p>
            <div className="absolute top-4 right-4 text-brand-orange/30 group-hover:text-brand-orange transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
          </motion.div>

          <motion.div
            variants={staggerItem}
            onClick={() => navigate("/admin/mensajes")}
            className="p-5 rounded-2xl bg-brand-dark border border-brand-cream/10 hover:border-brand-neon/30 transition-all cursor-pointer relative overflow-hidden group"
          >
            <p className="font-sans text-[10px] tracking-wider uppercase text-brand-cream/60">Mensajes Nuevos</p>
            <p className="font-serif text-3xl md:text-4xl text-brand-cream mt-2 font-light">{stats.newMessagesCount}</p>
            <div className="absolute top-4 right-4 text-brand-neon/30 group-hover:text-brand-neon transition-colors">
              <MessageSquare className="w-5 h-5" />
            </div>
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="p-5 rounded-2xl bg-brand-dark border border-brand-cream/10 relative overflow-hidden group"
          >
            <p className="font-sans text-[10px] tracking-wider uppercase text-brand-cream/60">Estado CMS</p>
            <p className="font-serif text-xl md:text-2xl text-brand-blush mt-2 font-light flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Conectado
            </p>
            <div className="absolute top-4 right-4 text-brand-cream/30">
              <TrendingUp className="w-5 h-5" />
            </div>
          </motion.div>
        </motion.div>

        {/* Quick action modules */}
        <div>
          <h2 className="font-serif text-xl text-brand-cream font-light mb-5 flex items-center gap-2">
            <span>Módulos de Gestión</span>
            <div className="h-px flex-1 bg-brand-cream/10 ml-2" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Editor de Inicio Live */}
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => navigate("/admin/inicio")}
              className="p-6 rounded-2xl bg-brand-dark border border-brand-blush/30 hover:border-brand-blush transition-all cursor-pointer flex flex-col justify-between group min-h-[180px] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blush/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-blush/20 border border-brand-blush/30 text-brand-blush flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-brand-cream group-hover:text-brand-blush transition-colors">
                  Editar Inicio (Live)
                </h3>
                <p className="font-sans text-brand-cream/60 text-xs mt-1">
                  Previsualiza y edita la portada entera en vivo (ES/EN) con clic.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-brand-blush font-medium mt-4">
                <span>Abrir editor visual</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* Galerías */}
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => navigate("/admin/galerias")}
              className="p-6 rounded-2xl bg-brand-dark border border-brand-cream/10 hover:border-brand-blush/40 transition-all cursor-pointer flex flex-col justify-between group min-h-[180px]"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-blush/10 border border-brand-blush/20 text-brand-blush flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Images className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-brand-cream group-hover:text-brand-blush transition-colors">
                  Galerías y Obras
                </h3>
                <p className="font-sans text-brand-cream/60 text-xs mt-1">
                  Sube fotos, ajusta el tamaño puzzle de cada card y reordena.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-brand-blush font-medium mt-4">
                <span>Gestionar obras</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* Renders 3D */}
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => navigate("/admin/renders")}
              className="p-6 rounded-2xl bg-brand-dark border border-brand-cream/10 hover:border-brand-orange/40 transition-all cursor-pointer flex flex-col justify-between group min-h-[180px]"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Box className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-brand-cream group-hover:text-brand-orange transition-colors">
                  Renders 3D & Stands
                </h3>
                <p className="font-sans text-brand-cream/60 text-xs mt-1">
                  Gestiona proyectos 3D, videos de making-of y pasos del proceso.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-brand-orange font-medium mt-4">
                <span>Gestionar 3D</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* Textos del sitio */}
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => navigate("/admin/textos")}
              className="p-6 rounded-2xl bg-brand-dark border border-brand-cream/10 hover:border-brand-cream/40 transition-all cursor-pointer flex flex-col justify-between group min-h-[180px]"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-cream/10 border border-brand-cream/20 text-brand-cream flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-brand-cream group-hover:text-brand-blush transition-colors">
                  Textos e Idiomas
                </h3>
                <p className="font-sans text-brand-cream/60 text-xs mt-1">
                  Edita la biografía, descripciones y traducciones ES / EN.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-brand-cream font-medium mt-4">
                <span>Editar textos</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Secondary modules & Backup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Mensajes & Redes */}
          <div className="p-6 rounded-2xl bg-brand-dark border border-brand-cream/10">
            <h3 className="font-serif text-lg text-brand-cream mb-4">Comunicaciones & Redes</h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/admin/mensajes")}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-brand-bg/80 border border-brand-cream/5 hover:border-brand-cream/20 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-brand-blush" />
                  <div>
                    <p className="font-sans text-xs text-brand-cream font-medium">Bandeja de Mensajes</p>
                    <p className="font-sans text-[11px] text-brand-cream/50">Consultas de contacto y encargos</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-brand-cream/40" />
              </button>

              <button
                onClick={() => navigate("/admin/redes")}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-brand-bg/80 border border-brand-cream/5 hover:border-brand-cream/20 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Share2 className="w-4 h-4 text-brand-orange" />
                  <div>
                    <p className="font-sans text-xs text-brand-cream font-medium">Redes Sociales</p>
                    <p className="font-sans text-[11px] text-brand-cream/50">Instagram, LinkedIn, Behance, etc.</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-brand-cream/40" />
              </button>

              <button
                onClick={() => navigate("/admin/historial")}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-brand-bg/80 border border-brand-cream/5 hover:border-brand-cream/20 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <History className="w-4 h-4 text-brand-cream/70" />
                  <div>
                    <p className="font-sans text-xs text-brand-cream font-medium">Historial de Cambios</p>
                    <p className="font-sans text-[11px] text-brand-cream/50">Puntos de restauración y reversión</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-brand-cream/40" />
              </button>
            </div>
          </div>

          {/* Backup & Seguridad */}
          <div className="p-6 rounded-2xl bg-brand-dark border border-brand-cream/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4 text-brand-blush" />
                <h3 className="font-serif text-lg text-brand-cream">Seguridad y Copias de Seguridad</h3>
              </div>
              <p className="font-sans text-brand-cream/65 text-xs leading-relaxed mb-6">
                Descarga una copia de seguridad completa con todas tus galerías, obras, fotos y textos en un solo archivo JSON seguro. Guárdalo cuando hagas cambios importantes.
              </p>
            </div>

            <button
              onClick={handleExportBackup}
              disabled={exporting}
              className="w-full py-3.5 px-5 rounded-xl bg-brand-blush/15 hover:bg-brand-blush text-brand-blush hover:text-brand-ink border border-brand-blush/30 font-sans text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {exporting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Exportar Backup Completo (.JSON)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
