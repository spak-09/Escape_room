import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, HelpCircle, Volume2, VolumeX, LogOut, ShieldAlert, Check, Lock } from 'lucide-react';
import { useGameSession } from '../../../hooks/useGameSession';
import { useSound } from '../../../hooks/useSound';
import { formatScore } from '../../../utils/formatters';
import TerminalModal from '../../../components/common/TerminalModal';
import TerminalButton from '../../../components/common/TerminalButton';
import HintConfirmationModal from './HintConfirmationModal';

const SECTORS = [
  { index: 1, id: 'room-01-inbox', label: '01: INBOX' },
  { index: 2, id: 'room-02-vault', label: '02: VAULT' },
  { index: 3, id: 'room-03-scanner', label: '03: SCANNER' },
  { index: 4, id: 'room-04-message', label: '04: MESSAGE' },
  { index: 5, id: 'room-05-control', label: '05: CONTROL' },
];

export default function GameHeader() {
  const navigate = useNavigate();
  const { session, activeChallenge, requestHint } = useGameSession();
  const { isMuted, toggleMute, playClick } = useSound();

  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [hintContent, setHintContent] = useState(null);
  const [isRequestingHint, setIsRequestingHint] = useState(false);
  const [hintError, setHintError] = useState(null);

  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const currentRoomIndex = session?.currentRoomIndex || 1;
  const livesRemaining = typeof session?.livesRemaining === 'number' ? session.livesRemaining : 3;
  const currentScore = session?.currentScore || 0;

  const handleOpenHint = () => {
    playClick();
    setHintError(null);
    setIsHintModalOpen(true);
  };

  const handleConfirmHint = async () => {
    if (!activeChallenge?.challengeId) return;
    setIsRequestingHint(true);
    setHintError(null);
    try {
      const res = await requestHint(activeChallenge.challengeId);
      setHintContent(res.hint || res.data?.hint);
    } catch (err) {
      setHintError(err?.message || 'Failed to decrypt tactical intelligence hint');
    } finally {
      setIsRequestingHint(false);
    }
  };

  const handleExitToDashboard = () => {
    playClick();
    navigate('/dashboard');
  };

  return (
    <>
      <header className="h-16 border-b border-slate-800 bg-[#0c101c]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-20 shrink-0">
        {/* Left: Emergency Exit & Sector Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              playClick();
              setIsExitModalOpen(true);
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded border border-slate-800 hover:border-red-500/50 hover:bg-red-950/40 text-slate-400 hover:text-red-300 font-mono text-xs flex items-center gap-1.5 transition-colors"
            title="Emergency Exit (Save & Return to Dashboard)"
            aria-label="Emergency Exit"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">EXIT</span>
          </button>

          <div className="hidden lg:flex items-center gap-2 font-mono text-xs text-slate-400 border-l border-slate-800 pl-3">
            <span className="text-cyan-400 font-bold">SECTOR {String(currentRoomIndex).padStart(2, '0')}</span>
            <span>//</span>
            <span className="text-slate-300 uppercase">
              {SECTORS.find((s) => s.index === currentRoomIndex)?.label || 'ACTIVE INCIDENT'}
            </span>
          </div>
        </div>

        {/* Center: Sector Minimap */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-950/60 border border-slate-800/80 rounded-full px-3 py-1 text-[11px] font-mono">
          {SECTORS.map((sec, idx) => {
            const isCleared = sec.index < currentRoomIndex;
            const isCurrent = sec.index === currentRoomIndex;

            return (
              <React.Fragment key={sec.id}>
                {idx > 0 && (
                  <span className="text-slate-700">──</span>
                )}
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-all ${
                    isCleared
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                      : isCurrent
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/60 font-bold shadow-neon-cyan/20 animate-pulse-fast'
                      : 'text-slate-500 opacity-60'
                  }`}
                >
                  {isCleared && <Check className="w-3 h-3" />}
                  {!isCleared && !isCurrent && <Lock className="w-2.5 h-2.5" />}
                  <span>{sec.label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Right: Lives, Score, Hint, Audio */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Hearts Life Pool */}
          <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-800/80 rounded px-2.5 py-1" title={`${livesRemaining} Lives Remaining`}>
            {[1, 2, 3].map((heartIndex) => {
              const isAlive = heartIndex <= livesRemaining;
              const isCriticalOne = livesRemaining === 1 && heartIndex === 1;

              return (
                <Heart
                  key={heartIndex}
                  className={`w-4 h-4 transition-all duration-300 ${
                    isAlive
                      ? isCriticalOne
                        ? 'text-red-500 fill-red-500 animate-heartbeat drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                        : 'text-red-500 fill-red-500 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]'
                      : 'text-slate-700 fill-slate-900/40 opacity-40'
                  }`}
                />
              );
            })}
          </div>

          {/* Score Counter */}
          <div className="flex items-center gap-1.5 font-mono text-xs bg-slate-950/60 border border-slate-800/80 rounded px-2.5 py-1">
            <span className="text-slate-500">SCORE:</span>
            <span className="text-cyan-300 font-bold tracking-widest text-glow-cyan">
              {formatScore(currentScore)}
            </span>
          </div>

          {/* Hint Trigger */}
          <button
            type="button"
            onClick={handleOpenHint}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded border border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 font-mono text-xs flex items-center gap-1.5 transition-colors shadow-neon-amber/10"
            title="Request Tactical Clue"
            aria-label="Request Tactical Clue"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">HINT</span>
          </button>

          {/* Audio Mute/Unmute */}
          <button
            type="button"
            onClick={() => {
              toggleMute();
            }}
            className={`p-1.5 rounded border transition-colors ${
              isMuted
                ? 'border-slate-800 text-slate-500 hover:text-slate-300 bg-slate-950/40'
                : 'border-cyan-500/40 text-cyan-400 hover:text-cyan-300 bg-cyan-950/40'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Hint Confirmation & Display Modal */}
      <HintConfirmationModal
        isOpen={isHintModalOpen}
        onClose={() => {
          setIsHintModalOpen(false);
          setHintContent(null);
        }}
        onConfirm={handleConfirmHint}
        hintContent={hintContent}
        isLoading={isRequestingHint}
        error={hintError}
      />

      {/* Emergency Exit Confirmation Modal */}
      <TerminalModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        title="CONFIRM EMERGENCY SUSPENSION"
        subtitle="Facility State Persistence"
        variant="danger"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 font-mono text-xs">
          <p className="text-slate-300 leading-relaxed">
            Your current sector coordinates, authoritative score, and remaining lives will remain secured in facility persistence. You can resume this exact escape run from your cadet dashboard at any time.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <TerminalButton
              variant="ghost"
              onClick={() => setIsExitModalOpen(false)}
            >
              RESUME ESCAPE
            </TerminalButton>
            <TerminalButton
              variant="danger"
              onClick={handleExitToDashboard}
            >
              SAVE & EXIT TO HUB
            </TerminalButton>
          </div>
        </div>
      </TerminalModal>
    </>
  );
}
