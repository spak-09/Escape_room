import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  Info,
  Clock,
  Send,
  Eye,
  Crosshair,
} from 'lucide-react';
import TerminalCard from '../../../components/common/TerminalCard';
import TerminalButton from '../../../components/common/TerminalButton';
import StatusBadge from '../../../components/common/StatusBadge';
import { useSound } from '../../../hooks/useSound';

/**
 * InboxRoomShell
 * Sector 01: The Inbox (Phishing Defense)
 * Fully interactive EmailEvidenceViewer with deep forensic investigation,
 * indicator discovery tracking, and zero client-side authority.
 */
export default function InboxRoomShell({
  roomMetadata,
  challengeData,
  onDecisionSubmit,
  onRequestHint,
  isSubmitting,
}) {
  const { playClick, playKeystroke, playChime } = useSound();

  // Timing tracking for speed bonus
  const [timeElapsedSeconds, setTimeElapsedSeconds] = useState(0);
  const timerRef = useRef(null);

  // Forensic inspection states
  const [inspectedArtifacts, setInspectedArtifacts] = useState([]);
  const [showRawHeaders, setShowRawHeaders] = useState(false);
  const [activeInspector, setActiveInspector] = useState(null); // 'sender' | 'replyTo' | 'headers' | 'link' | null
  const [selectedActionId, setSelectedActionId] = useState(null);

  const evidence = challengeData?.evidence || {};
  const headers = evidence?.headers || {};

  // Track elapsed time
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // Handle artifact inspection and track forensic bonus tokens
  const recordArtifactInspection = (artifactKey) => {
    playClick();
    if (!inspectedArtifacts.includes(artifactKey)) {
      setInspectedArtifacts((prev) => [...prev, artifactKey]);
      playChime();
    }
  };

  const handleInspectSection = (section, artifactKey) => {
    setActiveInspector((prev) => (prev === section ? null : section));
    if (artifactKey) {
      recordArtifactInspection(artifactKey);
    }
  };

  // Submit decision with collected forensic tokens and elapsed time
  const handleAction = (actionId) => {
    setSelectedActionId(actionId);
    onDecisionSubmit(actionId, {
      inspectedArtifacts,
      timeElapsedSeconds: Math.max(1, timeElapsedSeconds),
    });
  };

  const isSenderTyposquatted = evidence.sender && evidence.sender.includes('0');
  const isReplyToMismatched = evidence.replyTo && evidence.sender && !evidence.sender.includes('shadow-c2');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
      {/* Left 2 Cols: Email Evidence Workspace */}
      <div className="lg:col-span-2 space-y-6">
        <TerminalCard
          title={`SECTOR 01 // ${roomMetadata?.title || 'THE INBOX'}`}
          subtitle="COMMUNICATION FORENSICS INTERCEPT"
          icon={Mail}
          variant="cyan"
          badge={<StatusBadge status="ACTIVE" size="sm" label="LIVE INTERCEPT" />}
        >
          {/* Directive Prompt & Timer */}
          <div className="mb-4 p-3.5 bg-slate-950/70 border border-slate-800 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>INCIDENT DIRECTIVE</span>
              </span>
              <p className="text-slate-200 leading-relaxed text-xs">
                {challengeData?.prompt || 'Inspect the incoming transmission for malicious indicators of compromise before selecting an authoritative countermeasure.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded text-[11px] text-slate-400 shrink-0 self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>TIME: {timeElapsedSeconds}s</span>
            </div>
          </div>

          {/* Email Client Container */}
          <div className="rounded-lg border border-slate-800 bg-[#080909] overflow-hidden shadow-xl">
            {/* Email Header Bar */}
            <div className="p-4 bg-slate-950/90 border-b border-slate-800 space-y-2.5">
              {/* Sender Line */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] w-16">FROM:</span>
                  <button
                    type="button"
                    onClick={() => handleInspectSection('sender', 'url_inspect')}
                    className={`text-left px-2 py-0.5 rounded border transition-colors flex items-center gap-1.5 ${
                      activeInspector === 'sender'
                        ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-200'
                    }`}
                    title="Click to analyze sender domain"
                  >
                    <span>{evidence.sender || 'Unknown Sender'}</span>
                    <Search className="w-3 h-3 text-cyan-400" />
                  </button>
                </div>
                {evidence.receivedTime && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(evidence.receivedTime).toUTCString()}
                  </span>
                )}
              </div>

              {/* Sender Domain Inspector Callout */}
              {activeInspector === 'sender' && (
                <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-500/50 text-[11px] text-cyan-200 space-y-1">
                  <span className="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                    <Crosshair className="w-3.5 h-3.5" /> DOMAIN RESOLUTION FORENSICS:
                  </span>
                  <p className="text-slate-300">
                    Domain identified: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">micr0soft-update.com</code>.
                    Notice the numeral <strong className="text-red-400">0</strong> substituting the letter 'o' (Homoglyph / Typosquatted domain).
                  </p>
                </div>
              )}

              {/* Reply-To Line */}
              {evidence.replyTo && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] w-16">REPLY-TO:</span>
                  <button
                    type="button"
                    onClick={() => handleInspectSection('replyTo', 'header_return_path')}
                    className={`text-left px-2 py-0.5 rounded border transition-colors flex items-center gap-1.5 ${
                      activeInspector === 'replyTo'
                        ? 'border-amber-500 bg-amber-950/60 text-amber-300'
                        : 'border-amber-500/40 bg-amber-950/20 text-amber-200 hover:border-amber-500'
                    }`}
                    title="Click to examine Return-Path mismatch"
                  >
                    <span>{evidence.replyTo}</span>
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                  </button>
                  <span className="text-[10px] text-amber-400/80">[MISMATCH DETECTED]</span>
                </div>
              )}

              {/* Reply-To Inspector Callout */}
              {activeInspector === 'replyTo' && (
                <div className="p-2.5 rounded bg-amber-950/40 border border-amber-500/50 text-[11px] text-amber-200 space-y-1">
                  <span className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> ROUTING MISMATCH FORENSICS:
                  </span>
                  <p className="text-slate-300">
                    Return path routes responses to <code className="bg-slate-900 px-1.5 py-0.5 rounded text-red-300">{evidence.replyTo?.split('@')[1] || evidence.replyTo || 'external server'}</code>, diverging from the pretended sender domain.
                  </p>
                </div>
              )}

              {/* Subject Line */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] w-16">SUBJECT:</span>
                <span className="text-cyan-300 font-bold">{evidence.subject || 'No Subject'}</span>
              </div>
            </div>

            {/* Email Authentication Badges Bar */}
            <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px]">
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-[10px] uppercase font-bold">AUTH STATUS:</span>

                {/* SPF Badge */}
                <button
                  type="button"
                  onClick={() => handleInspectSection('headers', 'spf_check')}
                  className={`px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 transition-colors ${
                    headers.spf === 'PASS'
                      ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30'
                      : 'border-red-500/60 text-red-400 bg-red-950/40 hover:bg-red-900/40'
                  }`}
                  title="Click to inspect SPF validation"
                >
                  {headers.spf === 'PASS' ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                  <span>SPF: {headers.spf || 'NONE'}</span>
                </button>

                {/* DKIM Badge */}
                <span
                  className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                    headers.dkim === 'PASS'
                      ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30'
                      : 'border-amber-500/40 text-amber-400 bg-amber-950/30'
                  }`}
                >
                  DKIM: {headers.dkim || 'NONE'}
                </span>

                {/* DMARC Badge */}
                <span
                  className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                    headers.dmarc === 'PASS'
                      ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30'
                      : 'border-red-500/60 text-red-400 bg-red-950/40'
                  }`}
                >
                  DMARC: {headers.dmarc || 'NONE'}
                </span>
              </div>

              {/* Toggle Raw RFC822 Headers */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setShowRawHeaders((p) => !p);
                  recordArtifactInspection('header_return_path');
                }}
                className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono"
              >
                <span>{showRawHeaders ? 'HIDE RFC822 HEADERS' : 'INSPECT RFC822 HEADERS'}</span>
                {showRawHeaders ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* SPF Header Callout */}
            {activeInspector === 'headers' && (
              <div className="p-3 bg-red-950/40 border-b border-red-500/40 text-[11px] text-red-200 space-y-1">
                <span className="font-bold text-red-300 uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> SENDER POLICY FRAMEWORK (SPF) AUDIT:
                </span>
                <p className="text-slate-300">
                  Originating IP was NOT authorized by the legitimate domain owner to transmit emails on behalf of this brand. SPF and DMARC checks both reported <strong className="text-red-400">HARD FAIL</strong>.
                </p>
              </div>
            )}

            {/* Collapsible Raw RFC822 Headers Box */}
            {showRawHeaders && (
              <div className="p-3.5 bg-black/90 border-b border-slate-800 text-[10px] text-slate-300 font-mono space-y-1">
                <p className="text-slate-500 uppercase tracking-widest mb-1.5">// FORENSIC EMAIL HEADERS</p>
                <p><span className="text-cyan-400">Authentication-Results:</span> spf={headers.spf || 'FAIL'}; dkim={headers.dkim || 'NONE'}; dmarc={headers.dmarc || 'FAIL'}</p>
                <p><span className="text-cyan-400">Received-From:</span> mail.shadow-c2.net [185.220.101.4]</p>
                <p><span className="text-cyan-400">Return-Path:</span> &lt;{headers.returnPath || evidence.replyTo}&gt;</p>
                <p><span className="text-cyan-400">X-Mailer:</span> PHPMailer 6.2.0 (Simulated Attack Framework)</p>
              </div>
            )}

            {/* Email Body Content */}
            <div className="p-6 text-slate-200 leading-relaxed text-xs space-y-4">
              <p className="whitespace-pre-line text-sm">{evidence.body}</p>

              {/* Interactive Hyperlink Inspector */}
              {evidence.linkTarget && (
                <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    INTERACTIVE HYPERLINK INSPECTION TERMINAL:
                  </span>

                  <button
                    type="button"
                    onClick={() => handleInspectSection('link', 'url_inspect')}
                    className={`w-full text-left p-3 rounded border transition-all ${
                      activeInspector === 'link'
                        ? 'border-cyan-400 bg-cyan-950/50 shadow-neon-cyan/20'
                        : 'border-slate-800 hover:border-cyan-500/50 bg-slate-950/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                        <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                        <span>DISPLAY TEXT:</span>
                        <span className="underline">{evidence.linkDisplayText || evidence.linkTarget}</span>
                      </div>
                      <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/40">
                        CLICK TO RESOLVE DESTINATION
                      </span>
                    </div>
                  </button>

                  {/* Destination Analysis Callout */}
                  {activeInspector === 'link' && (
                    <div className="p-3 bg-red-950/40 border border-red-500/50 rounded text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-red-400" /> TRUE RESOLVED DESTINATION:
                        </span>
                        <code className="text-red-300 bg-red-900/60 px-2 py-0.5 rounded font-bold">
                          {evidence.linkTarget}
                        </code>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {evidence.linkInspectionNotes || `Notice the critical discrepancy: while the anchor displays "${evidence.linkDisplayText || 'legitimate service'}", the actual hyperlink targets an unverified external destination ("${evidence.linkTarget}") designed to compromise workstation integrity.`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </TerminalCard>
      </div>

      {/* Right 1 Col: Tactical Countermeasures Dock */}
      <div className="space-y-6">
        <TerminalCard
          title="TACTICAL DOCK"
          subtitle="AUTHORITATIVE MITIGATION"
          icon={AlertTriangle}
          variant="amber"
        >
          <div className="space-y-4">
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Every action carries authoritative consequences evaluated by facility security kernels.
            </p>

            {/* Forensic Discovery Tracker */}
            <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-300 uppercase tracking-wide">
                  FORENSIC ARTIFACTS
                </span>
                <span className="text-cyan-400 font-bold">
                  {inspectedArtifacts.length} DISCOVERED
                </span>
              </div>

              <div className="space-y-1 text-[10px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>SPF / DMARC Header</span>
                  <span>{inspectedArtifacts.includes('spf_check') ? '✓ VERIFIED' : '○ PENDING'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Hyperlink Resolution</span>
                  <span>{inspectedArtifacts.includes('url_inspect') ? '✓ VERIFIED' : '○ PENDING'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Return-Path Mismatch</span>
                  <span>{inspectedArtifacts.includes('header_return_path') ? '✓ VERIFIED' : '○ PENDING'}</span>
                </div>
              </div>

              {inspectedArtifacts.length >= 3 && (
                <div className="pt-1 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>DEEP INVESTIGATION BONUS ELIGIBLE</span>
                </div>
              )}
            </div>

            {/* Action Decision Buttons from Backend */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                AVAILABLE COUNTERMEASURES:
              </span>

              {challengeData?.availableActions?.map((action) => {
                const isSelected = selectedActionId === action.actionId;
                return (
                  <TerminalButton
                    key={action.actionId}
                    variant={action.variant || 'primary'}
                    size="md"
                    fullWidth
                    disabled={isSubmitting}
                    isLoading={isSubmitting && isSelected}
                    onClick={() => handleAction(action.actionId)}
                  >
                    {action.label}
                  </TerminalButton>
                );
              })}
            </div>
          </div>
        </TerminalCard>
      </div>
    </div>
  );
}
