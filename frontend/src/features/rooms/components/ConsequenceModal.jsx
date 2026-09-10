import React from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldX, Award, Activity } from 'lucide-react';
import TerminalModal from '../../../components/common/TerminalModal';
import TerminalButton from '../../../components/common/TerminalButton';
import { formatScore } from '../../../utils/formatters';

/**
 * ConsequenceModal
 * Server-authoritative verdict display immediately following tactical action submission.
 * Reflects score deltas, life deductions, and consequence telemetry.
 */
export default function ConsequenceModal({
  isOpen,
  result,
  onContinue,
  onViewDebrief,
}) {
  if (!result) return null;

  const isCorrect = Boolean(result.isCorrect);
  const livesRemaining = typeof result.livesRemaining === 'number' ? result.livesRemaining : 3;
  const scoreDelta = result.scoreDelta || 0;
  const isEscapeCompleted = Boolean(result.escapeCompleted);
  const hasLearningIntervention = Boolean(result.learningIntervention);

  return (
    <TerminalModal
      isOpen={isOpen}
      onClose={onContinue}
      showCloseButton={false}
      variant={isCorrect ? 'emerald' : 'danger'}
      title={isCorrect ? 'CONTAINMENT PROTOCOL VERIFIED' : 'CONTAINMENT COUNTERMEASURE FAILED'}
      subtitle={isCorrect ? 'Tactical Action Approved' : 'Security Breach Telemetry'}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5 font-mono text-xs">
        {/* Banner with Icon & Primary Consequence Message */}
        <div
          className={`flex items-start gap-3.5 p-4 rounded-lg border ${
            isCorrect
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/40 border-red-500/50 text-red-200'
          }`}
        >
          {isCorrect ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldX className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p className="font-bold uppercase tracking-wide text-sm">
              {isCorrect ? 'THREAT VECTOR NEUTRALIZED' : 'CRITICAL INCIDENT DETECTED'}
            </p>
            <p className="leading-relaxed text-slate-300">{result.consequence}</p>
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Score Impact */}
          <div className="p-3 bg-slate-950/70 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
              SCORE DELTA
            </span>
            <div className="flex items-center gap-1.5">
              <Award className={`w-4 h-4 ${scoreDelta > 0 ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span
                className={`text-base font-bold ${
                  scoreDelta > 0 ? 'text-emerald-300 text-glow-emerald' : 'text-slate-400'
                }`}
              >
                {scoreDelta > 0 ? `+${scoreDelta}` : '0'} PTS
              </span>
            </div>
            {result.investigationBonusAwarded && (
              <span className="text-[10px] text-emerald-400/80 block mt-1">
                + BONUS: IoC Deep Analysis
              </span>
            )}
          </div>

          {/* Life Pool Status */}
          <div className="p-3 bg-slate-950/70 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
              FACILITY INTEGRITY
            </span>
            <div className="flex items-center gap-1.5">
              <Activity className={`w-4 h-4 ${livesRemaining <= 1 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`} />
              <span
                className={`text-base font-bold ${
                  livesRemaining <= 1 ? 'text-red-400' : 'text-slate-200'
                }`}
              >
                {livesRemaining} / 3 LIVES
              </span>
            </div>
            {!isCorrect && (
              <span className="text-[10px] text-red-400/80 block mt-1">
                -1 Operational Life Deducted
              </span>
            )}
          </div>
        </div>

        {/* Escape Completed Notice */}
        {isEscapeCompleted && (
          <div className="p-3 rounded bg-cyan-950/40 border border-cyan-500/50 text-cyan-200 text-center">
            <p className="font-bold uppercase tracking-wider text-cyan-300">
              FACILITY ESCAPE RUN COMPLETED!
            </p>
            <p className="text-[11px] text-slate-300 mt-1">
              All 5 security bulkheads decompressed. Emergency lockdown revoked.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
          {/* If incorrect and has learning intervention */}
          {!isCorrect && hasLearningIntervention && onViewDebrief && (
            <TerminalButton
              variant="warning"
              onClick={onViewDebrief}
              icon={AlertTriangle}
            >
              VIEW INCIDENT DEBRIEF
            </TerminalButton>
          )}

          {/* Primary Continue / Next Sector */}
          <TerminalButton
            variant={isCorrect ? 'emerald' : 'secondary'}
            onClick={onContinue}
            icon={ArrowRight}
          >
            {isEscapeCompleted
              ? 'PROCEED TO INCIDENT DEBRIEF'
              : isCorrect
              ? 'TRANSIT TO NEXT SECTOR'
              : 'RETRY SECTOR ANALYSIS'}
          </TerminalButton>
        </div>
      </div>
    </TerminalModal>
  );
}
