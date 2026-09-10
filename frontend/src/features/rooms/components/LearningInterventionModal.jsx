import React from 'react';
import { ShieldAlert, BookOpen, AlertOctagon, CheckCircle, Lightbulb, Compass, ArrowRight } from 'lucide-react';
import TerminalModal from '../../../components/common/TerminalModal';
import TerminalButton from '../../../components/common/TerminalButton';

/**
 * LearningInterventionModal
 * Authoritative 5-part debrief modal rendered when a player makes an unsafe decision.
 * Displays:
 * 1. What Happened
 * 2. Evidence Revealed
 * 3. Why Dangerous
 * 4. Correct Action
 * 5. Security Tip
 */
export default function LearningInterventionModal({
  isOpen,
  intervention,
  onAcknowledge,
}) {
  if (!intervention) return null;

  const { level = 2, type = 'CONTEXTUAL_EXPLANATION', topic = 'TACTICAL', explanation } = intervention;
  const expl = explanation || {};

  const levelLabels = {
    1: 'LEVEL 1: RAPID ADVISORY',
    2: 'LEVEL 2: CONTEXTUAL EXPLANATION',
    3: 'LEVEL 3: GUIDED REMEDIATION',
    4: 'LEVEL 4: DEEP SCAFFOLDING TUTORIAL',
  };

  return (
    <TerminalModal
      isOpen={isOpen}
      onClose={onAcknowledge}
      showCloseButton={true}
      variant="warning"
      title="TACTICAL LEARNING INTERVENTION"
      subtitle={`${levelLabels[level] || 'INCIDENT DEBRIEF'} // VECTOR: ${String(topic).toUpperCase()}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 font-mono text-xs">
        {/* Intervention Header Ribbon */}
        <div className="flex items-center justify-between bg-amber-950/40 border border-amber-500/40 rounded px-3.5 py-2 text-amber-200">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="font-bold uppercase tracking-wider text-[11px]">
              INCIDENT INVESTIGATION BREAKDOWN
            </span>
          </div>
          <span className="text-[10px] text-amber-300 font-bold bg-amber-900/60 px-2 py-0.5 rounded border border-amber-500/40">
            {type.replace('_', ' ')}
          </span>
        </div>

        {/* 5-Part Authoritative Debrief Sections */}
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {/* 1. What Happened */}
          {expl.whatHappened && (
            <div className="p-3 bg-slate-950/80 rounded border border-slate-800">
              <div className="flex items-center gap-2 text-red-400 font-bold uppercase text-[11px] mb-1.5">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>1. INCIDENT RECONSTRUCTION (WHAT OCCURRED)</span>
              </div>
              <p className="text-slate-300 leading-relaxed pl-5">
                {expl.whatHappened}
              </p>
            </div>
          )}

          {/* 2. Evidence Revealed */}
          {expl.evidence && (
            <div className="p-3 bg-slate-950/80 rounded border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase text-[11px] mb-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>2. FORENSIC EVIDENCE (INDICATORS OF COMPROMISE)</span>
              </div>
              <p className="text-slate-300 leading-relaxed pl-5">
                {expl.evidence}
              </p>
            </div>
          )}

          {/* 3. Why Dangerous */}
          {expl.whyDangerous && (
            <div className="p-3 bg-slate-950/80 rounded border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-[11px] mb-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>3. THREAT VECTOR & IMPACT (WHY IT'S DANGEROUS)</span>
              </div>
              <p className="text-slate-300 leading-relaxed pl-5">
                {expl.whyDangerous}
              </p>
            </div>
          )}

          {/* 4. Correct Action */}
          {expl.correctAction && (
            <div className="p-3 bg-slate-950/80 rounded border border-emerald-900/50 bg-emerald-950/10">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-[11px] mb-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>4. AUTHORIZED PROTOCOL (WHAT YOU SHOULD HAVE DONE)</span>
              </div>
              <p className="text-emerald-200 leading-relaxed pl-5">
                {expl.correctAction}
              </p>
            </div>
          )}

          {/* 5. Security Tip */}
          {expl.securityTip && (
            <div className="p-3 bg-slate-950/80 rounded border border-cyan-900/50 bg-cyan-950/10">
              <div className="flex items-center gap-2 text-cyan-300 font-bold uppercase text-[11px] mb-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>5. SOC TACTICAL DEFENSE DIRECTIVE</span>
              </div>
              <p className="text-cyan-200 leading-relaxed pl-5 italic">
                "{expl.securityTip}"
              </p>
            </div>
          )}
        </div>

        {/* Footer Acknowledgement */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Cadet debrief logged to training telemetry.
          </p>
          <TerminalButton
            variant="warning"
            size="md"
            onClick={onAcknowledge}
            icon={ArrowRight}
          >
            ACKNOWLEDGE & RESUME
          </TerminalButton>
        </div>
      </div>
    </TerminalModal>
  );
}
