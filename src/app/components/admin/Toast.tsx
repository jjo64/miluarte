import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { ease } from "../../tokens";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "success", isOpen, onClose, duration = 3500 }: ToastProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-brand-blush flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-brand-orange flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-brand-cream/80 flex-shrink-0" />,
  };

  const borders = {
    success: "border-brand-blush/30",
    error: "border-brand-orange/40",
    info: "border-brand-cream/20",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.35, ease }}
          className={`fixed bottom-6 right-6 z-50 max-w-md bg-brand-dark/95 backdrop-blur-md border ${borders[type]} rounded-xl p-4 shadow-2xl flex items-center justify-between gap-3 text-brand-cream select-none`}
        >
          <div className="flex items-center gap-3">
            {icons[type]}
            <p className="font-sans text-xs md:text-sm font-medium leading-tight">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-brand-cream/40 hover:text-brand-cream transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
