import React from 'react';
import { Outlet } from 'react-router-dom';
import SkipToContent from '../common/SkipToContent';

/**
 * GameLayout Component
 * Immersive fullscreen viewport for active escape room gameplay.
 * Generic web navigation is hidden to preserve high-stakes lockdown immersion.
 */
export default function GameLayout() {
  return (
    <div className="min-h-screen w-screen bg-[#0B0C0D] text-slate-100 flex flex-col overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-200">
      <SkipToContent targetId="main-content" />

      {/* Background CRT scanlines effect */}
      <div className="fixed inset-0 scanlines-overlay opacity-25 pointer-events-none z-30" />

      {/* Subtle perimeter ambient edge */}
      <div className="fixed inset-0 border border-amber-950/60 pointer-events-none z-30" />

      {/* Active gameplay viewport */}
      <div id="main-content" className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
