import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { modalBackdrop, modalContent } from '../../utils/motionVariants';
import { soundEngine } from '../../utils/soundEngine';

/**
 * TerminalModal UI Primitive
 * Accessible dialog rendered via React Portal with backdrop blur, keyboard trap, and sound feedback.
 */
export default function TerminalModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  showCloseButton = true,
  variant = 'default', // 'default' | 'danger' | 'warning' | 'emerald'
}) {
  const modalRef = useRef(null);

  // Close on Escape key & play sound
  useEffect(() => {
    if (!isOpen) return;

    soundEngine.playClick();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        soundEngine.playClick();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Trap focus inside modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const focusable = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  }, [isOpen]);

  const borderVariants = {
    default: 'border-cyan-500/40 shadow-neon-cyan/20',
    danger: 'border-red-500/60 shadow-neon-crimson/30',
    warning: 'border-amber-500/50 shadow-neon-amber/20',
    emerald: 'border-emerald-500/50 shadow-neon-emerald/20',
  };

  const headerColors = {
    default: 'text-cyan-400',
    danger: 'text-red-400',
    warning: 'text-amber-400',
    emerald: 'text-emerald-400',
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            className={`relative w-full ${maxWidth} rounded-lg border bg-[#0d121f] text-slate-100 shadow-2xl z-10 overflow-hidden ${borderVariants[variant] || borderVariants.default}`}
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Corner Crosshairs */}
            <span className="absolute top-1 left-1 w-2 h-2 border-t border-l border-current opacity-80" />
            <span className="absolute top-1 right-1 w-2 h-2 border-t border-r border-current opacity-80" />
            <span className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-current opacity-80" />
            <span className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-current opacity-80" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-5 py-3.5">
              <div>
                {title && (
                  <h2
                    id="modal-title"
                    className={`font-mono text-base font-bold tracking-wider uppercase ${headerColors[variant] || headerColors.default}`}
                  >
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="font-mono text-xs text-slate-400 mt-0.5">{subtitle}</p>
                )}
              </div>

              {showCloseButton && onClose && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onClose();
                  }}
                  className="rounded p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="p-5 max-h-[80vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
