import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  MessageSquare,
  Mail,
  Trash2,
  Clock,
  Building,
  User,
  Inbox,
  CheckCheck,
  Briefcase,
  DollarSign,
  Calendar,
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { Toast } from "../../components/admin/Toast";
import { ContactMessage } from "../../types/cms";
import { useAdminApi } from "../../hooks/useAdminApi";

export function AdminMessages() {
  const [activeTab, setActiveTab] = useState<"contact" | "booking">("contact");
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState({ contact: 0, booking: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Modal Borrar
  const [deletingMessage, setDeletingMessage] = useState<ContactMessage | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; open: boolean }>({
    message: "",
    type: "success",
    open: false,
  });

  const { request } = useAdminApi();

  const fetchMessages = async (type: "contact" | "booking" = activeTab) => {
    try {
      setLoading(true);
      const [contactsRes, bookingsRes] = await Promise.all([
        request<any>("/api/admin/messages?type=contact").catch(() => []),
        request<any>("/api/admin/messages?type=booking").catch(() => []),
      ]);

      const cList: ContactMessage[] = Array.isArray(contactsRes)
        ? contactsRes
        : contactsRes?.messages || [];
      const bList: ContactMessage[] = Array.isArray(bookingsRes)
        ? bookingsRes
        : bookingsRes?.messages || [];

      const currentList = type === "contact" ? cList : bList;
      setMessages(currentList);

      const unreadC = cList.filter((m) => !m.read).length;
      const unreadB = bList.filter((m) => !m.read).length;
      setUnreadCount({ contact: unreadC, booking: unreadB, total: unreadC + unreadB });

      // Si había un mensaje seleccionado, refrescarlo
      if (selectedMessage) {
        const found = currentList.find((m) => m.id === selectedMessage.id);
        if (found) {
          setSelectedMessage(found);
        }
      }
    } catch (err: any) {
      setToast({
        message: "Error al cargar mensajes: " + (err.message || "Fallo de conexión"),
        type: "error",
        open: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(activeTab);
  }, [activeTab]);

  const handleSelectMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      try {
        await request("/api/admin/messages", {
          method: "PUT",
          body: JSON.stringify({ id: msg.id, read: true, type: activeTab }),
        });
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)));
        setUnreadCount((prev) => ({
          ...prev,
          [activeTab]: Math.max(0, prev[activeTab] - 1),
          total: Math.max(0, prev.total - 1),
        }));
      } catch {
        // Silencioso
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await request("/api/admin/messages", {
        method: "PUT",
        body: JSON.stringify({ markAll: true, type: activeTab }),
      });
      setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
      setUnreadCount((prev) => ({
        ...prev,
        [activeTab]: 0,
        total: activeTab === "contact" ? prev.booking : prev.contact,
      }));
      setToast({ message: "Todos los mensajes marcados como leídos", type: "success", open: true });
    } catch (err: any) {
      setToast({ message: err.message || "Error al actualizar", type: "error", open: true });
    }
  };

  const handleDeleteMessage = async () => {
    if (!deletingMessage) return;
    try {
      await request(`/api/admin/messages?id=${deletingMessage.id}&type=${activeTab}`, {
        method: "DELETE",
      });
      if (selectedMessage?.id === deletingMessage.id) {
        setSelectedMessage(null);
      }
      setToast({ message: "Mensaje eliminado correctamente", type: "success", open: true });
      fetchMessages(activeTab);
    } catch (err: any) {
      setToast({ message: err.message || "Error al eliminar", type: "error", open: true });
    } finally {
      setDeletingMessage(null);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return format(parseISO(isoString), "d 'de' MMMM, yyyy · HH:mm", { locale: es });
    } catch {
      return isoString;
    }
  };

  const headerActions = (
    <div className="flex items-center gap-2">
      {messages.some((m) => !m.read) && (
        <button
          onClick={handleMarkAllAsRead}
          className="px-3 py-1.5 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/80 hover:text-brand-cream hover:bg-brand-cream/5 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <CheckCheck className="w-3.5 h-3.5 text-brand-blush" />
          <span className="hidden sm:inline">Marcar todo leído</span>
        </button>
      )}
    </div>
  );

  return (
    <AdminLayout
      title="Bandeja de Mensajes"
      subtitle="Gestiona los mensajes directos y solicitudes de encargo recibidos desde la web"
      actions={headerActions}
    >
      <div className="flex flex-col gap-6 select-none">
        {/* Tabs Contacto / Encargos */}
        <div className="flex items-center gap-3 border-b border-brand-cream/10 pb-4">
          <button
            onClick={() => {
              setActiveTab("contact");
              setSelectedMessage(null);
            }}
            className={`px-4 py-2 rounded-xl font-sans text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "contact"
                ? "bg-brand-blush text-brand-ink shadow-md"
                : "bg-brand-dark border border-brand-cream/10 text-brand-cream/70 hover:text-brand-cream"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Contacto General</span>
            {unreadCount.contact > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-brand-orange text-white text-[10px] font-bold">
                {unreadCount.contact}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("booking");
              setSelectedMessage(null);
            }}
            className={`px-4 py-2 rounded-xl font-sans text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "booking"
                ? "bg-brand-blush text-brand-ink shadow-md"
                : "bg-brand-dark border border-brand-cream/10 text-brand-cream/70 hover:text-brand-cream"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Encargos y Proyectos</span>
            {unreadCount.booking > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-brand-orange text-white text-[10px] font-bold">
                {unreadCount.booking}
              </span>
            )}
          </button>
        </div>

        {/* Layout Grid: Lista a la izquierda / Detalle a la derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
          {/* Lista de Mensajes */}
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 rounded-2xl bg-brand-dark/50 border border-brand-cream/5 animate-pulse" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16 bg-brand-dark border border-dashed border-brand-cream/10 rounded-2xl p-6">
                <Inbox className="w-8 h-8 text-brand-cream/30 mx-auto mb-2" />
                <p className="font-serif italic text-brand-wall text-sm">No hay mensajes en esta bandeja</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                const subjectDisplay =
                  msg.subject ||
                  (msg.type === "booking"
                    ? msg.projectType === "commercial"
                      ? "Proyecto Comercial"
                      : "Proyecto Personal"
                    : "Consulta General");
                const bodyPreview = msg.message || msg.description || "";

                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? "bg-brand-dark border-brand-blush/60 shadow-lg"
                        : msg.read
                        ? "bg-brand-dark/60 border-brand-cream/5 hover:border-brand-cream/20 text-brand-cream/70"
                        : "bg-brand-dark border-l-4 border-l-brand-blush border-brand-cream/15 text-brand-cream"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-sm font-light text-brand-cream truncate flex items-center gap-2">
                        {msg.name}
                        {msg.projectType && (
                          <span className={`text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-full ${
                            msg.projectType === "commercial"
                              ? "bg-brand-orange/20 text-brand-orange"
                              : "bg-emerald-500/20 text-emerald-300"
                          }`}>
                            {msg.projectType === "commercial" ? "Comercial" : "Personal"}
                          </span>
                        )}
                      </span>
                      <span className="font-sans text-[10px] text-brand-cream/40 flex-shrink-0">
                        {formatDate(msg.timestamp).split("·")[0]}
                      </span>
                    </div>

                    <p className="font-sans text-xs text-brand-blush font-medium truncate">
                      {subjectDisplay}
                    </p>

                    <p className="font-sans text-xs text-brand-cream/60 line-clamp-2">
                      {bodyPreview}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Panel de Detalle del Mensaje */}
          <div className="lg:col-span-7">
            {selectedMessage ? (
              <div className="p-6 md:p-8 rounded-2xl bg-brand-dark border border-brand-cream/15 flex flex-col justify-between min-h-full">
                <div>
                  {/* Header Detalle */}
                  <div className="flex items-start justify-between border-b border-brand-cream/10 pb-5 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-sans text-[10px] uppercase tracking-wider text-brand-orange font-bold">
                          {selectedMessage.type === "booking" ? "Solicitud de Encargo" : "Consulta de Contacto"}
                        </span>
                        {selectedMessage.projectType && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-sans ${
                            selectedMessage.projectType === "commercial"
                              ? "bg-brand-orange/20 text-brand-orange border border-brand-orange/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}>
                            {selectedMessage.projectType === "commercial" ? "Proyecto Comercial (Prioridad)" : "Proyecto Personal"}
                          </span>
                        )}
                        <span className="text-brand-cream/30">·</span>
                        <span className="font-sans text-xs text-brand-cream/50 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(selectedMessage.timestamp)}</span>
                        </span>
                      </div>
                      <h3 className="font-serif text-2xl text-brand-cream font-light mt-1">
                        {selectedMessage.subject ||
                          (selectedMessage.projectType === "commercial"
                            ? "Proyecto Comercial"
                            : "Proyecto Personal")}
                      </h3>
                    </div>

                    <button
                      onClick={() => setDeletingMessage(selectedMessage)}
                      className="p-2 rounded-xl text-brand-orange hover:bg-brand-orange/10 transition-colors cursor-pointer"
                      title="Eliminar mensaje"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sender Info Card */}
                  <div className="p-4 rounded-xl bg-brand-bg/80 border border-brand-cream/10 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-brand-blush flex-shrink-0" />
                      <div>
                        <p className="font-sans text-[10px] text-brand-cream/50 uppercase font-bold">Remitente</p>
                        <p className="font-sans text-xs text-brand-cream font-medium">{selectedMessage.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-brand-blush flex-shrink-0" />
                      <div>
                        <p className="font-sans text-[10px] text-brand-cream/50 uppercase font-bold">Correo Electrónico</p>
                        <a
                          href={`mailto:${selectedMessage.email}`}
                          className="font-sans text-xs text-brand-blush hover:underline break-all"
                        >
                          {selectedMessage.email}
                        </a>
                      </div>
                    </div>

                    {selectedMessage.company && (
                      <div className="flex items-center gap-2.5 sm:col-span-2">
                        <Building className="w-4 h-4 text-brand-cream/40 flex-shrink-0" />
                        <div>
                          <p className="font-sans text-[10px] text-brand-cream/50 uppercase font-bold">Organización / Empresa</p>
                          <p className="font-sans text-xs text-brand-cream">{selectedMessage.company}</p>
                        </div>
                      </div>
                    )}

                    {selectedMessage.budget && (
                      <div className="flex items-center gap-2.5">
                        <DollarSign className="w-4 h-4 text-brand-orange flex-shrink-0" />
                        <div>
                          <p className="font-sans text-[10px] text-brand-cream/50 uppercase font-bold">Presupuesto Estimado</p>
                          <p className="font-sans text-xs text-brand-cream">{selectedMessage.budget}</p>
                        </div>
                      </div>
                    )}

                    {selectedMessage.deadline && (
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-brand-blush flex-shrink-0" />
                        <div>
                          <p className="font-sans text-[10px] text-brand-cream/50 uppercase font-bold">Fecha Límite / Deadline</p>
                          <p className="font-sans text-xs text-brand-cream">{selectedMessage.deadline}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Body */}
                  <div className="flex flex-col gap-2">
                    <p className="font-sans text-[11px] text-brand-cream/50 uppercase tracking-wider font-semibold">
                      {selectedMessage.type === "booking" ? "Descripción de la Idea / Encargo" : "Mensaje"}
                    </p>
                    <div className="p-5 rounded-xl bg-brand-bg/50 border border-brand-cream/10 font-sans text-sm text-brand-cream/90 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message || selectedMessage.description || "Sin contenido de texto."}
                    </div>
                  </div>
                </div>

                {/* Reply button */}
                <div className="pt-6 mt-6 border-t border-brand-cream/10 flex justify-end">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                      selectedMessage.subject || "Miluarte - Consulta"
                    )}`}
                    className="px-6 py-2.5 rounded-xl bg-brand-blush hover:bg-brand-cream text-brand-ink text-xs font-semibold uppercase tracking-wider transition-colors no-underline flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Responder por Correo</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-brand-dark/50 border border-dashed border-brand-cream/10 rounded-2xl text-brand-cream/40">
                <Mail className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-serif italic text-brand-wall text-sm">
                  Selecciona un mensaje de la lista para leer su contenido completo
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmación Borrar */}
      <ConfirmDialog
        isOpen={Boolean(deletingMessage)}
        onClose={() => setDeletingMessage(null)}
        onConfirm={handleDeleteMessage}
        title="¿Eliminar este mensaje?"
        description={`Se eliminará permanentemente el mensaje de ${deletingMessage?.name}.`}
        confirmText="Eliminar Mensaje"
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
