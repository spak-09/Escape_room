import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Scan,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Link,
  Info,
  Clock,
  ExternalLink,
  Layers,
  ZoomIn,
  ArrowRight,
  FileWarning,
  CheckCircle2,
} from 'lucide-react';
import TerminalCard from '../../../components/common/TerminalCard';
import TerminalButton from '../../../components/common/TerminalButton';
import StatusBadge from '../../../components/common/StatusBadge';
import { useSound } from '../../../hooks/useSound';

/**
 * ScannerRoomShell
 * Sector 03: The Scanner (QR Code / Quishing Defense)
 * Interactive QRScannerInspector with physical surface zoom,
 * URL redirect expansion tracer, and domain reputation analysis.
 */
export default function ScannerRoomShell({
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
  const [activeForensicTool, setActiveForensicTool] = useState('scanner'); // 'scanner' | 'physical' | 'redirect' | 'reputation'
  const [selectedActionId, setSelectedActionId] = useState(null);

  const evidence = challengeData?.evidence || {};
  const redirectChain = evidence?.redirectChain || [];

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
      {/* Left 2 Cols: Optical Scanner Viewport */}
      <div className="lg:col-span-2 space-y-6">
        <TerminalCard
          title={`SECTOR 03 // ${roomMetadata?.title || 'THE SCANNER'}`}
          subtitle="OPTICAL SENSOR TELEMETRY & BEACON DEOBFUSCATION"
          icon={QrCode}
          variant="cyan"
          badge={<StatusBadge status="ACTIVE" size="sm" label="OPTICAL FEED" />}
        >
          {/* Directive Prompt & Timer */}
          <div className="mb-4 p-3.5 bg-slate-950/70 border border-slate-800 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>INCIDENT DIRECTIVE</span>
              </span>
              <p className="text-slate-200 leading-relaxed text-xs">
                {challengeData?.prompt || 'Inspect the optical sensor beacon destination before permitting facility equipment to sync.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded text-[11px] text-slate-400 shrink-0 self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>TIME: {timeElapsedSeconds}s</span>
            </div>
          </div>

          {/* Forensic Workstation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-4 overflow-x-auto text-[11px]">
            <button
              type="button"
              onClick={() => handleSelectTool('scanner')}
              className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeForensicTool === 'scanner'
                  ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300 font-bold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900/40'
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              <span>OPTICAL SENSOR VIEWPORT</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTool('physical', 'physical_inspection')}
              className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeForensicTool === 'physical'
                  ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300 font-bold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900/40'
              }`}
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>PHYSICAL SURFACE ZOOM</span>
              {inspectedArtifacts.includes('physical_inspection') && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => handleSelectTool('redirect', 'redirect_tracer')}
              className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeForensicTool === 'redirect'
                  ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300 font-bold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900/40'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>REDIRECT TRACER</span>
              {inspectedArtifacts.includes('redirect_tracer') && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => handleSelectTool('reputation', 'domain_reputation')}
              className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeForensicTool === 'reputation'
                  ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300 font-bold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900/40'
              }`}
            >
              <FileWarning className="w-3.5 h-3.5" />
              <span>PAYLOAD REPUTATION</span>
              {inspectedArtifacts.includes('domain_reputation') && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>
          </div>

          {/* Main Display Area */}
          <div className="space-y-4">
            {/* View A: Optical Scanner Viewport */}
            {activeForensicTool === 'scanner' && (
              <div className="rounded-lg border border-slate-800 bg-[#0a0d18] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Scan className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="font-bold uppercase tracking-wider">OPTICAL SENSOR MATRIX</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono">STATUS: PAYLOAD BUFFERED</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-950 rounded border border-slate-800">
                  {/* QR Matrix Visual */}
                  <div className="relative w-36 h-36 bg-slate-900 border-2 border-cyan-500/60 rounded flex flex-col items-center justify-center p-2 shadow-neon-cyan/20 shrink-0 overflow-hidden">
                    <QrCode className="w-24 h-24 text-cyan-400" />
                    {/* Controlled laser line scan animation */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                    <span className="text-[9px] text-slate-500 mt-1 uppercase">RAW QR MATRIX</span>
                  </div>

                  {/* Scanned Summary Data */}
                  <div className="space-y-2.5 flex-1 w-full">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                        RAW SCANNED URL PAYLOAD
                      </span>
                      <code className="text-amber-300 bg-slate-900 border border-slate-800 px-2 py-1 rounded block mt-0.5 text-xs">
                        {evidence.scannedPayload || 'https://bit.ly/3xSecFacilitySync'}
                      </code>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      <span className="text-slate-500">PHYSICAL CONTEXT: </span>
                      <span>{evidence.physicalContext || 'Mounted plaque on facility node'}</span>
                    </div>

                    <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
                      <span className="text-cyan-400 font-bold block mb-0.5">FORENSIC ADVISORY:</span>
                      QR codes can obfuscate true destinations behind shortlinks. Examine the physical plaque and trace redirects before permitting sync.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View B: Physical Surface Zoom */}
            {activeForensicTool === 'physical' && (
              <div className="p-4 rounded-lg border border-cyan-500/40 bg-slate-950/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ZoomIn className="w-4 h-4 text-cyan-400" />
                    PHYSICAL PLAQUE SURFACE MACRO ANALYSIS
                  </span>
                  <span className="text-[10px] text-red-400 font-bold">[TAMPERING DETECTED]</span>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-3">
                  <div className="p-3 bg-red-950/40 border border-red-500/40 rounded space-y-2 text-red-200 text-xs">
                    <span className="font-bold uppercase tracking-wide flex items-center gap-1.5 text-red-300">
                      <AlertTriangle className="w-4 h-4 text-red-400" /> VISUAL TAMPERING ANOMALIES:
                    </span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {evidence.visualAnomaly || 'Edges peeling slightly, misaligned facility emblem, non-standard system font.'}
                    </p>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      <strong className="text-red-400">Physical Inspection Finding:</strong> An adhesive paper sticker has been intentionally placed directly over the official laser-etched stainless steel serial plaque.
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Attackers frequently deploy physical "quishing" overlays on public parking meters, charging stations, and entry kiosks to intercept payments or distribute Trojanized applications.
                  </div>
                </div>
              </div>
            )}

            {/* View C: URL Redirect Tracer */}
            {activeForensicTool === 'redirect' && (
              <div className="p-4 rounded-lg border border-cyan-500/40 bg-slate-950/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4 text-cyan-400" />
                    HTTP REDIRECT EXPANSION TRACER
                  </span>
                  <span className="text-[10px] text-slate-500">TOTAL HOPS: {redirectChain.length || 2}</span>
                </div>

                <div className="space-y-3">
                  {redirectChain.map((hopItem) => (
                    <div key={hopItem.hop} className="p-3 bg-slate-900 border border-slate-800 rounded text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-400 uppercase">
                          HOP 0{hopItem.hop} // HTTP {hopItem.statusCode}
                        </span>
                        {hopItem.contentType && (
                          <span className="text-[10px] text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/30">
                            MIME: {hopItem.contentType}
                          </span>
                        )}
                      </div>
                      <code className="text-slate-200 text-[11px] break-all block">{hopItem.url}</code>
                    </div>
                  ))}

                  <div className="p-2.5 rounded bg-red-950/30 border border-red-500/40 text-[11px] text-red-200">
                    <span className="font-bold text-red-300">CRITICAL DISCOVERY:</span> The shortened Bitly link resolves through an HTTP 301 redirect to an unencrypted foreign APK binary (<code className="text-amber-300">malware-drop.ru/beacon.apk</code>).
                  </div>
                </div>
              </div>
            )}

            {/* View D: Payload Reputation */}
            {activeForensicTool === 'reputation' && (
              <div className="p-4 rounded-lg border border-cyan-500/40 bg-slate-950/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileWarning className="w-4 h-4 text-cyan-400" />
                    THREAT REPUTATION & PAYLOAD ANALYSIS
                  </span>
                  <span className="text-[10px] text-red-400 font-bold">MALICIOUS BINARY</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 uppercase block">TARGET EXTENSION:</span>
                        <span className="text-red-400 font-bold">.APK (Android Application Package)</span>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase block">DOMAIN REPUTATION:</span>
                        <span className="text-red-400 font-bold">98/100 Threat Index (Known C2)</span>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase block">TRANSPORT PROTOCOL:</span>
                        <span className="text-red-400 font-bold">HTTP (Insecure / Unencrypted)</span>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase block">DEVICE IMPACT:</span>
                        <span className="text-amber-300 font-bold">Arbitrary Remote Code Execution</span>
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
          subtitle="QUISHING COUNTERMEASURE"
          icon={AlertTriangle}
          variant="cyan"
        >
          <div className="space-y-4">
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Select an authoritative protocol to neutralize the physical and digital quishing attack.
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
                  <span>Physical Surface Macro Zoom</span>
                  <span>{inspectedArtifacts.includes('physical_inspection') ? '✓ VERIFIED' : '○ PENDING'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Redirect Expansion Tracer</span>
                  <span>{inspectedArtifacts.includes('redirect_tracer') ? '✓ VERIFIED' : '○ PENDING'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Payload Threat Reputation</span>
                  <span>{inspectedArtifacts.includes('domain_reputation') ? '✓ VERIFIED' : '○ PENDING'}</span>
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
