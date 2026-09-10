import React from 'react';

/**
 * StatusBadge UI Primitive
 * Security status pill badge with neon glow and dot indicator.
 */
export default function StatusBadge({
  status = 'SECURE',
  label,
  size = 'md',
  showDot = true,
  className = '',
}) {
  const normalized = String(status).toUpperCase();

  const statusConfig = {
    CRITICAL: {
      color: 'bg-red-950/60 text-red-300 border-red-500/50 shadow-neon-crimson/20',
      dot: 'bg-red-500 animate-pulse',
      defaultLabel: 'CRITICAL',
    },
    BREACH: {
      color: 'bg-red-950/60 text-red-300 border-red-500/50 shadow-neon-crimson/20',
      dot: 'bg-red-500 animate-ping',
      defaultLabel: 'BREACH DETECTED',
    },
    ELEVATED: {
      color: 'bg-amber-950/60 text-amber-300 border-amber-500/50 shadow-neon-amber/20',
      dot: 'bg-amber-500 animate-pulse',
      defaultLabel: 'ELEVATED',
    },
    ACTIVE: {
      color: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50 shadow-neon-cyan/20',
      dot: 'bg-cyan-400',
      defaultLabel: 'ACTIVE',
    },
    SECURE: {
      color: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 shadow-neon-emerald/20',
      dot: 'bg-emerald-400',
      defaultLabel: 'SECURE',
    },
    LOCKED: {
      color: 'bg-slate-900/60 text-slate-400 border-slate-700/50',
      dot: 'bg-slate-500',
      defaultLabel: 'LOCKED',
    },
  };

  const current = statusConfig[normalized] || statusConfig.SECURE;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5',
  };

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-full border tracking-wider uppercase select-none ${sizeClasses[size] || sizeClasses.md} ${current.color} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />}
      <span>{label || current.defaultLabel}</span>
    </span>
  );
}
