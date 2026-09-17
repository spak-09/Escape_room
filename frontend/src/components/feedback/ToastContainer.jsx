import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const iconMap = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle,
  };

  const styleMap = {
    info: 'border-facility-info/50 bg-[#171B1F] text-facility-info',
    success: 'border-emerald-500/50 bg-[#141A15] text-emerald-200 shadow-tactical-emerald',
    warning: 'border-amber-500/50 bg-[#1E1910] text-amber-200 shadow-tactical-amber',
    error: 'border-red-500/60 bg-[#1C1414] text-red-200 shadow-tactical-crimson',
  };

  const iconColorMap = {
    info: 'text-facility-info',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    error: 'text-red-400',
  };

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type] || Info;
          const styles = styleMap[toast.type] || styleMap.info;
          const iconColor = iconColorMap[toast.type] || iconColorMap.info;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`pointer-events-auto rounded-lg border p-3.5 font-mono text-xs shadow-xl flex items-start gap-3 backdrop-blur-md ${styles}`}
            >
              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />

              <div className="flex-1 min-w-0">
                {toast.title && (
                  <h4 className="font-bold tracking-wide uppercase text-slate-100 mb-0.5">
                    {toast.title}
                  </h4>
                )}
                <p className="text-slate-300 text-[11px] leading-relaxed break-words">
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-100 p-0.5 rounded transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                aria-label="Dismiss alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
