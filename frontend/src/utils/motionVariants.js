/**
 * Centralized Framer Motion variants for Digital Safety Escape Room
 */

export const terminalFade = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2 },
  },
};

export const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const modalContent = {
  hidden: { opacity: 0, scale: 0.94, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: 0.2 },
  },
};

export const bulkheadDoorLeft = {
  closed: { x: 0 },
  open: { x: '-100%', transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
};

export const bulkheadDoorRight = {
  closed: { x: 0 },
  open: { x: '100%', transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
};

export const glitchAlarm = {
  normal: { x: 0, y: 0 },
  alarm: {
    x: [-2, 3, -3, 2, 0],
    y: [1, -2, 2, -1, 0],
    transition: { duration: 0.3, repeat: 2 },
  },
};
