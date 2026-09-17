import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { sessionService } from '../services/sessionService';
import { challengeService } from '../services/challengeService';
import { useAuth } from '../hooks/useAuth';
import { soundEngine } from '../utils/soundEngine';

export const GameSessionContext = createContext(null);

export const SECTOR_MAP = {
  1: 'room-01-inbox',
  2: 'room-02-vault',
  3: 'room-03-scanner',
  4: 'room-04-message',
  5: 'room-05-control',
};

export const ROOM_ID_TO_SECTOR = {
  'room-01-inbox': 1,
  'room-02-vault': 2,
  'room-03-scanner': 3,
  'room-04-message': 4,
  'room-05-control': 5,
};

export function GameSessionProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [session, setSession] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionResult, setLastSubmissionResult] = useState(null);
  const [lastHintResult, setLastHintResult] = useState(null);
  const [error, setError] = useState(null);

  // Normalize session object
  const normalizeSession = (rawSession) => {
    if (!rawSession) return null;
    return {
      ...rawSession,
      sessionId: rawSession._id || rawSession.sessionId,
      difficulty: rawSession.difficulty || null,
      currentRoomIndex: rawSession.currentRoomIndex || 1,
      currentChallengeIndex: rawSession.currentChallengeIndex || 0,
      livesRemaining: typeof rawSession.livesRemaining === 'number' ? rawSession.livesRemaining : 3,
      currentScore: typeof rawSession.currentScore === 'number' ? rawSession.currentScore : 0,
      hintsUsed: Array.isArray(rawSession.hintsUsed) ? rawSession.hintsUsed : [],
      status: rawSession.status || 'IN_PROGRESS',
    };
  };

  // Fetch active session from server
  const fetchActiveSession = useCallback(async () => {
    if (!isAuthenticated) {
      setSession(null);
      return null;
    }

    setIsLoadingSession(true);
    setError(null);
    try {
      const active = await sessionService.getActiveSession();
      const normalized = normalizeSession(active);
      setSession(normalized);
      return normalized;
    } catch (err) {
      setError(err?.message || 'Failed to fetch active session');
      return null;
    } finally {
      setIsLoadingSession(false);
    }
  }, [isAuthenticated]);

  // Check for active session when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      fetchActiveSession();
    } else {
      setSession(null);
      setActiveRoom(null);
      setLastSubmissionResult(null);
      setLastHintResult(null);
    }
  }, [isAuthenticated, fetchActiveSession]);

  // Start new session or resume existing
  const startNewSession = useCallback(async (difficulty, restart = false) => {
    setIsLoadingSession(true);
    setError(null);
    try {
      const res = await sessionService.startSession(difficulty, restart);
      const normalized = normalizeSession(res.session);
      setSession(normalized);
      soundEngine.playUnlock();
      return normalized;
    } catch (err) {
      setError(err?.message || 'Failed to initialize session');
      throw err;
    } finally {
      setIsLoadingSession(false);
    }
  }, []);

  // Abandon active session
  const abandonActiveSession = useCallback(async () => {
    if (!session?.sessionId) return;
    setIsLoadingSession(true);
    try {
      await sessionService.abandonSession(session.sessionId);
      setSession(null);
      setActiveRoom(null);
      setLastSubmissionResult(null);
    } catch (err) {
      setError(err?.message || 'Failed to abandon session');
      throw err;
    } finally {
      setIsLoadingSession(false);
    }
  }, [session]);

  // Load sanitized room data
  const loadRoom = useCallback(async (roomId) => {
    if (!session?.sessionId) return null;
    setError(null);
    try {
      const roomData = await challengeService.getRoom(roomId, session.sessionId);
      setActiveRoom(roomData);
      return roomData;
    } catch (err) {
      setError(err?.message || 'Failed to load sector data');
      throw err;
    }
  }, [session]);

  // Submit challenge decision (Strict Server-Authoritative)
  const submitAction = useCallback(
    async (challengeId, { actionId, containmentSequence, inspectedArtifacts, timeElapsedSeconds = 15 }) => {
      if (!session?.sessionId) throw new Error('No active session');

      setIsSubmitting(true);
      setError(null);

      try {
        const result = await challengeService.submitChallenge(challengeId, {
          sessionId: session.sessionId,
          actionId,
          containmentSequence,
          inspectedArtifacts,
          timeElapsedSeconds,
        });

        // Store result for UI consequence modal/interventions
        setLastSubmissionResult(result);

        // Update server-authoritative state directly from response values
        setSession((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            currentScore: typeof result.currentScore === 'number' ? result.currentScore : prev.currentScore,
            livesRemaining: typeof result.livesRemaining === 'number' ? result.livesRemaining : prev.livesRemaining,
            currentRoomIndex: typeof result.nextRoomIndex === 'number' ? result.nextRoomIndex : prev.currentRoomIndex,
            currentChallengeIndex: typeof result.currentChallengeIndex === 'number' ? result.currentChallengeIndex : prev.currentChallengeIndex,
            status: result.gameStatus || prev.status,
          };
        });

        // Audio feedback based on server result
        if (result.isCorrect) {
          soundEngine.playUnlock();
        } else {
          if (result.livesRemaining <= 0) {
            soundEngine.playAlarm();
          } else {
            soundEngine.playAccessDenied();
          }
        }

        return result;
      } catch (err) {
        setError(err?.message || 'Failed to evaluate tactical decision');
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [session]
  );

  // Request hint (Strict Server-Authoritative)
  const requestHint = useCallback(
    async (challengeId) => {
      if (!session?.sessionId) throw new Error('No active session');

      setError(null);
      try {
        const result = await challengeService.requestHint(challengeId, session.sessionId);
        setLastHintResult(result);

        // Update score from server response
        if (typeof result.currentScore === 'number') {
          setSession((prev) => (prev ? { ...prev, currentScore: result.currentScore } : prev));
        }

        soundEngine.playChime();
        return result;
      } catch (err) {
        setError(err?.message || 'Failed to retrieve hint');
        throw err;
      }
    },
    [session]
  );

  const clearLastSubmissionResult = useCallback(() => {
    setLastSubmissionResult(null);
  }, []);

  const clearLastHintResult = useCallback(() => {
    setLastHintResult(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      activeRoom,
      activeChallenge: activeRoom?.currentChallenge || activeRoom?.challenge,
      isLoadingSession,
      isSubmitting,
      lastSubmissionResult,
      lastHintResult,
      error,
      startNewSession,
      fetchActiveSession,
      abandonActiveSession,
      loadRoom,
      submitAction,
      requestHint,
      clearLastSubmissionResult,
      clearLastHintResult,
    }),
    [
      session,
      activeRoom,
      isLoadingSession,
      isSubmitting,
      lastSubmissionResult,
      lastHintResult,
      error,
      startNewSession,
      fetchActiveSession,
      abandonActiveSession,
      loadRoom,
      submitAction,
      requestHint,
      clearLastSubmissionResult,
      clearLastHintResult,
    ]
  );

  return <GameSessionContext.Provider value={value}>{children}</GameSessionContext.Provider>;
}
