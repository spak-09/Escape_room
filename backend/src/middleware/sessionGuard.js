import { GameSession } from '../models/GameSession.js';
import { AppError } from '../utils/AppError.js';
import { GAME_STATUS } from '../utils/constants.js';

/**
 * Middleware ensuring:
 * 1. Session exists
 * 2. Authenticated player owns the session (IDOR prevention)
 * 3. Session status is IN_PROGRESS (rejecting COMPLETED, FAILED, or ABANDONED)
 */
export async function sessionGuard(req, res, next) {
  try {
    const sessionId = req.body?.sessionId || req.params?.sessionId || req.query?.sessionId;

    if (!sessionId) {
      throw new AppError('Game session identifier is required', 400, 'SESSION_ID_REQUIRED');
    }

    const session = await GameSession.findById(sessionId);

    if (!session) {
      throw new AppError('Game session not found', 404, 'SESSION_NOT_FOUND');
    }

    // Strict ownership verification (Anti-IDOR)
    if (session.userId.toString() !== req.user.id) {
      throw new AppError('Access denied: You do not have clearance for this game session.', 403, 'FORBIDDEN_SESSION_ACCESS');
    }

    // Terminal session locking
    if (session.status !== GAME_STATUS.IN_PROGRESS) {
      throw new AppError(
        `Game session is locked and cannot receive further actions. Status: ${session.status}`,
        409,
        'SESSION_LOCKED'
      );
    }

    req.gameSession = session;
    return next();
  } catch (error) {
    return next(error);
  }
}
