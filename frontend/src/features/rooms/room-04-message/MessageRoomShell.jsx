import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  PhoneCall,
  Info,
  Clock,
  BookOpen,
  Radio,
  FileCheck2,
  CheckCircle2,
  User,
} from 'lucide-react';
import TerminalCard from '../../../components/common/TerminalCard';
import TerminalButton from '../../../components/common/TerminalButton';
import StatusBadge from '../../../components/common/StatusBadge';
import { useSound } from '../../../hooks/useSound';

/**
 * MessageRoomShell
 * Sector 04: The Message (Social Engineering / Pretexting Defense)
 * Interactive MessageThreadViewer with corporate directory lookup,
 * channel verification, and MFA disclosure policy check.
 */
export default function MessageRoomShell({
  roomMetadata,
  challengeData,
  onDecisionSubmit,
  onRequestHint,
  isSubmitting,
}) {
  const { playClick, playChime } = useSound();

  const [timeElapsedSeconds, setTimeElapsedSeconds] = useState(0);
  const timerRef = useRef(null);

  const [inspectedArtifacts, setInspectedArtifacts] = useState([]);
  const [activeForensicTool, setActiveForensicTool] = useState('message'); // 'message' | 'directory' | 'channel' | 'policy'
  const [selectedActionId, setSelectedActionId] = useState(null);

  const evidence = challengeData?.evidence || {};
  const directory = evidence?.internalDirectoryRecord || {};

  // Track elapsed time
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // Record forensic token
  const recordArtifactInspection = (artifactKey) => {
    playClick();
    if (!inspectedArtifacts.includes(artifactKey)) {
      setInspectedArtifacts((prev) => [...prev, artifactKey]);
      playChime();
    }
  };

  const handleSelectTool = (toolKey, artifactKey) => {
    setActiveForensicTool(toolKey);
    if (artifactKey) {
      recordArtifactInspection(artifactKey);
    }
  };

  // Submit decision to backend
  const handleAction = (actionId) => {
    setSelectedActionId(actionId);
    onDecisionSubmit(actionId, {
      inspectedArtifacts,
      timeElapsedSeconds: Math.max(1, timeElapsedSeconds),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
      {/* Left 2 Cols: Secure Communications Transceiver */}
      <div className="lg:col-span-2 space-y-6">
        <TerminalCard
          title={`SECTOR 04 // ${roomMetadata?.title || 'THE MESSAGE'}`}
          subtitle="COMMUNICATIONS TRANSCEIVER & SOCIAL ENGINEERING DETECTION"
          icon={MessageSquare}
          variant="magenta"
          badge={<StatusBadge status="DANGER" size="sm" label="INBOUND TRANSCEIVER" />}
        >
          {/* Directive Prompt & Timer */}
          <div className="mb-4 p-3.5 bg-slate-950/70 border border-slate-800 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-pink-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>INCIDENT DIRECTIVE</span>
              </span>
              <p className="text-slate-200 leading-relaxed text-xs">
                {challengeData?.prompt || 'Determine the appropriate response to the emergency direct message.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded text-[11px] text-slate-400 shrink-0 self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-pink-400" />
              <span>TIME: {timeElapsedSeconds}s</span>
            </div>
          </div>

          {/* Forensic Workstation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-4 overflow-x-auto text-[11px]">
            <button
              type="button"
              onClick={() => handleSelectTool('message')}
              className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeForensicTool === 'message'
                  ? 'border-pink-500 bg-pink-950/60 text-pink-300 font-bold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900/40'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>TRANSCEIVER THREAD</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTool('directory', 'directory_lookup')}
              className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeForensicTool === 'directory'
                  ? 'border-pink-500 bg-pink-950/60 text-pink-300 font-bold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900/40'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>ENTERPRISE DIRECTORY</span>
              {inspectedArtifacts.includes('directory_lookup') && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => handleSelectTool('channel', 'channel_verification')}
              className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeForensicTool === 'channel'
                  ? 'border-pink-500 bg-pink-950/60 text-pink-300 font-bold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900/40'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>CHANNEL AUTHENTICITY</span>
              {inspectedArtifacts.includes('channel_verification') && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => handleSelectTool('policy', 'policy_check')}
              className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeForensicTool === 'policy'
                  ? 'border-pink-500 bg-pink-950/60 text-pink-300 font-bold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900/40'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>MFA SECURITY POLICY</span>
              {inspectedArtifacts.includes('policy_check') && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>
          </div>

          {/* Main Display Area */}
          <div className="space-y-4">
            {/* View A: Transceiver Message Thread */}
            {activeForensicTool === 'message' && (
              <div className="rounded-lg border border-slate-800 bg-[#0a0d18] overflow-hidden shadow-xl">
                {/* Header Information Bar */}
                <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-pink-950/80 border border-pink-500/60 flex items-center justify-center text-pink-300 font-bold">
                      {evidence.senderName ? evidence.senderName[0] : 'V'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 text-sm">{evidence.senderName || 'VP Operations'}</span>
                        <span className="text-[10px] text-pink-400 bg-pink-950/80 px-2 py-0.5 rounded border border-pink-500/40 font-bold">
                          UNVERIFIED SENDER
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        HANDLE: <code className="text-pink-300">{evidence.senderHandle || '@m_vance_exec_secure'}</code>
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    ORIGIN: {evidence.channel || 'Direct Telegram Message'}
                  </span>
                </div>

                {/* Message Log Conversation */}
                <div className="p-5 space-y-4 bg-slate-950/40 min-h-[190px]">
                  <div className="max-w-[85%] bg-slate-900 border-l-4 border-red-500 rounded-r-lg p-4 space-y-2 shadow-lg">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-1.5">
                      <span className="font-bold text-pink-300">{evidence.senderName}</span>
                      <span className="text-[10px] text-slate-500">{evidence.receivedTime ? new Date(evidence.receivedTime).toLocaleTimeString() : '11:58:12'}</span>
                    </div>

                    <p className="text-slate-100 text-xs leading-relaxed font-sans">
                      "{evidence.messageText || 'I am in a critical emergency board meeting and locked out of the Sector 04 core server. Send me the 6-digit OTP sent to your terminal RIGHT NOW or the entire facility contract is terminated!'}"
                    </p>

                    <div className="pt-2 flex flex-wrap gap-2 text-[10px]">
                      <span className="bg-red-950/80 border border-red-500/50 text-red-300 px-2 py-0.5 rounded font-bold">
                        PRESSURE: CAREER / CONTRACT TERMINATION
                      </span>
                      <span className="bg-amber-950/80 border border-amber-500/50 text-amber-300 px-2 py-0.5 rounded font-bold">
                        PRETEXT: EXECUTIVE EMERGENCY LOCKOUT
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View B: Enterprise Directory Lookup */}
            {activeForensicTool === 'directory' && (
              <div className="p-4 rounded-lg border border-pink-500/40 bg-slate-950/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-pink-400" />
                    AUTHORITATIVE CORPORATE DIRECTORY RECORD
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">[VERIFIED INTERNAL RECORD]</span>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">OFFICIAL NAME:</span>
                      <span className="text-slate-200 font-bold">{directory.name || 'Marcus Vance'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">EXECUTIVE TITLE:</span>
                      <span className="text-slate-200 font-bold">{directory.title || 'VP of Operations'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">VERIFIED DESK PHONE (OOB):</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <PhoneCall className="w-3 h-3" /> {directory.officialPhone || '+1-555-0199'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">OFFICIAL ENTERPRISE SLACK:</span>
                      <span className="text-cyan-300 font-bold">{directory.officialSlack || '@marcus.vance'}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-200">
                    <span className="font-bold">DIRECTORY AUDIT NOTICE:</span> The sender in the message used a personal Telegram handle (<code className="text-pink-300 font-bold">@m_vance_exec_secure</code>), which is completely absent from the enterprise directory.
                  </div>
                </div>
              </div>
            )}

            {/* View C: Channel Authenticity Verifier */}
            {activeForensicTool === 'channel' && (
              <div className="p-4 rounded-lg border border-pink-500/40 bg-slate-950/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-pink-400" />
                    COMMUNICATION CHANNEL AUTHENTICITY AUDIT
                  </span>
                  <span className="text-[10px] text-red-400 font-bold">UNVETTED PROTOCOL</span>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded bg-red-950/30 border border-red-500/40 space-y-1">
                      <span className="font-bold text-red-300 block">INBOUND MESSAGE CHANNEL</span>
                      <p className="text-[11px] text-slate-300">Third-Party Personal Telegram</p>
                      <span className="text-[10px] text-red-400 block font-bold">No Enterprise SSO / Identity Attestation</span>
                    </div>

                    <div className="p-3 rounded bg-emerald-950/30 border border-emerald-500/40 space-y-1">
                      <span className="font-bold text-emerald-300 block">AUTHORIZED FACILITY CHANNEL</span>
                      <p className="text-[11px] text-slate-300">Enterprise Slack / Desk Phone (VoIP)</p>
                      <span className="text-[10px] text-emerald-400 block font-bold">MFA-Protected & Hardware Bound</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Social engineers intentionally pivot targets to external chat platforms (Telegram, WhatsApp, Signal) where enterprise monitoring and security logging do not exist.
                  </p>
                </div>
              </div>
            )}

            {/* View D: MFA Security Policy Check */}
            {activeForensicTool === 'policy' && (
              <div className="p-4 rounded-lg border border-pink-500/40 bg-slate-950/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-pink-400" />
                    FACILITY STANDING ORDER: MFA TOKEN GOVERNANCE
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">MANDATORY PROTOCOL</span>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-3">
                  <div className="p-3 rounded bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed space-y-2">
                    <p className="text-pink-300 font-bold">
                      POLICY CLAUSE 14.3 — PROHIBITION OF CREDENTIAL / TOKEN SURRENDER:
                    </p>
                    <blockquote className="border-l-2 border-pink-500 pl-3 italic text-slate-300 text-[11px]">
                      "{directory.policyNote || 'Executives and IT administrators will NEVER contact personnel via personal Telegram or request OTP / 2FA tokens. Any request for OTP tokens is inherently fraudulent.'}"
                    </blockquote>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    The single valid response to an urgent OTP request is to decline and independently contact the requester out-of-band using the directory desk phone number.
                  </p>
                </div>
              </div>
            )}
          </div>
        </TerminalCard>
      </div>

      {/* Right 1 Col: Tactical Countermeasures Dock */}
      <div className="space-y-6">
        <TerminalCard
          title="TACTICAL DOCK"
          subtitle="PRETEXT RESPONSE"
          icon={AlertTriangle}
          variant="magenta"
        >
          <div className="space-y-4">
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Select an authoritative protocol to counter this social engineering vector.
            </p>

            {/* Forensic Discovery Tracker */}
            <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-300 uppercase tracking-wide">
                  FORENSIC ARTIFACTS
                </span>
                <span className="text-pink-400 font-bold">
                  {inspectedArtifacts.length} DISCOVERED
                </span>
              </div>

              <div className="space-y-1 text-[10px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Directory Lookup Record</span>
                  <span>{inspectedArtifacts.includes('directory_lookup') ? '✓ VERIFIED' : '○ PENDING'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Channel Authenticity Audit</span>
                  <span>{inspectedArtifacts.includes('channel_verification') ? '✓ VERIFIED' : '○ PENDING'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>MFA Token Governance Policy</span>
                  <span>{inspectedArtifacts.includes('policy_check') ? '✓ VERIFIED' : '○ PENDING'}</span>
                </div>
              </div>

              {inspectedArtifacts.length >= 3 && (
                <div className="pt-1 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>DEEP INVESTIGATION BONUS ELIGIBLE</span>
                </div>
              )}
            </div>

            {/* Action Decision Buttons */}
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
