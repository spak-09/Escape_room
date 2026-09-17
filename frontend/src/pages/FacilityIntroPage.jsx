import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Terminal, AlertTriangle, ArrowRight } from 'lucide-react';
import { useGameSession } from '../hooks/useGameSession';
import { useSound } from '../hooks/useSound';
import { SECTOR_MAP } from '../context/GameSessionContext';
import TerminalButton from '../components/common/TerminalButton';
import PneumaticDoorTransition from '../features/rooms/components/PneumaticDoorTransition';

export default function FacilityIntroPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { startNewSession } = useGameSession();
  const { playAlarm, playUnlock } = useSound();

  const rawDifficulty = new URLSearchParams(location.search).get('difficulty');
  const validDifficulties = ['beginner', 'intermediate', 'expert'];
  const isValidDifficulty = Boolean(rawDifficulty && validDifficulties.includes(rawDifficulty.toLowerCase()));
  const queryDifficulty = isValidDifficulty ? rawDifficulty.toLowerCase() : null;

  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetRoomPath, setTargetRoomPath] = useState(null);

  // Mandatory difficulty check: redirect to assessment if missing or invalid
  useEffect(() => {
    if (!isValidDifficulty) {
      navigate('/assessment', { replace: true });
    }
  }, [isValidDifficulty, navigate]);

  const logs = [
    { text: '>> INITIATING FACILITY DIAGNOSTIC TELEMETRY...', color: 'text-cyan-400' },
    { text: `>> ASSESSMENT CLEARANCE: ${(queryDifficulty || 'CALIBRATING').toUpperCase()} LEVEL CALIBRATED`, color: 'text-cyan-300 font-bold' },
    { text: '>> WARNING: ANOMALOUS PACKET SURGE DETECTED IN CORE GATEWAY', color: 'text-amber-400' },
    { text: '>> CRITICAL ALERT: UNAUTHORIZED SYSTEM BREACH IN PROGRESS', color: 'text-red-400 font-bold' },
    { text: '>> AUTOMATED EMERGENCY CONTAINMENT PROTOCOL INITIALIZED', color: 'text-red-400 font-bold' },
    { text: '>> BULKHEAD DOORS 01 THROUGH 05 SEALED TO PREVENT NETWORK PIVOT', color: 'text-slate-300' },
    { text: '>> SECTOR 01 (INBOX) COMPROMISED — IMMEDIATE RESOLUTION REQUIRED', color: 'text-emerald-400 font-bold' },
    { text: '>> 3 OPERATIONAL LIVES ASSIGNED. PROTOCOL: ZERO UNVETTED ACTIONS', color: 'text-amber-300 font-bold' },
    { text: '>> ACCESS KEY OVERRIDE TERMINAL ENGAGED. ENTER AT YOUR OWN RISK.', color: 'text-cyan-300' },
  ];

  useEffect(() => {
    if (!isValidDifficulty) return;
    playAlarm();

    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev < logs.length) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 850);

    return () => clearInterval(interval);
  }, [playAlarm, logs.length, isValidDifficulty]);

  const handleEnterRoom = async () => {
    if (!isValidDifficulty || !queryDifficulty) {
      navigate('/assessment', { replace: true });
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const session = await startNewSession(queryDifficulty, true);
      playUnlock();
      const currentSector = session?.currentRoomIndex || 1;
      const targetRoomId = SECTOR_MAP[currentSector] || 'room-01-inbox';
      setTargetRoomPath(`/game/room/${targetRoomId}`);
      setIsTransitioning(true);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to initialize facility session. Please retry.');
      setIsLoading(false);
    }
  };

  const handleDoorTransitionComplete = () => {
    if (targetRoomPath) {
      navigate(targetRoomPath);
    }
  };

  if (!isValidDifficulty) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#080909] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-mono">
      {/* Red emergency scanline glow */}
      <div className="absolute inset-0 bg-red-950/10 pointer-events-none animate-pulse-fast" />

      {/* Center Terminal Box */}
      <div className="relative z-10 w-full max-w-2xl rounded-lg border-2 border-red-500/60 bg-[#181A1D] shadow-tactical-crimson p-6 sm:p-8 space-y-6">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-red-500/40 pb-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-red-400 animate-pulse" />
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-wider text-red-300 uppercase">
                EMERGENCY FACILITY LOCKDOWN
              </h2>
              <p className="text-xs text-slate-400">
                CONTAINMENT DIRECTIVE // ACTIVE THREAT INTRUSION
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded bg-red-950/80 border border-red-500/50 text-xs text-red-300 font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>BREACH LEVEL 5</span>
          </div>
        </div>

        {/* Streaming Logs */}
        <div className="space-y-2 bg-slate-950/80 rounded border border-slate-800 p-4 min-h-[220px] text-xs leading-relaxed">
          {logs.slice(0, step).map((log, index) => (
            <div key={index} className={`${log.color} flex items-start gap-2`}>
              <span>{log.text}</span>
            </div>
          ))}
          {step < logs.length && (
            <span className="inline-block w-2 h-4 bg-red-400 animate-pulse align-middle" />
          )}
        </div>

        {errorMsg && (
          <div className="rounded border border-red-500/50 bg-red-950/60 p-3 text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            {step >= logs.length ? 'Override terminal standby. Ready for cadet breach containment.' : 'Streaming facility diagnostics...'}
          </p>

          <TerminalButton
            variant="danger"
            size="lg"
            disabled={step < 3}
            isLoading={isLoading}
            onClick={handleEnterRoom}
            icon={ArrowRight}
          >
            ENTER SECTOR 01
          </TerminalButton>
        </div>
      </div>

      {/* Bulkhead Door Transition Animation */}
      <PneumaticDoorTransition
        isOpen={isTransitioning}
        doorLabel="SECTOR 01: THE INBOX"
        subtext="DECOMPRESSING PHISHING INVESTIGATION TERMINAL"
        onComplete={handleDoorTransitionComplete}
      />
    </div>
  );
}
