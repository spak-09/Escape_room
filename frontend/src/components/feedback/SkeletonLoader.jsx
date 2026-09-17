import React from 'react';

/**
 * SkeletonLoader Component
 * Diegetic wireframe skeleton loaders that maintain UI layout stability during telemetry requests.
 */
export default function SkeletonLoader({
  variant = 'text', // 'text' | 'card' | 'table' | 'button' | 'badge'
  lines = 3,
  className = '',
}) {
  if (variant === 'card') {
    return (
      <div className={`rounded-lg border border-slate-800 bg-[#121416] p-6 space-y-4 animate-pulse ${className}`}>
        <div className="h-4 bg-slate-800/80 rounded w-1/3" />
        <div className="space-y-2 pt-2">
          <div className="h-3 bg-slate-800/50 rounded w-full" />
          <div className="h-3 bg-slate-800/50 rounded w-5/6" />
          <div className="h-3 bg-slate-800/50 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`space-y-3 animate-pulse font-mono ${className}`}>
        <div className="h-6 bg-slate-800/80 rounded w-full" />
        {[...Array(lines)].map((_, i) => (
          <div key={i} className="h-10 bg-slate-900/60 rounded border border-slate-800/40 w-full" />
        ))}
      </div>
    );
  }

  if (variant === 'button') {
    return <div className={`h-10 bg-slate-800/80 rounded-md animate-pulse w-32 ${className}`} />;
  }

  if (variant === 'badge') {
    return <div className={`h-6 bg-slate-800/80 rounded-full animate-pulse w-20 ${className}`} />;
  }

  // Default: text lines
  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className="h-3 bg-slate-800/60 rounded"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}
