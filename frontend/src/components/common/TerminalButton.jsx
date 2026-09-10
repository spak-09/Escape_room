import React from 'react';
import { soundEngine } from '../../utils/soundEngine';

/**
 * TerminalButton UI Primitive
 * Cyber/military themed interactive button with sound feedback and loading state.
 */
export default function TerminalButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon: Icon,
  fullWidth = false,
  ariaLabel,
  ...props
}) {
  const handleClick = (e) => {
    if (disabled || isLoading) return;
    soundEngine.playClick();
    if (onClick) onClick(e);
  };

  const baseStyles = 'relative inline-flex items-center justify-center font-mono font-semibold tracking-wider uppercase transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0d14] disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98] border';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded',
    md: 'text-sm px-4 py-2.5 gap-2 rounded-md',
    lg: 'text-base px-6 py-3.5 gap-2.5 rounded-lg',
  };

  const variantStyles = {
    primary: 'bg-sky-950/50 text-sky-300 border-sky-500/40 hover:bg-sky-900/60 hover:border-sky-400 hover:shadow-tactical-cyan focus-visible:ring-sky-400',
    emerald: 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60 hover:border-emerald-400 hover:shadow-tactical-emerald focus-visible:ring-emerald-400',
    terminal: 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60 hover:border-emerald-400 hover:shadow-tactical-emerald focus-visible:ring-emerald-400',
    danger: 'bg-rose-950/50 text-rose-300 border-rose-500/40 hover:bg-rose-900/60 hover:border-rose-400 hover:shadow-tactical-crimson focus-visible:ring-rose-400',
    warning: 'bg-amber-950/50 text-amber-300 border-amber-500/40 hover:bg-amber-900/60 hover:border-amber-400 hover:shadow-tactical-amber focus-visible:ring-amber-400',
    ghost: 'bg-slate-900/50 text-slate-300 border-slate-700/60 hover:bg-slate-800/60 hover:text-slate-100 hover:border-slate-500 focus-visible:ring-slate-400',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={handleClick}
      aria-label={ariaLabel}
      className={`
        ${baseStyles}
        ${sizeStyles[size] || sizeStyles.md}
        ${variantStyles[variant] || variantStyles.primary}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Subtle corner crosshair decoration */}
      <span className="absolute top-0 left-0 w-1 h-1 border-t border-l border-current opacity-70" />
      <span className="absolute top-0 right-0 w-1 h-1 border-t border-r border-current opacity-70" />
      <span className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-current opacity-70" />
      <span className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-current opacity-70" />

      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>PROCESSING...</span>
        </span>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
