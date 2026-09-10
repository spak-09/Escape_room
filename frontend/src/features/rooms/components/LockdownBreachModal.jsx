import React from 'react';
import { Skull, AlertTriangle, RotateCcw, Home } from 'lucide-react';
import TerminalModal from '../../../components/common/TerminalModal';
import TerminalButton from '../../../components/common/TerminalButton';
import { formatScore } from '../../../utils/formatters';

/**
 * LockdownBreachModal
 * Game Over terminal lock when all operational lives are depleted (livesRemaining === 0).
 * Prevents further submissions to locked session and allows retry or exit to dashboard.
 */
export default function LockdownBreachModal({
  isOpen,
  score = 0,
  sectorIndex = 1,
  reason = 'LOCKDOWN_BREACH',
  onRestartSession,
  onExitDashboard,
  isLoading = false,
}) {
  return (
    <TerminalModal
      isOpen={isOpen}
      onClose={() => {}} // Non-dismissible via escape or click outside
      showCloseButton={false}
      variant="danger"
      title="CRITICAL FACILITY LOCKDOWN BREACH"
      subtitle="Operational Lives Depleted // Terminal Locked"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5 font-mono text-xs text-center">
        {/* Skull Breach Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-red-950/80 border-2 border-red-500/80 flex items-center justify-center shadow-neon-crimson">
          <Skull className="w-8 h-8 text-red-400 animate-pulse" />
        </div>

        {/* Breach Alert Text */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-red-300 uppercase tracking-widest">
            CONTAINMENT PROTOCOLS COMPROMISED
          </h3>
          <p className="text-slate-300 leading-relaxed text-xs">
            All 3 tactical countermeasures have failed. Malicious intrusion has completely overrun Sector {String(sectorIndex).padStart(2, '0')} and forced a total facility blackout.
          </p>
          <div className="inline-block px-3 py-1 rounded bg-red-950/90 border border-red-500/40 text-red-400 font-bold text-[11px]">
            INCIDENT STATUS: {reason}
          </div>
        </div>

        {/* Final Stand Stats */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/80 rounded border border-slate-800 text-left">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              FINAL SCORE
            </span>
            <span className="text-sm font-bold text-amber-400">
              {formatScore(score)} PTS
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              MAX REACHED SECTOR
            </span>
            <span className="text-sm font-bold text-slate-200">
              SECTOR {String(sectorIndex).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Tactical Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <TerminalButton
            variant="ghost"
            onClick={onExitDashboard}
            icon={Home}
            disabled={isLoading}
          >
            CADET COMMAND
          </TerminalButton>
          <TerminalButton
            variant="danger"
            onClick={onRestartSession}
            icon={RotateCcw}
            isLoading={isLoading}
          >
            RE-ENGAGE CONTAINMENT
          </TerminalButton>
        </div>
      </div>
    </TerminalModal>
  );
}
