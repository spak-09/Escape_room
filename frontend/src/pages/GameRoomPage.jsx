import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Terminal, Shield, AlertTriangle, ArrowRight } from 'lucide-react';
import { useGameSession, SECTOR_MAP } from '../hooks/useGameSession';
import GameHeader from '../features/rooms/components/GameHeader';
import RoomContainer from '../features/rooms/RoomContainer';
import ConsequenceModal from '../features/rooms/components/ConsequenceModal';
import LearningInterventionModal from '../features/rooms/components/LearningInterventionModal';
import LockdownBreachModal from '../features/rooms/components/LockdownBreachModal';
import PneumaticDoorTransition from '../features/rooms/components/PneumaticDoorTransition';
import TerminalButton from '../components/common/TerminalButton';

/**
 * GameRoomPage
 * Master presentation shell for the escape room experience.
 * Orchestrates GameHeader HUD, dynamic RoomContainer registry, and authoritative overlays.
 */
export default function GameRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const {
    session,
    activeRoom,
    activeChallenge,
    loadRoom,
    submitAction,
    isSubmitting,
    lastSubmissionResult,
    clearLastSubmissionResult,
    startNewSession,
    abandonActiveSession,
    requestHint,
  } = useGameSession();

  const [localError, setLocalError] = useState(null);
  const [isDebriefOpen, setIsDebriefOpen] = useState(false);
  const [isDoorTransitioning, setIsDoorTransitioning] = useState(false);
  const [pendingNextRoomId, setPendingNextRoomId] = useState(null);
  const [isRestartingSession, setIsRestartingSession] = useState(false);

  // Load sanitized room data on mount or when roomId changes
  useEffect(() => {
    if (roomId) {
      setLocalError(null);
      loadRoom(roomId).catch((err) => {
        setLocalError(err?.message || 'Failed to decrypt sector coordinates.');
      });
    }
  }, [roomId, loadRoom]);

  // Handle tactical decision submit from room shell
  const handleDecisionSubmit = useCallback(
    async (actionId, extraPayload = {}) => {
      if (!activeChallenge?.challengeId) return;

      try {
        const result = await submitAction(activeChallenge.challengeId, {
          actionId,
          ...extraPayload,
        });

        // If incorrect and contains learning intervention, prepare debrief
        if (!result.isCorrect && result.learningIntervention) {
          // Consequence modal displays first; player can click "VIEW INCIDENT DEBRIEF"
        }
      } catch (err) {
        setLocalError(err?.message || 'Countermeasure evaluation failed.');
      }
    },
    [activeChallenge, submitAction]
  );

  // Handle continue from ConsequenceModal
  const handleConsequenceContinue = useCallback(() => {
    if (!lastSubmissionResult) return;

    // Case 1: Escape Completed (Game Cleared)
    if (lastSubmissionResult.escapeCompleted) {
      clearLastSubmissionResult();
      const sid = session?.sessionId;
      if (sid) {
        navigate(`/game/escape-result/${sid}`, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
      return;
    }

    // Case 2: Room Completed -> Trigger Bulkhead Transition to next sector
    if (lastSubmissionResult.isCorrect && lastSubmissionResult.roomCompleted && lastSubmissionResult.nextRoomIndex) {
      const nextRoomId = SECTOR_MAP[lastSubmissionResult.nextRoomIndex];
      if (nextRoomId) {
        setPendingNextRoomId(nextRoomId);
        setIsDoorTransitioning(true);
        clearLastSubmissionResult();
        return;
      }
    }

    // Case 3: Incorrect submission (and player didn't open debrief) -> dismiss consequence
    clearLastSubmissionResult();
  }, [lastSubmissionResult, clearLastSubmissionResult, navigate]);

  // Handle view debrief from ConsequenceModal
  const handleViewDebrief = useCallback(() => {
    setIsDebriefOpen(true);
  }, []);

  // Handle acknowledge debrief
  const handleAcknowledgeDebrief = useCallback(() => {
    setIsDebriefOpen(false);
    clearLastSubmissionResult();
  }, [clearLastSubmissionResult]);

  // Handle bulkhead door transition completion
  const handleDoorTransitionComplete = useCallback(() => {
    setIsDoorTransitioning(false);
    if (pendingNextRoomId) {
      navigate(`/game/room/${pendingNextRoomId}`);
      setPendingNextRoomId(null);
    }
  }, [pendingNextRoomId, navigate]);

  // Handle Game Over / Lockdown Breach restart
  const handleRestartSession = useCallback(async () => {
    setIsRestartingSession(true);
    try {
      if (session?.sessionId) {
        await abandonActiveSession().catch(() => {});
      }
      const newSession = await startNewSession();
      clearLastSubmissionResult();
      const firstRoomId = SECTOR_MAP[newSession?.currentRoomIndex || 1] || 'room-01-inbox';
      navigate(`/game/room/${firstRoomId}`);
    } catch (err) {
      setLocalError(err?.message || 'Failed to re-engage facility session.');
    } finally {
      setIsRestartingSession(false);
    }
  }, [session, abandonActiveSession, startNewSession, clearLastSubmissionResult, navigate]);

  // Determine modal states
  const livesRemaining = typeof session?.livesRemaining === 'number' ? session.livesRemaining : 3;
  const isLockdownBreach =
    livesRemaining <= 0 ||
    session?.status === 'FAILED' ||
    Boolean(lastSubmissionResult?.gameOver);

  const showConsequenceModal =
    Boolean(lastSubmissionResult) &&
    !isDebriefOpen &&
    !isLockdownBreach;

  const showLearningModal =
    isDebriefOpen &&
    Boolean(lastSubmissionResult?.learningIntervention);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0B0C0D] text-slate-100">
      {/* Top Diegetic HUD */}
      <GameHeader />

      {/* Main Room Viewport */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-7xl mx-auto w-full flex flex-col">
        {localError ? (
          <div className="m-auto max-w-lg rounded border border-red-500/60 bg-red-950/40 p-6 text-center font-mono text-xs text-red-300 space-y-3">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
            <h3 className="font-bold text-sm uppercase tracking-wider">SECTOR CLEARANCE ANOMALY</h3>
            <p className="text-slate-300 leading-relaxed">{localError}</p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <TerminalButton variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                RETURN TO HUB
              </TerminalButton>
              <TerminalButton
                variant="danger"
                size="sm"
                onClick={() => {
                  setLocalError(null);
                  if (roomId) loadRoom(roomId);
                }}
              >
                RETRY HANDSHAKE
              </TerminalButton>
            </div>
          </div>
        ) : !activeRoom ? (
          <div className="m-auto flex items-center justify-center font-mono text-xs text-cyan-400 gap-2">
            <svg className="animate-spin h-5 w-5 text-cyan-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="tracking-wider">SYNCHRONIZING SECTOR TELEMETRY...</span>
          </div>
        ) : (
          /* Dynamic Sector Container */
          <RoomContainer
            roomId={roomId}
            roomMetadata={{
              roomId: activeRoom.roomId,
              sectorNumber: activeRoom.sectorNumber,
              title: activeRoom.title,
              topic: activeRoom.topic,
              narrative: activeRoom.narrative,
              totalChallengesInSector: activeRoom.totalChallengesInSector,
              currentChallengeIndex: activeRoom.currentChallengeIndex,
            }}
            challengeData={activeChallenge}
            onDecisionSubmit={handleDecisionSubmit}
            onRequestHint={() => activeChallenge?.challengeId && requestHint(activeChallenge.challengeId)}
            isSubmitting={isSubmitting}
          />
        )}
      </main>

      {/* Authoritative Overlays */}

      {/* 1. Consequence Modal */}
      <ConsequenceModal
        isOpen={showConsequenceModal}
        result={lastSubmissionResult}
        onContinue={handleConsequenceContinue}
        onViewDebrief={handleViewDebrief}
      />

      {/* 2. Learning Intervention Debrief Modal */}
      <LearningInterventionModal
        isOpen={showLearningModal}
        intervention={lastSubmissionResult?.learningIntervention}
        onAcknowledge={handleAcknowledgeDebrief}
      />

      {/* 3. Lockdown Breach (Game Over) Modal */}
      <LockdownBreachModal
        isOpen={isLockdownBreach}
        score={session?.currentScore || 0}
        sectorIndex={session?.currentRoomIndex || 1}
        reason={lastSubmissionResult?.reason || 'LOCKDOWN_BREACH'}
        isLoading={isRestartingSession}
        onRestartSession={handleRestartSession}
        onExitDashboard={() => navigate('/dashboard')}
      />

      {/* 4. Bulkhead Pneumatic Door Transit Animation */}
      <PneumaticDoorTransition
        isOpen={isDoorTransitioning}
        doorLabel={`SECTOR ${(session?.currentRoomIndex || 1) < 5 ? String((session?.currentRoomIndex || 1) + 1).padStart(2, '0') : '05'}`}
        subtext="PNEUMATIC TRANSIT ENGAGED"
        onComplete={handleDoorTransitionComplete}
      />
    </div>
  );
}
