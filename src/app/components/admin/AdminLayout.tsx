import { useState } from "react";
import { Menu, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminGuard } from "./AdminGuard";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AdminLayout({ children, title, subtitle, actions }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-brand-bg text-brand-cream flex select-none">
        {/* Desktop Sidebar (fijo a la izquierda) */}
        <div className="hidden md:block fixed inset-y-0 left-0 z-30">
          <AdminSidebar />
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden"
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-y-0 left-0 z-50 md:hidden shadow-2xl"
              >
                <AdminSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:pl-64 min-w-0">
          {/* Topbar (visible en mobile y desktop para headers unificados) */}
          <header className="sticky top-0 z-20 bg-brand-dark/80 backdrop-blur-md border-b border-brand-cream/10 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg bg-brand-cream/5 border border-brand-cream/10 text-brand-cream hover:bg-brand-cream/10 transition-colors"
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5" />
              </button>

              {title ? (
                <div>
                  <h1 className="font-serif text-lg md:text-xl font-light text-brand-cream tracking-tight">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="font-sans text-[11px] text-brand-cream/50 hidden sm:block">
                      {subtitle}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 md:hidden">
                  <Sparkles className="w-4 h-4 text-brand-blush" />
                  <span className="font-serif text-sm text-brand-cream">Miluarte CMS</span>
                </div>
              )}
            </div>

            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </header>

          {/* Page body */}
          <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
