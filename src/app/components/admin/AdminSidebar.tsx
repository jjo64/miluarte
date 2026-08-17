import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Images,
  Box,
  FileText,
  MessageSquare,
  Share2,
  History,
  ExternalLink,
  LogOut,
  Sparkles,
  GraduationCap,
  X,
} from "lucide-react";
import { useAdminApi } from "../../hooks/useAdminApi";

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const { removeToken, request } = useAdminApi();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function checkUnread() {
      try {
        const [contacts, bookings] = await Promise.all([
          request<any[]>("/api/admin/messages?type=contact"),
          request<any[]>("/api/admin/messages?type=booking"),
        ]);
        if (isMounted) {
          const unreadC = Array.isArray(contacts) ? contacts.filter((m) => !m.read).length : 0;
          const unreadB = Array.isArray(bookings) ? bookings.filter((m) => !m.read).length : 0;
          setUnreadCount(unreadC + unreadB);
        }
      } catch {
        // Silencioso
      }
    }
    checkUnread();
    const interval = setInterval(checkUnread, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    removeToken();
    navigate("/admin/login");
  };

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/inicio", label: "Editar Inicio (Live)", icon: Sparkles },
    { to: "/admin/cv", label: "Currículum (CV)", icon: GraduationCap },
    { to: "/admin/galerias", label: "Galerías y Obras", icon: Images },
    { to: "/admin/renders", label: "Renders 3D & Stands", icon: Box },
    { to: "/admin/mensajes", label: "Mensajes Recibidos", icon: MessageSquare, badge: unreadCount },
    { to: "/admin/redes", label: "Redes Sociales", icon: Share2 },
    { to: "/admin/historial", label: "Historial de Cambios", icon: History },
  ];

  return (
    <aside className="w-64 h-full bg-brand-dark border-r border-brand-cream/10 flex flex-col justify-between p-5 select-none overflow-y-auto">
      {/* Top logo */}
      <div>
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-brand-cream/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-blush/20 border border-brand-blush/30 flex items-center justify-center text-brand-blush">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-light tracking-tight text-brand-cream">
                Miluarte <span className="italic text-brand-blush text-xs">CMS</span>
              </h2>
              <p className="font-sans text-[9px] uppercase tracking-widest text-brand-cream/40">
                Panel de Nerea
              </p>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden text-brand-cream/50 hover:text-brand-cream p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-sans text-xs font-medium transition-all ${
                    isActive
                      ? "bg-brand-blush/15 text-brand-blush border border-brand-blush/30 shadow-xs"
                      : "text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5 border border-transparent"
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="px-2 py-0.5 rounded-full bg-brand-orange text-brand-ink text-[10px] font-bold font-mono animate-pulse shadow">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom actions */}
      <div className="pt-6 mt-6 border-t border-brand-cream/10 flex flex-col gap-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5 transition-colors no-underline"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver mi portfolio</span>
          </span>
          <span className="text-[10px] text-brand-blush font-mono">LIVE</span>
        </a>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-brand-orange/80 hover:text-brand-orange hover:bg-brand-orange/10 transition-colors cursor-pointer text-left w-full"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
