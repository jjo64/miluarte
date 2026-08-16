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
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { Toast } from "../../components/admin/Toast";
import { ChangelogEntry } from "../../types/cms";
import { useAdminApi } from "../../hooks/useAdminApi";

export function AdminChangelog() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [revertingEntry, setRevertingEntry] = useState<ChangelogEntry | null>(null);
  const [isReverting, setIsReverting] = useState(false);

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

  const handleRollback = async () => {
    if (!revertingEntry?.snapshotId) return;

    try {
      setIsReverting(true);
      await request("/api/admin/changelog", {
        method: "POST",
        body: JSON.stringify({
          snapshotId: revertingEntry.snapshotId,
          entryTitle: revertingEntry.action,
        }),
      });

      setToast({
        message: "¡Página revertida exitosamente al punto seleccionado!",
        type: "success",
        open: true,
      });
      fetchChangelog();
    } catch (err: any) {
      setToast({
        message: err.message || "Error al restaurar la versión",
        type: "error",
        open: true,
      });
    } finally {
      setIsReverting(false);
      setRevertingEntry(null);
    }
  };

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
      title="Historial & Puntos de Restauración"
      subtitle="Registro cronológico con capacidad de restaurar y revertir la web a cualquier versión anterior"
      actions={headerActions}
    >
      <div className="max-w-3xl select-none flex flex-col gap-6">
        {/* Banner Explicativo de Seguridad */}
        <div className="p-4 sm:p-5 rounded-2xl bg-brand-dark border border-brand-blush/20 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-brand-blush/15 text-brand-blush border border-brand-blush/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-base text-brand-cream font-light">
              Puntos de Restauración Automáticos
            </h3>
            <p className="font-sans text-xs text-brand-cream/65 leading-relaxed mt-1">
              Cada vez que guardas cambios, el sistema crea un respaldo automático. Si cometes un error o no te gusta cómo quedó algo, puedes pulsar en <strong>"Revertir a esta versión"</strong> para recuperar el estado anterior al instante.
            </p>
          </div>
        </div>

        {/* Timeline */}
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
            {entries.map((entry, idx) => {
              const meta = getSectionMeta(entry.section);
              const Icon = meta.icon;
              const hasSnapshot = Boolean(entry.snapshotId && entry.canRollback);

              return (
                <div key={entry.id} className="relative group">
                  {/* Timeline bullet icon */}
                  <div
                    className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-7 h-7 rounded-full border flex items-center justify-center ${meta.bg} ${meta.color} shadow-md`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-brand-dark border border-brand-cream/10 hover:border-brand-cream/25 transition-all flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-sans text-[10px] uppercase tracking-wider font-bold ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                        {idx === 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-brand-blush/10 border border-brand-blush/30 text-[9px] font-sans text-brand-blush font-semibold">
                            Última versión activa
                          </span>
                        )}
                      </div>

                      <span className="font-sans text-[11px] text-brand-cream/40 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(entry.timestamp)}</span>
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <p className="font-sans text-xs sm:text-sm text-brand-cream font-medium leading-relaxed">
                        {entry.action}
                      </p>

                      {hasSnapshot && idx > 0 && (
                        <button
                          onClick={() => setRevertingEntry(entry)}
                          className="px-3 py-1.5 rounded-xl border border-brand-blush/30 text-brand-blush hover:bg-brand-blush hover:text-brand-ink text-xs font-medium transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer flex-shrink-0"
                          title="Restaurar el estado previo a esta acción"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Revertir a esta versión</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmación Rollback */}
      <ConfirmDialog
        isOpen={Boolean(revertingEntry)}
        onClose={() => setRevertingEntry(null)}
        onConfirm={handleRollback}
        title="¿Restaurar la página a esta versión?"
        description={`Se restaurará el estado completo del portfolio (galerías, obras y textos) tal y como estaba antes de: "${revertingEntry?.action}". Cualquier cambio posterior será reemplazado.`}
        confirmText="Sí, restaurar versión"
        destructive={false}
      />

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
