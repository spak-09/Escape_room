import { getRoom01Challenges } from '../data/challenges/room01.inbox.js';
import { getRoom02Challenges } from '../data/challenges/room02.vault.js';
import { getRoom03Challenges } from '../data/challenges/room03.scanner.js';
import { getRoom04Challenges } from '../data/challenges/room04.message.js';
import { getRoom05Challenges } from '../data/challenges/room05.control.js';
import { DIFFICULTY_LEVELS, DIFFICULTY_QUESTION_COUNTS, SCORING } from '../utils/constants.js';
import { AppError } from '../utils/AppError.js';

export const ROOM_ORDER = [
  'room-01-inbox',
  'room-02-vault',
  'room-03-scanner',
  'room-04-message',
  'room-05-control',
];

/**
 * Maps roomId to the function returning that room's challenge bank.
 */
const ROOM_CHALLENGE_PROVIDERS = {
  'room-01-inbox': getRoom01Challenges,
  'room-02-vault': getRoom02Challenges,
  'room-03-scanner': getRoom03Challenges,
  'room-04-message': getRoom04Challenges,
  'room-05-control': getRoom05Challenges,
};

/**
 * Fisher-Yates array shuffle.
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Returns all challenges for a specific room and difficulty.
 */
export function getChallengesForRoom(roomId, difficulty) {
  const provider = ROOM_CHALLENGE_PROVIDERS[roomId];
  if (!provider) {
    throw new AppError(`Room "${roomId}" not recognized in question bank.`, 404, 'ROOM_NOT_FOUND');
  }

  const allRoomChallenges = provider();
  if (!difficulty) {
    return allRoomChallenges;
  }

  const normalizedDiff = difficulty.toLowerCase();
  return allRoomChallenges.filter((c) => (c.difficulty || 'beginner').toLowerCase() === normalizedDiff);
}

/**
 * Generates an authoritative mapping of roomId -> array of challenge IDs for a new session.
 * Enforces difficulty isolation, non-repeating questions, and exact required counts.
 */
export function selectSessionQuestions(difficulty = DIFFICULTY_LEVELS.BEGINNER) {
  const normalizedDiff = (difficulty || DIFFICULTY_LEVELS.BEGINNER).toLowerCase();
  const config = DIFFICULTY_QUESTION_COUNTS[normalizedDiff];

  if (!config) {
    throw new AppError(
      `Invalid difficulty "${difficulty}". Valid options are: ${Object.values(DIFFICULTY_LEVELS).join(', ')}.`,
      400,
      'INVALID_DIFFICULTY'
    );
  }

  const requiredPerRoom = config.perRoom;
  const roomQuestions = {};

  for (const roomId of ROOM_ORDER) {
    const candidateChallenges = getChallengesForRoom(roomId, normalizedDiff);

    if (candidateChallenges.length < requiredPerRoom) {
      throw new AppError(
        `Question bank deficit: Room "${roomId}" has ${candidateChallenges.length} challenges for difficulty "${normalizedDiff}", but ${requiredPerRoom} are required.`,
        500,
        'QUESTION_BANK_DEFICIT'
      );
    }

    // Shuffle and take required number of unique questions
    const shuffled = shuffleArray(candidateChallenges);
    const selected = shuffled.slice(0, requiredPerRoom);
    roomQuestions[roomId] = selected.map((c) => c.challengeId);
  }

  return roomQuestions;
}

/**
 * Finds any challenge across the entire question bank by its challengeId.
 */
export function findChallengeById(challengeId) {
  for (const roomId of ROOM_ORDER) {
    const provider = ROOM_CHALLENGE_PROVIDERS[roomId];
    if (provider) {
      const found = provider().find((c) => c.challengeId === challengeId);
      if (found) {
        return { ...found, roomId };
      }
    }
  }
  return null;
}

/**
 * Calculates the maximum attainable score for a run based on the difficulty and assigned questions.
 */
export function calculateMaxPossibleScore(difficulty = DIFFICULTY_LEVELS.BEGINNER, roomQuestions = null) {
  const normalizedDiff = (difficulty || DIFFICULTY_LEVELS.BEGINNER).toLowerCase();

  // If specific assigned questions are provided, calculate exact sum
  if (roomQuestions && typeof roomQuestions === 'object') {
    let totalMax = 0;
    for (const [roomId, challengeIds] of Object.entries(roomQuestions)) {
      const isRoom05 = roomId === 'room-05-control';
      const defaultBase = isRoom05 ? SCORING.BASE_POINTS_CONTROL_ROOM : SCORING.BASE_POINTS_STANDARD;
      for (const chId of challengeIds) {
        const ch = findChallengeById(chId);
        const base = ch?.scoringMetadata?.basePoints || defaultBase;
        const timeBonus = SCORING.MAX_TIME_BONUS || 200;
        const investigationBonus = 100;
        totalMax += base + timeBonus + investigationBonus;
      }
    }
    if (totalMax > 0) return totalMax;
  }

  // Standard formula fallback: 4 standard rooms + 1 control room
  const config = DIFFICULTY_QUESTION_COUNTS[normalizedDiff] || DIFFICULTY_QUESTION_COUNTS.beginner;
  const countPerRoom = config.perRoom;

  const maxStandardPerChallenge = SCORING.BASE_POINTS_STANDARD + (SCORING.MAX_TIME_BONUS || 200) + 100; // 800
  const maxControlPerChallenge = SCORING.BASE_POINTS_CONTROL_ROOM + (SCORING.MAX_TIME_BONUS || 200) + 100; // 1800

  return (4 * countPerRoom * maxStandardPerChallenge) + (countPerRoom * maxControlPerChallenge);
}

/**
 * Calculates normalized score percentage (0 - 100).
 */
export function calculateNormalizedScore(rawScore, maxPossible) {
  if (!maxPossible || maxPossible <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((rawScore / maxPossible) * 100)));
}
