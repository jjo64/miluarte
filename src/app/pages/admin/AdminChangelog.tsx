import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  History,
  Images,
  Box,
  FileText,
  MessageSquare,
  Share2,
  Sparkles,
  RefreshCw,
  Clock,
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { Toast } from "../../components/admin/Toast";
import { ChangelogEntry } from "../../types/cms";
import { useAdminApi } from "../../hooks/useAdminApi";

export function AdminChangelog() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; open: boolean }>({
    message: "",
    type: "success",
    open: false,
  });

  const { request } = useAdminApi();

  const fetchChangelog = async () => {
    try {
      setLoading(true);
      const data = await request<ChangelogEntry[]>("/api/admin/changelog");
      setEntries(data || []);
    } catch (err: any) {
      setToast({
        message: "Error al cargar historial: " + (err.message || "Fallo de conexión"),
        type: "error",
        open: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChangelog();
  }, []);

  const getSectionMeta = (section: ChangelogEntry["section"]) => {
    switch (section) {
      case "galleries":
        return {
          label: "Galería",
          icon: Images,
          color: "text-brand-blush",
          bg: "bg-brand-blush/10 border-brand-blush/30",
        };
      case "works":
        return {
          label: "Obra de Arte",
          icon: Sparkles,
          color: "text-brand-blush",
          bg: "bg-brand-blush/10 border-brand-blush/30",
        };
      case "renders":
        return {
          label: "Proyecto 3D",
          icon: Box,
          color: "text-brand-orange",
          bg: "bg-brand-orange/10 border-brand-orange/30",
        };
      case "texts":
        return {
          label: "Textos",
          icon: FileText,
          color: "text-amber-400",
          bg: "bg-amber-400/10 border-amber-400/30",
        };
      case "social":
        return {
          label: "Redes",
          icon: Share2,
          color: "text-pink-400",
          bg: "bg-pink-400/10 border-pink-400/30",
        };
      case "messages":
        return {
          label: "Mensajes",
          icon: MessageSquare,
          color: "text-emerald-400",
          bg: "bg-emerald-400/10 border-emerald-400/30",
        };
      default:
        return {
          label: "Sistema",
          icon: History,
          color: "text-brand-cream",
          bg: "bg-brand-cream/10 border-brand-cream/30",
        };
    }
  };

  const formatDate = (iso: string) => {
    try {
      return format(parseISO(iso), "d 'de' MMMM, yyyy · HH:mm", { locale: es });
    } catch {
      return iso;
    }
  };

  const headerActions = (
    <button
      onClick={fetchChangelog}
      className="px-3.5 py-1.5 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/80 hover:text-brand-cream hover:bg-brand-cream/5 flex items-center gap-1.5 transition-colors cursor-pointer"
    >
      <RefreshCw className="w-3.5 h-3.5" />
      <span>Actualizar</span>
    </button>
  );

  return (
    <AdminLayout
      title="Historial de Actividad"
      subtitle="Registro cronológico de los últimos cambios y publicaciones en el portfolio"
      actions={headerActions}
    >
      <div className="max-w-3xl select-none">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-brand-dark/50 border border-brand-cream/5 animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 bg-brand-dark border border-dashed border-brand-cream/10 rounded-2xl p-8">
            <History className="w-8 h-8 text-brand-cream/30 mx-auto mb-2" />
            <p className="font-serif italic text-brand-wall text-sm">No hay cambios registrados en el historial</p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 border-l border-brand-cream/10 flex flex-col gap-6 ml-2 sm:ml-4">
            {entries.map((entry) => {
              const meta = getSectionMeta(entry.section);
              const Icon = meta.icon;

              return (
                <div key={entry.id} className="relative group">
                  {/* Timeline bullet icon */}
                  <div
                    className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-7 h-7 rounded-full border flex items-center justify-center ${meta.bg} ${meta.color} shadow-md`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-brand-dark border border-brand-cream/10 hover:border-brand-cream/25 transition-all flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-sans text-[10px] uppercase tracking-wider font-bold ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                      <span className="font-sans text-[11px] text-brand-cream/40 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(entry.timestamp)}</span>
                      </span>
                    </div>

                    <p className="font-sans text-xs sm:text-sm text-brand-cream font-medium leading-relaxed">
                      {entry.action}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast */}
      <Toast
        isOpen={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </AdminLayout>
  );
}
