import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Zap,
  RotateCcw,
  Info,
  Clock,
  Activity,
  Server,
  Lock,
  MessageSquare,
  QrCode,
  ArrowRight,
  Flame,
} from 'lucide-react';
import TerminalCard from '../../../components/common/TerminalCard';
import TerminalButton from '../../../components/common/TerminalButton';
import StatusBadge from '../../../components/common/StatusBadge';
import { useSound } from '../../../hooks/useSound';

/**
 * ControlRoomShell
 * Sector 05: The Control Room (Multi-Threat Incident Response)
 * Interactive ControlRoomIncidentMatrix with 4 active threat alarms,
 * multi-threat forensic diagnostics, sequence prioritization builder,
 * and authoritative final escape execution.
 */
export default function ControlRoomShell({
  roomMetadata,
  challengeData,
  onDecisionSubmit,
  onRequestHint,
  isSubmitting,
}) {
  const { playClick, playChime, playAlarm } = useSound();

  const [timeElapsedSeconds, setTimeElapsedSeconds] = useState(0);
  const timerRef = useRef(null);

  const [inspectedArtifacts, setInspectedArtifacts] = useState([]);
  const [activeForensicTool, setActiveForensicTool] = useState('matrix'); // 'matrix' | 'c2' | 'vault' | 'helpdesk' | 'kiosk'
  const [containmentSequence, setContainmentSequence] = useState([]);
  const [selectedActionId, setSelectedActionId] = useState(null);

  const evidence = challengeData?.evidence || {};
  const activeAlarms = evidence?.activeAlarms || [];

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

  // Toggle threat in sequence builder
  const handleToggleThreat = (actionId) => {
    playClick();
    if (containmentSequence.includes(actionId)) {
      setContainmentSequence((prev) => prev.filter((id) => id !== actionId));
    } else {
      setContainmentSequence((prev) => [...prev, actionId]);
    }
  };

  const handleResetSequence = () => {
    playClick();
    setContainmentSequence([]);
  };

  // Submit prioritized sequence or direct action
  const handleExecuteSequence = () => {
    const primaryAction = containmentSequence[0] || 'ACTION_CONTAIN_INCIDENT_SEQUENCE';
    setSelectedActionId('ACTION_CONTAIN_INCIDENT_SEQUENCE');
    onDecisionSubmit(primaryAction, {
      containmentSequence: containmentSequence.length > 0 ? containmentSequence : undefined,
      inspectedArtifacts,
      timeElapsedSeconds: Math.max(1, timeElapsedSeconds),
    });
  };

  const handleDirectAction = (actionId) => {
    setSelectedActionId(actionId);
    onDecisionSubmit(actionId, {
      containmentSequence: containmentSequence.length > 0 ? containmentSequence : undefined,
      inspectedArtifacts,
      timeElapsedSeconds: Math.max(1, timeElapsedSeconds),
    });
  };

  const getVectorIcon = (vector) => {
    switch (vector) {
      case 'phishing':
        return <Server className="w-4 h-4 text-red-400" />;
      case 'password_security':
        return <Lock className="w-4 h-4 text-amber-400" />;
      case 'social_engineering':
        return <MessageSquare className="w-4 h-4 text-pink-400" />;
      case 'qr_security':
        return <QrCode className="w-4 h-4 text-cyan-400" />;
      default:
        return <Flame className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
      {/* Left 2 Cols: Master Incident Matrix Viewport */}
      <div className="lg:col-span-2 space-y-6">
        <TerminalCard
          title={`SECTOR 05 // ${roomMetadata?.title || 'THE CONTROL ROOM'}`}
          subtitle="MULTI-THREAT INCIDENT TRIAGE & BULKHEAD CONTAINMENT"
          icon={Sliders}
          variant="crimson"
          badge={<StatusBadge status="DANGER" size="sm" label="CASCADE INTRUSION" />}
        >
          {/* Directive Prompt & Timer */}
          <div className="mb-4 p-3.5 bg-slate-950/70 border border-slate-800 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-red-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>FINAL BULKHEAD DIRECTIVE</span>
              </span>
              <p className="text-slate-200 leading-relaxed text-xs">
                {challengeData?.prompt || 'Prioritize and contain the cascading multi-threat attack to unlock the final facility escape bulkhead.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded text-[11px] text-slate-400 shrink-0 self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-red-400" />
              <span>TIME: {timeElapsedSeconds}s</span>
            </div>
          </div>

          {/* Forensic Workstation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-4 overflow-x-auto text-[11px]">
            <button
              type="button"
              onClick={() => handleSelectTool('matrix')}
              className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeForensicTool === 'matrix'
                  ? 'border-red-500 bg-red-950/60 text-red-300 font-bold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900/40'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ACTIVE INCIDENTS ({activeAlarms.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTool('c2', 'c2_traffic_analyzer')}
              className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeForensicTool === 'c2'
                  ? 'border-red-500 bg-red-950/60 text-red-300 font-bold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900/40'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>C2 EXFILTRATION ANALYZER</span>
              {inspectedArtifacts.includes('c2_traffic_analyzer') && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => handleSelectTool('vault', 'vault_audit_log')}
              className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeForensicTool === 'vault'
                  ? 'border-red-500 bg-red-950/60 text-red-300 font-bold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900/40'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>VAULT BRUTE-FORCE LOGS</span>
              {inspectedArtifacts.includes('vault_audit_log') && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => handleSelectTool('helpdesk', 'helpdesk_directory_check')}
              className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeForensicTool === 'helpdesk'
                  ? 'border-red-500 bg-red-950/60 text-red-300 font-bold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900/40'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>HELPDESK PRETEXT AUDIT</span>
              {inspectedArtifacts.includes('helpdesk_directory_check') && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => handleSelectTool('kiosk', 'kiosk_firmware_scan')}
              className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeForensicTool === 'kiosk'
                  ? 'border-red-500 bg-red-950/60 text-red-300 font-bold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900/40'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>PERIMETER KIOSK SCAN</span>
              {inspectedArtifacts.includes('kiosk_firmware_scan') && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>
          </div>

          {/* Main Display Area */}
          <div className="space-y-4">
            {/* View A: Active Incidents Matrix & Sequence Selection */}
            {activeForensicTool === 'matrix' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>CLICK THREAT CARDS TO ORDER CONTAINMENT SEQUENCE (1 → 4):</span>
                  {containmentSequence.length > 0 && (
                    <button
                      type="button"
                      onClick={handleResetSequence}
                      className="text-amber-400 hover:underline flex items-center gap-1 text-[10px]"
                    >
                      <RotateCcw className="w-3 h-3" /> RESET SEQUENCE
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {activeAlarms.map((threat) => {
                    const seqIndex = containmentSequence.indexOf(threat.actionId);
                    const isSelected = seqIndex !== -1;

                    return (
                      <div
                        key={threat.id}
                        onClick={() => handleToggleThreat(threat.actionId)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'bg-red-950/70 border-red-500 shadow-neon-crimson text-red-100'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {getVectorIcon(threat.vector)}
                              <span className="text-[10px] text-slate-400 uppercase font-bold">
                                {threat.vector.replace('_', ' ')}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                  threat.severity === 'CRITICAL'
                                    ? 'bg-red-950 text-red-400 border border-red-500/50 animate-pulse'
                                    : threat.severity === 'HIGH'
                                    ? 'bg-amber-950 text-amber-400 border border-amber-500/50'
                                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                                }`}
                              >
                                {threat.severity}
                              </span>

                              {/* Priority Badge */}
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isSelected
                                    ? 'bg-red-500 text-slate-950 shadow-md ring-2 ring-red-400'
                                    : 'border border-slate-700 text-slate-600'
                                }`}
                              >
                                {isSelected ? seqIndex + 1 : '—'}
                              </div>
                            </div>
                          </div>

                          <p className="font-bold text-xs text-slate-100">{threat.target}</p>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{threat.indicator}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                          <span className="text-slate-500 uppercase">ACTION: </span>
                          <span>{threat.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View B: C2 Exfiltration Analyzer */}
            {activeForensicTool === 'c2' && (
              <div className="p-4 rounded-lg border border-red-500/40 bg-slate-950/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-red-400" />
                    PRIMARY DOMAIN CONTROLLER (DC-01) C2 TELEMETRY
                  </span>
                  <span className="text-[10px] text-red-400 font-bold animate-pulse">[CRITICAL: ACTIVE DATA LEAK]</span>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-3">
                  <div className="p-3 bg-red-950/40 border border-red-500/40 rounded space-y-1.5 text-xs">
                    <span className="font-bold text-red-300">ACTIVE EXFILTRATION DETECTED:</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Encrypted TLS socket streaming NTDS.dit password hashes directly to remote adversary infrastructure at <code className="bg-red-900/60 px-1.5 py-0.5 rounded text-white">185.220.101.4</code>.
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-red-400">Incident Triage Doctrine:</strong> In active multi-threat emergencies, active data loss and C2 beaconing on crown-jewel assets must be severed first before secondary defenses are engaged.
                  </p>
                </div>
              </div>
            )}

            {/* View C: Vault Brute-Force Logs */}
            {activeForensicTool === 'vault' && (
              <div className="p-4 rounded-lg border border-red-500/40 bg-slate-950/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-400" />
                    CRYPTOGRAPHIC VAULT KEYRING LOGS
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">[HIGH PRIORITY]</span>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-3 text-xs">
                  <p className="text-slate-300 leading-relaxed">
                    Adversary botnet has initiated distributed credential stuffing across 50,000 dictionary accounts against administrative endpoints.
                  </p>
                  <div className="p-2.5 bg-black/60 rounded text-[11px] space-y-1 text-amber-300">
                    <p>• 42,100 failed auth attempts logged in last 90 seconds.</p>
                    <p>• Root keyring lockout threshold reached 92% capacity.</p>
                  </div>
                </div>
              </div>
            )}

            {/* View D: Helpdesk Pretext Audit */}
            {activeForensicTool === 'helpdesk' && (
              <div className="p-4 rounded-lg border border-red-500/40 bg-slate-950/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-pink-400" />
                    ENTERPRISE HELPDESK SOCIAL PRETEXT AUDIT
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">[HIGH PRIORITY]</span>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-3 text-xs">
                  <p className="text-slate-300 leading-relaxed">
                    Impersonation ticket submitted via external chat claiming executive emergency lockout.
                  </p>
                  <div className="p-2.5 bg-black/60 rounded text-[11px] text-slate-300">
                    Attacker is actively socially engineering tier-1 helpdesk support to bypass MFA tokens and reset executive credentials.
                  </div>
                </div>
              </div>
            )}

            {/* View E: Perimeter Kiosk Scan */}
            {activeForensicTool === 'kiosk' && (
              <div className="p-4 rounded-lg border border-red-500/40 bg-slate-950/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-cyan-400" />
                    VISITOR KIOSK PERIMETER SUBNET
                  </span>
                  <span className="text-[10px] text-cyan-400 font-bold">[MEDIUM PRIORITY]</span>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-3 text-xs">
                  <p className="text-slate-300 leading-relaxed">
                    Perimeter visitor kiosk node has an unverified QR quishing sticker directing visitors to an external APK download.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Isolated on perimeter visitor VLAN; lowest lateral movement risk compared to core Domain Controller and Vault.
                  </p>
                </div>
              </div>
            )}
          </div>
        </TerminalCard>
      </div>

      {/* Right 1 Col: Tactical Containment Dock */}
      <div className="space-y-6">
        <TerminalCard
          title="TACTICAL DOCK"
          subtitle="INCIDENT RESPONSE EXECUTION"
          icon={AlertTriangle}
          variant="crimson"
        >
          <div className="space-y-4">
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Prioritize containment by active exploit severity to restore total facility control.
            </p>

            {/* Forensic Discovery Tracker */}
            <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-300 uppercase tracking-wide">
                  FORENSIC ARTIFACTS
                </span>
                <span className="text-red-400 font-bold">
                  {inspectedArtifacts.length} DISCOVERED
                </span>
              </div>

              <div className="space-y-1 text-[10px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>C2 Traffic Exfiltration</span>
                  <span>{inspectedArtifacts.includes('c2_traffic_analyzer') ? '✓ VERIFIED' : '○ PENDING'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Vault Brute-Force Logs</span>
                  <span>{inspectedArtifacts.includes('vault_audit_log') ? '✓ VERIFIED' : '○ PENDING'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Helpdesk Pretext Audit</span>
                  <span>{inspectedArtifacts.includes('helpdesk_directory_check') ? '✓ VERIFIED' : '○ PENDING'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Kiosk Firmware Telemetry</span>
                  <span>{inspectedArtifacts.includes('kiosk_firmware_scan') ? '✓ VERIFIED' : '○ PENDING'}</span>
                </div>
              </div>

              {inspectedArtifacts.length >= 4 && (
                <div className="pt-1 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>MASTER INVESTIGATION BONUS ELIGIBLE</span>
                </div>
              )}
            </div>

            {/* Containment Sequence Queue */}
            <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-300 uppercase tracking-wide">
                  ORDERED SEQUENCE ({containmentSequence.length}/4)
                </span>
                {containmentSequence.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetSequence}
                    className="text-amber-400 hover:underline text-[10px]"
                  >
                    CLEAR
                  </button>
                )}
              </div>

              {containmentSequence.length === 0 ? (
                <p className="text-slate-500 text-[10px] italic">
                  No threats sequenced yet. Click incident cards on the left to establish containment priority.
                </p>
              ) : (
                <ol className="space-y-1 text-[10px]">
                  {containmentSequence.map((actionKey, idx) => {
                    const threat = activeAlarms.find((t) => t.actionId === actionKey);
                    return (
                      <li key={actionKey} className="flex items-center gap-2 text-slate-200 bg-slate-900 px-2 py-1 rounded">
                        <span className="font-bold text-red-400">#{idx + 1}</span>
                        <span className="truncate">{threat?.label || actionKey}</span>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>

            {/* Primary Action Button */}
            <div className="pt-1">
              <TerminalButton
                variant="danger"
                size="lg"
                fullWidth
                disabled={isSubmitting || containmentSequence.length === 0}
                isLoading={isSubmitting && selectedActionId === 'ACTION_CONTAIN_INCIDENT_SEQUENCE'}
                onClick={handleExecuteSequence}
                icon={Zap}
              >
                EXECUTE CONTAINMENT SEQUENCE
              </TerminalButton>
            </div>

            {/* Alternative Individual Actions from Backend */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                DIRECT IMMEDIATE ACTION:
              </span>

              {challengeData?.availableActions
                ?.filter((a) => a.actionId !== 'ACTION_CONTAIN_INCIDENT_SEQUENCE')
                .slice(0, 4)
                .map((action) => {
                  const isSelected = selectedActionId === action.actionId;
                  return (
                    <TerminalButton
                      key={action.actionId}
                      variant="secondary"
                      size="sm"
                      fullWidth
                      disabled={isSubmitting}
                      isLoading={isSubmitting && isSelected}
                      onClick={() => handleDirectAction(action.actionId)}
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
