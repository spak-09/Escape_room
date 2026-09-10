import React from 'react';
import { ShieldAlert, Check, HelpCircle } from 'lucide-react';
import TerminalModal from '../../../components/common/TerminalModal';
import TerminalButton from '../../../components/common/TerminalButton';

/**
 * HintConfirmationModal
 * Displays confirmation prompt warning player of -75 score penalty,
 * and subsequently presents the decrypted tactical intelligence payload.
 */
export default function HintConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  hintContent,
  isLoading = false,
  error = null,
}) {
  return (
    <TerminalModal
      isOpen={isOpen}
      onClose={onClose}
      title="TACTICAL INTELLIGENCE PROTOCOL"
      subtitle="Advisory Decryption Terminal"
      variant={hintContent ? 'emerald' : 'warning'}
      maxWidth="max-w-md"
    >
      {hintContent ? (
        <div className="space-y-4 font-mono text-xs">
          <div className="rounded border border-emerald-500/40 bg-emerald-950/30 p-4 text-emerald-200">
            <p className="font-bold uppercase tracking-wider mb-2 text-emerald-300 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> DECRYPTED INTEL:
            </p>
            <p className="leading-relaxed">{hintContent}</p>
          </div>
          <TerminalButton
            variant="emerald"
            fullWidth
            onClick={onClose}
          >
            RETURN TO INVESTIGATION
          </TerminalButton>
        </div>
      ) : (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-start gap-3 rounded border border-amber-500/40 bg-amber-950/20 p-3.5 text-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300 uppercase tracking-wide">
                SCORE PENALTY NOTICE
              </p>
              <p className="mt-1 text-slate-300 leading-relaxed">
                Requesting facility intelligence will deduct <strong className="text-amber-300">-75 points</strong> from your sector clearance score.
              </p>
            </div>
          </div>

          {error && (
            <p className="text-red-400 font-mono text-xs bg-red-950/40 border border-red-500/30 p-2.5 rounded">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <TerminalButton
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              CANCEL
            </TerminalButton>
            <TerminalButton
              variant="warning"
              isLoading={isLoading}
              onClick={onConfirm}
              icon={HelpCircle}
            >
              DECRYPT HINT (-75 PTS)
            </TerminalButton>
          </div>
        </div>
      )}
    </TerminalModal>
  );
}
