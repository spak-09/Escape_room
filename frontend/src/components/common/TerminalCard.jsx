import React from 'react';

/**
 * TerminalCard UI Primitive
 * Layered industrial facility container with a controlled edge highlight.
 */
export default function TerminalCard({
  children,
  title,
  subtitle,
  icon: Icon,
  badge,
  variant = 'default',
  className = '',
  headerAction,
  ...props
}) {
  const borderVariants = {
    default: 'border-slate-800/90 bg-[#121416]',
    surface: 'border-slate-800/90 bg-[#121416]',
    elevated: 'border-slate-700/60 bg-[#1E2023]',
    cyan: 'border-amber-500/30 bg-[#121416] shadow-tactical-amber/15',
    emerald: 'border-emerald-500/30 bg-[#121416] shadow-tactical-emerald/15',
    crimson: 'border-rose-500/30 bg-[#121416] shadow-tactical-crimson/15',
    amber: 'border-amber-500/30 bg-[#121416] shadow-tactical-amber/15',
  };

  return (
    <div
      className={`relative rounded-lg border backdrop-blur-md transition-all duration-300 ${borderVariants[variant] || borderVariants.default} ${className}`}
      {...props}
    >
      {/* Corner registration marks */}
      <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-500/45 pointer-events-none" />
      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-500/45 pointer-events-none" />
      <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-500/45 pointer-events-none" />
      <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-500/45 pointer-events-none" />

      {/* Header bar if title or icon is provided */}
      {(title || Icon || badge || headerAction) && (
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40 px-4 py-3 rounded-t-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && <Icon className="w-4 h-4 text-cyan-400 shrink-0" />}
            <div>
              {title && (
                <h3 className="font-mono text-sm font-semibold tracking-wide text-slate-200 uppercase truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="font-mono text-xs text-slate-400 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {badge && <div>{badge}</div>}
            {headerAction && <div>{headerAction}</div>}
          </div>
        </div>
      )}

      {/* Card body */}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}
