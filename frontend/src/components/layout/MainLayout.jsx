import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Shield, Volume2, VolumeX, Terminal, Trophy, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import StatusBadge from '../common/StatusBadge';
import SkipToContent from '../common/SkipToContent';

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isMuted, toggleMute } = useSound();
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'FACILITY HQ', icon: Shield },
    { path: '/leaderboard', label: 'LEADERBOARD', icon: Trophy },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0d14] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <SkipToContent targetId="main-content" />

      {/* Top Facility Header Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0d121f]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Facility Identity */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 rounded px-1"
          >
            <div className="w-9 h-9 rounded bg-cyan-950/60 border border-cyan-500/50 flex items-center justify-center text-cyan-400 group-hover:shadow-neon-cyan transition-all">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-extrabold tracking-wider text-slate-100 group-hover:text-cyan-300 transition-colors">
                  DIGITAL SAFETY ESCAPE ROOM
                </span>
                <StatusBadge status="ACTIVE" size="sm" label="ONLINE" />
              </div>
              <p className="text-[10px] font-mono text-slate-500 tracking-tight">
                SECTOR CONTAINMENT ARCHITECTURE // MIL-SPEC v1.0
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded font-mono text-xs font-semibold tracking-wider transition-colors border ${
                    isActive
                      ? 'bg-cyan-950/50 text-cyan-300 border-cyan-500/40 shadow-neon-cyan/20'
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls: Audio + Auth */}
          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleMute}
              className={`p-2 rounded border font-mono text-xs transition-colors flex items-center gap-1.5 ${
                isMuted
                  ? 'border-slate-800 text-slate-500 hover:text-slate-300 bg-slate-950/40'
                  : 'border-cyan-500/40 text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 shadow-neon-cyan/10'
              }`}
              title={isMuted ? 'Unmute Facility Audio' : 'Mute Facility Audio'}
              aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isMuted ? 'AUDIO: OFF' : 'AUDIO: ON'}</span>
            </button>

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 rounded border border-slate-700/80 bg-slate-900/60 hover:border-cyan-500/40 text-slate-200 hover:text-cyan-300 font-mono text-xs transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="max-w-[100px] truncate">{user?.username || 'CADET'}</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="p-2 rounded border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/40 bg-slate-950/40 transition-colors"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-2 px-4 py-1.5 rounded border border-cyan-500/50 bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 font-mono text-xs font-semibold tracking-wider transition-all shadow-neon-cyan/20"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>TERMINAL ACCESS</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main id="main-content" className="flex-1 relative">
        <div className="absolute inset-0 scanlines-overlay opacity-30 pointer-events-none" />
        <Outlet />
      </main>

      {/* Facility Footer */}
      <footer className="border-t border-slate-800/60 bg-[#070a10] py-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SECURE FACILITY INCIDENT SIMULATOR // CLASSIFIED CADET TRAINING</span>
          <span>EST. 2026 // ZERO CLIENT-SIDE AUTHORITY VALIDATED</span>
        </div>
      </footer>
    </div>
  );
}
