import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#0B0C0D] text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-mono selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background microgrid & scanlines */}
      <div className="absolute inset-0 facility-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-0 scanlines-overlay opacity-20 pointer-events-none" />

      {/* Top Bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between pb-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-300 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>RETURN TO FACILITY HQ</span>
        </Link>

        <div className="flex items-center gap-2">
          <StatusBadge status="ACTIVE" size="sm" label="AUTH GATEWAY ACTIVE" />
        </div>
      </header>

      {/* Main Auth Viewport */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-[10px] text-slate-500 max-w-md mx-auto pt-6">
        <span>SECURITY CLEARANCE GATEWAY // BCRYPT COST 12 ENFORCED // ALL ACCESS AUDITED</span>
      </footer>
    </div>
  );
}
