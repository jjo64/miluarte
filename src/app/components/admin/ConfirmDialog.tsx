import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { ease } from "../../tokens";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  destructive = true,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <AlertDialog.Portal forceMount>
            <AlertDialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              />
            </AlertDialog.Overlay>

            <AlertDialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ duration: 0.3, ease }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-brand-dark border border-brand-cream/15 rounded-2xl p-6 md:p-8 z-50 text-brand-cream shadow-2xl focus:outline-none select-none"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      destructive
                        ? "bg-brand-orange/15 text-brand-orange border border-brand-orange/30"
                        : "bg-brand-blush/15 text-brand-blush border border-brand-blush/30"
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <AlertDialog.Title className="font-serif text-xl text-brand-cream">
                    {title}
                  </AlertDialog.Title>
                </div>

                <AlertDialog.Description className="font-sans text-xs md:text-sm text-brand-cream/70 leading-relaxed mb-6">
                  {description}
                </AlertDialog.Description>

                <div className="flex items-center justify-end gap-3">
                  <AlertDialog.Cancel asChild>
                    <button
                      onClick={onClose}
                      className="font-sans text-xs px-4 py-2.5 rounded-xl border border-brand-cream/15 text-brand-cream/80 hover:text-brand-cream hover:bg-brand-cream/5 transition-colors cursor-pointer"
                    >
                      {cancelText}
                    </button>
                  </AlertDialog.Cancel>

                  <AlertDialog.Action asChild>
                    <button
                      onClick={() => {
                        onConfirm();
                        onClose();
                      }}
                      className={`font-sans text-xs font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
                        destructive
                          ? "bg-brand-orange hover:bg-brand-orange/90 text-white shadow-lg shadow-brand-orange/20"
                          : "bg-brand-blush hover:bg-brand-cream text-brand-ink"
                      }`}
                    >
                      {confirmText}
                    </button>
                  </AlertDialog.Action>
                </div>
              </motion.div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        )}
      </AnimatePresence>
    </AlertDialog.Root>
  );
}
