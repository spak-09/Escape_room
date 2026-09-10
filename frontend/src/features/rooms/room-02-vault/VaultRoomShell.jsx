import React, { useState, useEffect, useRef } from 'react';
import {
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Hash,
  AlertTriangle,
  Info,
  Clock,
  Database,
  Smartphone,
  Cpu,
  CheckCircle2,
  Sliders,
  Terminal as TerminalIcon,
} from 'lucide-react';
import TerminalCard from '../../../components/common/TerminalCard';
import TerminalButton from '../../../components/common/TerminalButton';
import StatusBadge from '../../../components/common/StatusBadge';
import { useSound } from '../../../hooks/useSound';

/**
 * VaultRoomShell
 * Sector 02: The Vault (Password & Credential Security)
 * Interactive VaultEvidenceViewer with forensic entropy calculator,
 * breach dump audit, and MFA protocol evaluation.
 */
export default function VaultRoomShell({
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
  const [activeForensicTool, setActiveForensicTool] = useState('accounts'); // 'accounts' | 'entropy' | 'breach' | 'mfa'
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [selectedActionId, setSelectedActionId] = useState(null);

  const evidence = challengeData?.evidence || {};
  const candidateAccounts = evidence?.candidateAccounts || [];

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
      {/* Left 2 Cols: Cryptographic Vault Terminal */}
      <div className="lg:col-span-2 space-y-6">
        <TerminalCard
          title={`SECTOR 02 // ${roomMetadata?.title || 'THE VAULT'}`}
          subtitle="AUTHENTICATION HARBOR & CRYPTOGRAPHIC ACCESS CONTROL"
          icon={KeyRound}
          variant="amber"
          badge={<StatusBadge status="WARNING" size="sm" label="VAULT LOCKDOWN" />}
        >
          {/* Directive Prompt & Timer */}
          <div className="mb-4 p-3.5 bg-slate-950/70 border border-slate-800 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>INCIDENT DIRECTIVE</span>
              </span>
              <p className="text-slate-200 leading-relaxed text-xs">
                {challengeData?.prompt || 'Inspect candidate authentication profiles and select the optimal credential configuration to secure Sector 02.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded text-[11px] text-slate-400 shrink-0 self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>TIME: {timeElapsedSeconds}s</span>
            </div>
          </div>

          {/* Forensic Workstation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-4 overflow-x-auto text-[11px]">
            <button
              type="button"
              onClick={() => handleSelectTool('accounts')}
              className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeForensicTool === 'accounts'
                  ? 'border-amber-500 bg-amber-950/60 text-amber-300 font-bold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900/40'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>CANDIDATE ACCOUNTS ({candidateAccounts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTool('entropy', 'entropy_calculator')}
              className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeForensicTool === 'entropy'
                  ? 'border-amber-500 bg-amber-950/60 text-amber-300 font-bold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900/40'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>ENTROPY CALCULATOR</span>
              {inspectedArtifacts.includes('entropy_calculator') && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => handleSelectTool('breach', 'breach_database_check')}
              className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeForensicTool === 'breach'
                  ? 'border-amber-500 bg-amber-950/60 text-amber-300 font-bold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900/40'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>BREACH DUMP AUDIT</span>
              {inspectedArtifacts.includes('breach_database_check') && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => handleSelectTool('mfa', 'mfa_evaluation')}
              className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeForensicTool === 'mfa'
                  ? 'border-amber-500 bg-amber-950/60 text-amber-300 font-bold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900/40'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>MFA PROTOCOL EVALUATOR</span>
              {inspectedArtifacts.includes('mfa_evaluation') && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>
          </div>

          {/* Main Display Area */}
          <div className="space-y-4">
            {/* View A: Candidate Accounts Matrix */}
            {activeForensicTool === 'accounts' && (
              <div className="space-y-3">
                {candidateAccounts.map((account) => {
                  const isSelected = selectedAccountId === account.id;
                  return (
                    <div
                      key={account.id}
                      onClick={() => {
                        playClick();
                        setSelectedAccountId(account.id);
                      }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-950/40 shadow-neon-amber/20'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-950/80'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          <span className="font-bold text-amber-300 text-sm">{account.username}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {account.id.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase block">PASSWORD SAMPLE:</span>
                          <code className="text-slate-200 bg-slate-900 px-1.5 py-0.5 rounded font-mono text-[11px]">
                            {account.passwordSample}
                          </code>
                        </div>

                        <div>
                          <span className="text-slate-500 text-[10px] uppercase block">ENTROPY ESTIMATE:</span>
                          <span className="text-slate-300">{account.entropyEstimate}</span>
                        </div>

                        <div>
                          <span className="text-slate-500 text-[10px] uppercase block">BREACH AUDIT:</span>
                          <span className={account.breachHistory.includes('Found') ? 'text-red-400' : 'text-emerald-400'}>
                            {account.breachHistory}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 text-[10px] uppercase block">MFA CONFIGURATION:</span>
                          <span className={account.mfaConfig.includes('Disabled') ? 'text-red-400' : 'text-slate-300'}>
                            {account.mfaConfig}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* View B: Entropy Calculator */}
            {activeForensicTool === 'entropy' && (
              <div className="p-4 rounded-lg border border-amber-500/40 bg-slate-950/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    CRYPTOGRAPHIC ENTROPY COMPARISON
                  </span>
                  <span className="text-[10px] text-slate-500">FORMULA: E = L * log2(R)</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-red-950/30 border border-red-500/40 rounded space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-red-300">Account 1 (FacilityAdmin2026!): ~32 BITS</span>
                      <span className="text-red-400">CRITICAL VULNERABILITY</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Predictable dictionary word + year pattern. Can be cracked via hashcat dictionary attack in under 4 seconds.
                    </p>
                  </div>

                  <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-amber-300">Account 2 (Passphrase): ~85 BITS</span>
                      <span className="text-amber-400">STRONG PASS PHRASE</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Multi-word passphrase with high search space resistance against offline cracking.
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-emerald-300">Account 3 (Random Manager Generation): ~96 BITS</span>
                      <span className="text-emerald-400">MAXIMUM SECURITY</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      19 characters with random mixed-case alphanumeric and special symbols from high-entropy CSPRNG pool.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* View C: Breach Dump Audit */}
            {activeForensicTool === 'breach' && (
              <div className="p-4 rounded-lg border border-amber-500/40 bg-slate-950/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-amber-400" />
                    SIMULATED GLOBAL BREACH TELEMETRY (RockYou2024 / HaveIBeenPwned)
                  </span>
                  <span className="text-[10px] text-slate-500">INDEX: 10.2B RECORDS</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded text-xs space-y-2">
                    <p className="text-slate-300">
                      <strong className="text-amber-300">Credential Stuffing Risk Analysis:</strong> When passwords are reused across corporate and external systems, automated botnets blast credentials into facility login portals.
                    </p>
                    <div className="p-2 bg-black/60 rounded text-[11px] space-y-1 text-slate-400">
                      <p><span className="text-red-400">[MATCH FOUND]</span> FacilityAdmin2026! — Present in 4 public breach dumps; reused across 3 facility subnets.</p>
                      <p><span className="text-emerald-400">[CLEAN]</span> Correct-Horse-Battery-Staple-42 — 0 breach matches found.</p>
                      <p><span className="text-emerald-400">[CLEAN]</span> kP9#mX2$vL8@qW4!zR7 — 0 breach matches found; generated via enterprise password vault.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View D: MFA Protocol Evaluator */}
            {activeForensicTool === 'mfa' && (
              <div className="p-4 rounded-lg border border-amber-500/40 bg-slate-950/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-amber-400" />
                    MULTI-FACTOR AUTHENTICATION RESILIENCE COMPARISON
                  </span>
                  <span className="text-[10px] text-slate-500">NIST SP 800-63B</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-2">
                    <div className="flex items-start gap-2">
                      <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300">SMS One-Time Passcode (Account 2):</span>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          Vulnerable to cellular SS7 interception, SIM swap fraud, and real-time reverse proxy phishing kits.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-2 border-t border-slate-800">
                      <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-emerald-300">FIDO2 Hardware Token (Account 3):</span>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          Cryptographically binds origin domain to WebAuthn public key. 100% immune to proxy credential harvesting and SIM interception.
                        </p>
                      </div>
                    </div>
                  </div>
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
          subtitle="AUTHENTICATION POLICY"
          icon={AlertTriangle}
          variant="amber"
        >
          <div className="space-y-4">
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Deploy an authoritative authentication profile to unlock Sector 02 cryptographic bulkheads.
            </p>

            {/* Forensic Discovery Tracker */}
            <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-300 uppercase tracking-wide">
                  FORENSIC ARTIFACTS
                </span>
                <span className="text-amber-400 font-bold">
                  {inspectedArtifacts.length} DISCOVERED
                </span>
              </div>

              <div className="space-y-1 text-[10px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Entropy Calculator</span>
                  <span>{inspectedArtifacts.includes('entropy_calculator') ? '✓ VERIFIED' : '○ PENDING'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Breach Dump Audit</span>
                  <span>{inspectedArtifacts.includes('breach_database_check') ? '✓ VERIFIED' : '○ PENDING'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>MFA Protocol Evaluation</span>
                  <span>{inspectedArtifacts.includes('mfa_evaluation') ? '✓ VERIFIED' : '○ PENDING'}</span>
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
                DEPLOY AUTHENTICATION PROFILE:
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
