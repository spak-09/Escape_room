import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Lock, Unlock } from 'lucide-react';
import { useSound } from '../../../hooks/useSound';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

/**
 * PneumaticDoorTransition
 * Cinematic hydraulic bulkhead door animation when entering or transitioning between sectors.
 * Synthesizes pneumatic hiss audio and renders dual sliding reinforced blast doors.
 */
export default function PneumaticDoorTransition({
  isOpen = false,
  doorLabel = 'BULKHEAD DOORWAY',
  subtext = 'SECTOR PRESSURE TRANSIT',
  duration = 1200,
  onComplete,
}) {
  const { playPneumaticDoor } = useSound();
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState('idle'); // 'closing' | 'sealed' | 'opening' | 'idle'

  useEffect(() => {
    if (isOpen) {
      setPhase('closing');
      playPneumaticDoor();

      // Sealed pause
      const sealTimer = setTimeout(() => {
        setPhase('sealed');
      }, duration * 0.4);

      // Opening phase
      const openTimer = setTimeout(() => {
        setPhase('opening');
        playPneumaticDoor();
      }, duration * 0.7);

      // Complete
      const doneTimer = setTimeout(() => {
        setPhase('idle');
        if (onComplete) onComplete();
      }, duration);

      return () => {
        clearTimeout(sealTimer);
        clearTimeout(openTimer);
        clearTimeout(doneTimer);
      };
    } else {
      setPhase('idle');
    }
  }, [isOpen, duration, onComplete, playPneumaticDoor]);

  if (!isOpen && phase === 'idle') return null;

  // In reduced-motion mode, show simple crossfade backdrop
  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 z-50 bg-[#07090f] flex items-center justify-center font-mono">
        <div className="text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-cyan-400 mx-auto animate-pulse" />
          <p className="text-sm font-bold text-cyan-300 uppercase tracking-widest">{doorLabel}</p>
          <p className="text-xs text-slate-400">{subtext}</p>
        </div>
      </div>
    );
  }

  const isClosed = phase === 'closing' || phase === 'sealed';

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto overflow-hidden flex font-mono select-none">
      {/* Left Blast Door Panel */}
      <motion.div
        className="relative w-1/2 h-full bg-[#0a0f1d] border-r-4 border-slate-700 shadow-2xl flex flex-col justify-between p-6 z-10"
        initial={{ x: '-100%' }}
        animate={{ x: isClosed ? '0%' : '-100%' }}
        transition={{ duration: duration / 2000, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Panel Industrial Detailing */}
        <div className="space-y-2 opacity-60">
          <div className="h-1 w-24 bg-cyan-500/40 rounded-full" />
          <p className="text-[10px] text-slate-400 tracking-wider">BULKHEAD HYDRAULIC SERVO A-01</p>
        </div>

        {/* Hazard Diagonal Stripe Border */}
        <div className="absolute right-0 top-0 bottom-0 w-3 bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_10px,#0f172a_10px,#0f172a_20px)] opacity-70" />

        {/* Center Label Left Wing */}
        <div className="text-right pr-6 space-y-1">
          <span className="text-xs text-slate-500 tracking-widest uppercase">FACILITY ISOLATION</span>
          <p className="text-sm font-bold text-cyan-300">{doorLabel}</p>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
          <span>PNEUMATIC PRESSURE BALANCED</span>
        </div>
      </motion.div>

      {/* Right Blast Door Panel */}
      <motion.div
        className="relative w-1/2 h-full bg-[#0a0f1d] border-l-4 border-slate-700 shadow-2xl flex flex-col justify-between p-6 z-10"
        initial={{ x: '100%' }}
        animate={{ x: isClosed ? '0%' : '100%' }}
        transition={{ duration: duration / 2000, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Panel Industrial Detailing */}
        <div className="space-y-2 opacity-60 text-right">
          <div className="h-1 w-24 bg-cyan-500/40 rounded-full ml-auto" />
          <p className="text-[10px] text-slate-400 tracking-wider">BULKHEAD HYDRAULIC SERVO B-02</p>
        </div>

        {/* Hazard Diagonal Stripe Border */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_10px,#0f172a_10px,#0f172a_20px)] opacity-70" />

        {/* Center Label Right Wing */}
        <div className="pl-6 space-y-1">
          <span className="text-xs text-slate-500 tracking-widest uppercase">TRANSIT LOCK</span>
          <p className="text-xs text-amber-300 font-bold uppercase">{subtext}</p>
        </div>

        <div className="text-right text-[10px] text-slate-500">
          <span>CLASSIFIED PROTOCOL 0x7F</span>
        </div>
      </motion.div>

      {/* Center Hydraulic Locking Core (Appears when doors meet) */}
      <AnimatePresence>
        {phase === 'sealed' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            <div className="bg-[#0f172a] border-2 border-cyan-500/80 rounded-xl px-6 py-4 shadow-neon-cyan/40 flex items-center gap-4 text-center">
              <Lock className="w-6 h-6 text-cyan-400 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-cyan-300 uppercase tracking-widest">
                  BULKHEAD INTERLOCK ENGAGED
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">PRESSURIZING NEXT SECTOR...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
