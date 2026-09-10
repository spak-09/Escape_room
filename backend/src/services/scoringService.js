import { SCORING } from '../utils/constants.js';

const DIFFICULTY_MULTIPLIERS = {
  beginner: 1.0,
  intermediate: 1.25,
  advanced: 1.5,
  expert: 2.0,
};

/**
 * Calculates authoritative challenge score based on documented rules:
 * - base points * difficulty multiplier
 * - time bonus (max 0 to 200 based on targetTime and elapsed time)
 * - hint deduction (75 per hint)
 * - mistake deduction (150 per mistake)
 * - minimum floor of 50 points upon successful completion
 */
export function calculateChallengeScore({
  basePoints = SCORING.BASE_POINTS_STANDARD,
  difficulty = 'beginner',
  targetTimeSeconds = 30,
  timeElapsedSeconds = 15,
  hintsUsedCount = 0,
  mistakesCount = 0,
  investigationBonus = false,
}) {
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;
  const weightedBase = basePoints * multiplier;

  // Time bonus: 2 points per second remaining below targetTime, capped at 200
  const secondsSaved = Math.max(0, targetTimeSeconds - timeElapsedSeconds);
  const timeBonus = Math.min(SCORING.MAX_TIME_BONUS, secondsSaved * 2);

  const hintDeduction = hintsUsedCount * SCORING.HINT_PENALTY;
  const mistakeDeduction = mistakesCount * SCORING.MISTAKE_PENALTY;
  const bonus = investigationBonus ? 50 : 0;

  const rawScore = weightedBase + timeBonus + bonus - hintDeduction - mistakeDeduction;

  // Guaranteed minimum floor of 50 points upon successful resolution
  return Math.max(SCORING.MIN_CHALLENGE_SCORE, Math.round(rawScore));
}
