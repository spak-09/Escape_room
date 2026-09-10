import React, { createContext, useState, useCallback, useMemo } from 'react';
import { soundEngine } from '../utils/soundEngine';
import { announce } from '../utils/ariaAnnounce';

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ message, type = 'info', title, duration = 4500 }) => {
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newToast = { id, message, type, title, duration };

      // Play tactical audio feedback
      if (type === 'error') {
        soundEngine.playAccessDenied();
      } else if (type === 'warning') {
        soundEngine.playAlarm();
      } else if (type === 'success') {
        soundEngine.playChime();
      } else {
        soundEngine.playClick();
      }

      // Announce for assistive tech
      announce(`${title ? title + ': ' : ''}${message}`, type === 'error' ? 'assertive' : 'polite');

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      toast: {
        info: (msg, opts) => addToast({ message: msg, type: 'info', ...opts }),
        success: (msg, opts) => addToast({ message: msg, type: 'success', ...opts }),
        warning: (msg, opts) => addToast({ message: msg, type: 'warning', ...opts }),
        error: (msg, opts) => addToast({ message: msg, type: 'error', ...opts }),
      },
    }),
    [toasts, addToast, removeToast]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
