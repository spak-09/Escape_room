import { GameSession } from '../models/GameSession.js';
import { ChallengeAttempt } from '../models/ChallengeAttempt.js';
import { KnowledgeAssessment } from '../models/KnowledgeAssessment.js';
import { LeaderboardEntry } from '../models/LeaderboardEntry.js';
import { User } from '../models/User.js';
import { getRoom01ChallengeById } from '../data/challenges/room01.inbox.js';
import { getRoom02ChallengeById } from '../data/challenges/room02.vault.js';
import { getRoom03ChallengeById } from '../data/challenges/room03.scanner.js';
import { getRoom04ChallengeById } from '../data/challenges/room04.message.js';
import { getRoom05ChallengeById } from '../data/challenges/room05.control.js';
import { ROOM_MANIFESTS } from '../data/challenges/roomManifests.js';
import { calculateChallengeScore } from './scoringService.js';
import { buildEducationalPayload } from './adaptiveLearningService.js';
import { evaluateAndAwardAchievements } from './achievementService.js';
import { AppError } from '../utils/AppError.js';
import { GAME_STATUS, MAX_ROOMS, TOPICS, SCORING } from '../utils/constants.js';

export const ROOM_ORDER = [
  'room-01-inbox',
  'room-02-vault',
  'room-03-scanner',
  'room-04-message',
  'room-05-control',
];

/**
 * Normalizes aliases and threat IDs to standard containment action IDs.
 */
function normalizeContainmentAction(act) {
  if (act === 'ACTION_CONTAIN_C2_FIRST' || act === 'threat_phish_c2') return 'ACTION_SEVER_DC_C2';
  if (act === 'threat_vault_creds') return 'ACTION_LOCK_VAULT_CREDS';
  if (act === 'ACTION_RESET_HELPDESK_FIRST' || act === 'threat_social_helpdesk') return 'ACTION_ISOLATE_HELPDESK_PRETEXT';
  if (act === 'ACTION_PURGE_KIOSK_FIRST' || act === 'threat_qr_kiosk') return 'ACTION_PURGE_KIOSK_QR';
  return act;
}

/**
 * Resolves a challenge definition from dedicated room modules or general manifests.
 */
export function findChallengeById(challengeId) {
  const r1 = getRoom01ChallengeById(challengeId);
  if (r1) return r1;
  const r2 = getRoom02ChallengeById(challengeId);
  if (r2) return r2;
  const r3 = getRoom03ChallengeById(challengeId);
  if (r3) return r3;
  const r4 = getRoom04ChallengeById(challengeId);
  if (r4) return r4;
  const r5 = getRoom05ChallengeById(challengeId);
  if (r5) return r5;

  // Fallback to general room manifests
  for (const room of ROOM_MANIFESTS) {
    const found = room.challenges.find((c) => c.challengeId === challengeId);
    if (found) return { ...found, roomId: room.id };
  }

  return null;
}

/**
 * Resolves player's self-assessed baseline confidence for the challenge topic.
 */
function getConfidenceForTopic(assessment, topic) {
  if (!assessment) return 3;
  switch (topic) {
    case TOPICS.PHISHING:
      return assessment.phishingConfidence ?? 3;
    case TOPICS.PASSWORD_SECURITY:
      return assessment.passwordConfidence ?? 3;
    case TOPICS.QR_SECURITY:
      return assessment.qrConfidence ?? 3;
    case TOPICS.SOCIAL_ENGINEERING:
      return assessment.socialConfidence ?? 3;
    case TOPICS.MULTI_THREAT:
      return Math.round(
        ((assessment.phishingConfidence ?? 3) +
          (assessment.passwordConfidence ?? 3) +
          (assessment.qrConfidence ?? 3) +
          (assessment.socialConfidence ?? 3)) /
          4
      );
    default:
      return 3;
  }
}

/**
 * Authoritatively validates a challenge submission against server-held rules.
 */
export async function submitChallengeAction({
  sessionId,
  challengeId,
  actionId,
  containmentSequence,
  inspectedArtifacts = [],
  timeElapsedSeconds = 15,
  userId,
}) {
  const challenge = findChallengeById(challengeId);
  if (!challenge) {
    throw new AppError(`Challenge "${challengeId}" not found in facility manifests.`, 404, 'CHALLENGE_NOT_FOUND');
  }

  const session = await GameSession.findById(sessionId);
  if (!session) {
    throw new AppError('Game session not found.', 404, 'SESSION_NOT_FOUND');
  }

  // Prevent actions on terminal sessions
  if (session.status !== GAME_STATUS.IN_PROGRESS) {
    throw new AppError(
      `Game session is locked and cannot receive further actions. Status: ${session.status}`,
      409,
      'SESSION_LOCKED'
    );
  }

  // Enforce sequential room clearance
  const roomSector = ROOM_ORDER.indexOf(challenge.roomId) + 1;
  if (roomSector > 0 && roomSector > session.currentRoomIndex) {
    throw new AppError(
      `Clearance denied: Challenge belongs to Sector 0${roomSector}, but your session clearance is Sector 0${session.currentRoomIndex}.`,
      403,
      'PREREQUISITES_INCOMPLETE'
    );
  }

  const isRoom05 = challenge.roomId === 'room-05-control';

  // Prevent replay / duplicate score accumulation
  const existingSuccess = await ChallengeAttempt.findOne({
    sessionId,
    challengeId,
    isCorrect: true,
  });

  if (existingSuccess) {
    if (!isRoom05 || session.containmentState?.isFullyContained) {
      throw new AppError(
        'Challenge has already been successfully completed in this session.',
        409,
        'CHALLENGE_ALREADY_COMPLETED'
      );
    }
  }

  // Count past mistakes on this challenge
  const pastMistakes = await ChallengeAttempt.countDocuments({
    sessionId,
    challengeId,
    isCorrect: false,
  });

  // Calculate hints used on this challenge
  const hintsUsedCount = session.hintsUsed.filter((h) => h.startsWith(challengeId)).length;

  let isCorrect = false;
  let isFullyContained = false;
  let intermediateStep = false;
  let newlyContainedThreat = null;
  let containmentFailureReason = null;

  if (isRoom05) {
    const authoritativeOrder = challenge.authoritativeContainmentOrder || [
      'ACTION_SEVER_DC_C2',
      'ACTION_LOCK_VAULT_CREDS',
      'ACTION_ISOLATE_HELPDESK_PRETEXT',
      'ACTION_PURGE_KIOSK_QR',
    ];
    const authoritativeThreats = challenge.authoritativeThreatOrder || [
      'threat_phish_c2',
      'threat_vault_creds',
      'threat_social_helpdesk',
      'threat_qr_kiosk',
    ];

    // Mode A: Sequence array submitted
    if (containmentSequence && Array.isArray(containmentSequence) && containmentSequence.length > 0) {
      const normalizedSeq = containmentSequence.map(normalizeContainmentAction);
      const isCompleteLength = normalizedSeq.length === authoritativeOrder.length;
      const isOrderValid = isCompleteLength && normalizedSeq.every((act, idx) => act === authoritativeOrder[idx]);

      if (isOrderValid) {
        isCorrect = true;
        isFullyContained = true;
        session.containmentState = {
          activeThreats: [],
          containedThreats: [...authoritativeThreats],
          containmentSequence: normalizedSeq,
          isFullyContained: true,
        };
      } else {
        isCorrect = false;
        if (normalizedSeq[0] !== authoritativeOrder[0]) {
          containmentFailureReason = 'INCORRECT_PRIORITIZATION';
        } else {
          containmentFailureReason = 'INVALID_CONTAINMENT_ORDER';
        }
      }
    } else {
      // Mode B: Step-by-step submission
      const currentContained = session.containmentState?.containedThreats || [];
      const nextRequiredIdx = currentContained.length;
      const normalizedAction = normalizeContainmentAction(actionId);

      if (nextRequiredIdx < authoritativeOrder.length) {
        const expectedAction = authoritativeOrder[nextRequiredIdx];

        if (normalizedAction === expectedAction) {
          isCorrect = true;
          newlyContainedThreat = authoritativeThreats[nextRequiredIdx];
          const updatedContained = [...currentContained, newlyContainedThreat];
          const updatedSeq = [...(session.containmentState?.containmentSequence || []), normalizedAction];
          isFullyContained = updatedContained.length === authoritativeOrder.length;

          session.containmentState = {
            activeThreats: authoritativeThreats.filter((t) => !updatedContained.includes(t)),
            containedThreats: updatedContained,
            containmentSequence: updatedSeq,
            isFullyContained,
          };
          intermediateStep = !isFullyContained;
        } else {
          isCorrect = false;
          if (nextRequiredIdx === 0 && normalizedAction !== authoritativeOrder[0]) {
            containmentFailureReason = 'INCORRECT_PRIORITIZATION';
          } else {
            containmentFailureReason = 'INVALID_CONTAINMENT_ORDER';
          }
        }
      } else {
        isCorrect = true;
        isFullyContained = true;
      }
    }
  } else {
    // Rooms 01-04 single action evaluation
    isCorrect = actionId === challenge.correctActionId;
  }

  if (isCorrect) {
    if (intermediateStep) {
      // Award intermediate step points in Room 05
      const stepScore = 250;
      session.currentScore += stepScore;
      await session.save();

      await ChallengeAttempt.create({
        sessionId,
        roomId: 'room-05-control',
        challengeId,
        actionTaken: actionId,
        isCorrect: true,
        scoreDelta: stepScore,
        lifeDelta: 0,
        hintsUsed: hintsUsedCount,
        timeElapsedSeconds,
        inspectedArtifacts,
      });

      return {
        isCorrect: true,
        stepCompleted: true,
        roomCompleted: false,
        isFullyContained: false,
        threatContained: newlyContainedThreat,
        containedThreats: session.containmentState.containedThreats,
        remainingThreats: 4 - session.containmentState.containedThreats.length,
        consequence: `Contained threat ${newlyContainedThreat}. Threat neutralized! Proceed with next priority containment.`,
        scoreDelta: stepScore,
        currentScore: session.currentScore,
        livesRemaining: session.livesRemaining,
      };
    }

    // Check investigation thoroughness bonus
    const investigationBonus = challenge.valuableArtifacts
      ? challenge.valuableArtifacts.some((art) => inspectedArtifacts.includes(art))
      : false;

    // Compute authoritative score
    const basePoints = isRoom05
      ? (challenge.scoringMetadata?.basePoints || SCORING.BASE_POINTS_CONTROL_ROOM)
      : (challenge.scoringMetadata?.basePoints || SCORING.BASE_POINTS_STANDARD);
    const difficulty = isRoom05 ? 'expert' : (challenge.difficulty || 'beginner');
    const targetTimeSeconds = challenge.scoringMetadata?.targetTimeSeconds || (isRoom05 ? 45 : 30);

    const scoreDelta = calculateChallengeScore({
      basePoints,
      difficulty,
      targetTimeSeconds,
      timeElapsedSeconds,
      hintsUsedCount,
      mistakesCount: pastMistakes,
      investigationBonus,
    });

    const isFinalRoom = roomSector === ROOM_ORDER.length;
    const nextRoomIndex = isFinalRoom
      ? session.currentRoomIndex
      : Math.min(MAX_ROOMS, Math.max(session.currentRoomIndex, roomSector + 1));

    session.currentScore += scoreDelta;
    session.currentRoomIndex = nextRoomIndex;
    session.currentChallengeIndex = 0;

    let awardedBadges = [];

    if (isFinalRoom) {
      session.status = GAME_STATUS.COMPLETED;
      session.completionTime = new Date();
      session.isLeaderboardEligible = true;
      if (session.containmentState) {
        session.containmentState.isFullyContained = true;
      }

      await session.save();

      // Trigger authoritative achievement evaluation
      awardedBadges = await evaluateAndAwardAchievements(session);

      // Create authoritative LeaderboardEntry
      const user = await User.findById(session.userId);
      const durationSeconds = Math.max(
        1,
        Math.round((session.completionTime.getTime() - (session.startTime || session.createdAt).getTime()) / 1000)
      );
      const totalAttempts = await ChallengeAttempt.countDocuments({ sessionId: session._id });
      const correctAttempts = (await ChallengeAttempt.countDocuments({ sessionId: session._id, isCorrect: true })) + 1;
      const accuracyPercentage = totalAttempts > 0 ? Math.round((correctAttempts / (totalAttempts + 1)) * 100) : 100;

      await LeaderboardEntry.findOneAndUpdate(
        { sessionId: session._id },
        {
          sessionId: session._id,
          userId: session.userId,
          username: user?.username || 'Cadet',
          finalScore: session.currentScore,
          totalDurationSeconds: durationSeconds,
          accuracyPercentage,
          livesRemaining: session.livesRemaining,
          badgesEarned: awardedBadges,
          recordedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    } else {
      await session.save();
    }

    // Atomically persist attempt
    await ChallengeAttempt.create({
      sessionId,
      roomId: challenge.roomId || 'room-01-inbox',
      challengeId,
      actionTaken: actionId,
      isCorrect: true,
      scoreDelta,
      lifeDelta: 0,
      hintsUsed: hintsUsedCount,
      timeElapsedSeconds,
      inspectedArtifacts,
    });

    return {
      isCorrect: true,
      consequence: challenge.consequenceData?.onCorrect || 'Threat neutralized.',
      scoreDelta,
      currentScore: session.currentScore,
      livesRemaining: session.livesRemaining,
      roomCompleted: true,
      nextRoomIndex: session.currentRoomIndex,
      isFullyContained: isRoom05 ? true : undefined,
      escapeCompleted: isFinalRoom,
      gameStatus: session.status,
      completionTime: session.completionTime,
      isLeaderboardEligible: session.isLeaderboardEligible,
      badgesEarned: isFinalRoom ? awardedBadges : undefined,
      investigationBonusAwarded: investigationBonus,
      containedThreats: isRoom05 ? session.containmentState?.containedThreats : undefined,
    };
  } else {
    // Incorrect decision: deduct a life
    session.livesRemaining -= 1;
    const gameOver = session.livesRemaining <= 0;

    if (gameOver) {
      session.status = GAME_STATUS.FAILED;
      session.completionTime = new Date();
    }

    await session.save();

    // Retrieve player baseline for topic to calibrate adaptive intervention
    const assessment = await KnowledgeAssessment.findOne({ userId });
    const selfConfidence = getConfidenceForTopic(assessment, challenge.topic);

    // Count cumulative mistakes in topic for this session
    const topicMistakes = (await ChallengeAttempt.countDocuments({
      sessionId,
      roomId: challenge.roomId || 'room-01-inbox',
      isCorrect: false,
    })) + 1;

    // Generate 5-part educational intervention
    const intervention = buildEducationalPayload({
      explanation: challenge.fivePartExplanation || challenge.explanation,
      topic: challenge.topic,
      difficulty: challenge.difficulty,
      historicalMistakes: topicMistakes,
      selfConfidenceRating: selfConfidence,
      hintsUsed: hintsUsedCount,
      attemptCount: pastMistakes + 1,
    });

    // Atomically persist attempt
    await ChallengeAttempt.create({
      sessionId,
      roomId: challenge.roomId || 'room-01-inbox',
      challengeId,
      actionTaken: actionId,
      isCorrect: false,
      scoreDelta: 0,
      lifeDelta: -1,
      hintsUsed: hintsUsedCount,
      timeElapsedSeconds,
      inspectedArtifacts,
    });

    return {
      isCorrect: false,
      consequence: challenge.consequenceData?.onIncorrect || 'Dangerous action executed.',
      lifeDelta: -1,
      livesRemaining: session.livesRemaining,
      gameOver,
      reason: gameOver ? 'LOCKDOWN_BREACH' : (containmentFailureReason || null),
      intervention,
      containedThreats: session.containmentState?.containedThreats || [],
    };
  }
}

/**
 * Requests an authoritative hint, applying score penalty and tracking revelation state.
 */
export async function requestChallengeHint({ sessionId, challengeId }) {
  const challenge = findChallengeById(challengeId);
  if (!challenge) {
    throw new AppError(`Challenge "${challengeId}" not found.`, 404, 'CHALLENGE_NOT_FOUND');
  }

  const session = await GameSession.findById(sessionId);
  if (!session) {
    throw new AppError('Game session not found.', 404, 'SESSION_NOT_FOUND');
  }

  // Enforce sequential room clearance
  const roomSector = ROOM_ORDER.indexOf(challenge.roomId) + 1;
  if (roomSector > 0 && roomSector > session.currentRoomIndex) {
    throw new AppError(
      `Clearance denied: Challenge belongs to Sector 0${roomSector}, but your session clearance is Sector 0${session.currentRoomIndex}.`,
      403,
      'PREREQUISITES_INCOMPLETE'
    );
  }

  const hints = challenge.hints || [];
  if (hints.length === 0) {
    throw new AppError('No hints are configured for this challenge terminal.', 404, 'NO_HINTS_AVAILABLE');
  }

  const revealedForChallenge = session.hintsUsed.filter((h) => h.startsWith(`${challengeId}_hint_`));

  if (revealedForChallenge.length >= hints.length) {
    return {
      hint: hints[hints.length - 1],
      hintsRemaining: 0,
      alreadyRevealed: true,
      currentScore: session.currentScore,
      message: 'All hints for this challenge have already been revealed.',
    };
  }

  const nextHintIndex = revealedForChallenge.length;
  const nextHintText = hints[nextHintIndex];
  const hintKey = `${challengeId}_hint_${nextHintIndex + 1}`;

  // Apply documented 75 point penalty
  const newScore = Math.max(0, session.currentScore - 75);

  const updatedSession = await GameSession.findByIdAndUpdate(
    sessionId,
    {
      $set: { currentScore: newScore },
      $push: { hintsUsed: hintKey },
    },
    { new: true }
  );

  return {
    hint: nextHintText,
    hintsRemaining: hints.length - nextHintIndex - 1,
    scorePenaltyApplied: 75,
    currentScore: updatedSession.currentScore,
  };
}
