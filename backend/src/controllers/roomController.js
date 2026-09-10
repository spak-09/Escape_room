import { findRoomManifest, sanitizeRoomForClient } from '../data/challenges/roomManifests.js';
import { GameSession } from '../models/GameSession.js';
import { AppError } from '../utils/AppError.js';
import { GAME_STATUS } from '../utils/constants.js';

/**
 * Access a facility sector with sequential progression checks and sanitized presentation data.
 */
export async function getRoomDetails(req, res, next) {
  try {
    const { roomId } = req.params;

    // 1. Look up room manifest
    const roomManifest = findRoomManifest(roomId);
    if (!roomManifest) {
      throw new AppError(`Facility sector "${roomId}" not found.`, 404, 'ROOM_NOT_FOUND');
    }

    // 2. Look up player's active session
    const session = await GameSession.findOne({
      userId: req.user.id,
      status: GAME_STATUS.IN_PROGRESS,
    });

    if (!session) {
      throw new AppError(
        'No active escape session found. You must initiate facility access before entering sectors.',
        403,
        'NO_ACTIVE_SESSION'
      );
    }

    // 3. Sequential progression enforcement
    if (roomManifest.sectorNumber > session.currentRoomIndex) {
      throw new AppError(
        `Clearance denied: Sector 0${roomManifest.sectorNumber} is sealed. You must first clear Sector 0${session.currentRoomIndex}.`,
        403,
        'PREREQUISITES_INCOMPLETE'
      );
    }

    // 4. Sanitize presentation data (stripping correctActionId, hiddenIoCs, answers)
    const sanitizedData = sanitizeRoomForClient(roomManifest, session.currentChallengeIndex);

    return res.status(200).json({
      success: true,
      data: {
        ...sanitizedData,
        session: {
          sessionId: session._id,
          livesRemaining: session.livesRemaining,
          currentScore: session.currentScore,
          currentRoomIndex: session.currentRoomIndex,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}
