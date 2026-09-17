import { GameSession } from '../models/GameSession.js';
import { AppError } from '../utils/AppError.js';
import { GAME_STATUS, INITIAL_LIVES, DIFFICULTY_LEVELS } from '../utils/constants.js';

import { selectSessionQuestions } from './questionBankService.js';

/**
 * Initializes a new game session or resumes an existing in-progress session.
 */
export async function startSession(userId, options = {}) {
  const { difficulty: requestedDifficulty, restart = false } = options;
  const difficulty = (requestedDifficulty || DIFFICULTY_LEVELS.BEGINNER).toLowerCase();

  if (!Object.values(DIFFICULTY_LEVELS).includes(difficulty)) {
    throw new AppError(
      `Invalid difficulty level: "${requestedDifficulty}". Valid options are ${Object.values(DIFFICULTY_LEVELS).join(', ')}.`,
      400,
      'INVALID_DIFFICULTY'
    );
  }

  // Check if player already has an active playthrough
  const existingActiveSession = await GameSession.findOne({
    userId,
    status: GAME_STATUS.IN_PROGRESS,
  });

  if (existingActiveSession) {
    const existingDifficulty = (existingActiveSession.difficulty || DIFFICULTY_LEVELS.BEGINNER).toLowerCase();
    const shouldRestart = restart === true || (requestedDifficulty && existingDifficulty !== difficulty);

    if (shouldRestart) {
      existingActiveSession.status = GAME_STATUS.ABANDONED;
      existingActiveSession.completionTime = new Date();
      await existingActiveSession.save();
    } else {
      // If legacy session lacks roomQuestions, assign them dynamically
      if (!existingActiveSession.roomQuestions || Object.keys(existingActiveSession.roomQuestions).length === 0) {
        existingActiveSession.roomQuestions = selectSessionQuestions(existingDifficulty);
        existingActiveSession.markModified('roomQuestions');
        await existingActiveSession.save();
      }

      return {
        session: existingActiveSession,
        isResumed: true,
        message: 'Active escape session resumed.',
      };
    }
  }

  // Create authoritative playthrough with randomized, difficulty-isolated questions
  const roomQuestions = selectSessionQuestions(difficulty);

  const session = await GameSession.create({
    userId,
    difficulty,
    roomQuestions,
    currentRoomIndex: 1,
    currentChallengeIndex: 0,
    livesRemaining: INITIAL_LIVES,
    currentScore: 0,
    hintsUsed: [],
    status: GAME_STATUS.IN_PROGRESS,
    startTime: new Date(),
  });

  return {
    session,
    isResumed: false,
    message: 'New facility escape session initialized.',
  };
}

/**
 * Retrieves the authenticated player's active in-progress session.
 */
export async function getActiveSession(userId) {
  const session = await GameSession.findOne({
    userId,
    status: GAME_STATUS.IN_PROGRESS,
  });

  if (!session) {
    throw new AppError('No active escape session found for this cadet.', 404, 'ACTIVE_SESSION_NOT_FOUND');
  }

  return session;
}

/**
 * Abandons an active playthrough, moving it to terminal ABANDONED state.
 */
export async function abandonSession(userId, sessionId = null) {
  const query = sessionId
    ? { _id: sessionId, userId }
    : { userId, status: GAME_STATUS.IN_PROGRESS };

  const session = await GameSession.findOne(query);

  if (!session) {
    throw new AppError('No active escape session found to abandon.', 404, 'ACTIVE_SESSION_NOT_FOUND');
  }

  // Terminal state check
  if ([GAME_STATUS.COMPLETED, GAME_STATUS.FAILED, GAME_STATUS.ABANDONED].includes(session.status)) {
    throw new AppError(`Session is already closed. Current status: ${session.status}`, 409, 'SESSION_LOCKED');
  }

  session.status = GAME_STATUS.ABANDONED;
  session.completionTime = new Date();
  await session.save();

  return session;
}
