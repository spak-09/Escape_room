import { describe, it, expect } from 'vitest';
import { calculateChallengeScore } from '../../src/services/scoringService.js';

describe('Scoring Service Unit Tests', () => {
  it('should calculate base score with beginner multiplier (1.0x)', () => {
    const score = calculateChallengeScore({
      basePoints: 500,
      difficulty: 'beginner',
      targetTimeSeconds: 30,
      timeElapsedSeconds: 30, // 0 time bonus
      hintsUsedCount: 0,
      mistakesCount: 0,
    });

    expect(score).toBe(500);
  });

  it('should apply difficulty multipliers correctly', () => {
    const intermediate = calculateChallengeScore({
      basePoints: 500,
      difficulty: 'intermediate',
      targetTimeSeconds: 30,
      timeElapsedSeconds: 30,
    });
    expect(intermediate).toBe(625); // 500 * 1.25

    const advanced = calculateChallengeScore({
      basePoints: 500,
      difficulty: 'advanced',
      targetTimeSeconds: 30,
      timeElapsedSeconds: 30,
    });
    expect(advanced).toBe(750); // 500 * 1.5

    const expert = calculateChallengeScore({
      basePoints: 1000,
      difficulty: 'expert',
      targetTimeSeconds: 30,
      timeElapsedSeconds: 30,
    });
    expect(expert).toBe(2000); // 1000 * 2.0
  });

  it('should award time bonus capped at 200 points', () => {
    // 20 seconds saved * 2 = 40 bonus points
    const withBonus = calculateChallengeScore({
      basePoints: 500,
      difficulty: 'beginner',
      targetTimeSeconds: 30,
      timeElapsedSeconds: 10,
    });
    expect(withBonus).toBe(540); // 500 + 40

    // 150 seconds saved -> capped at 200
    const maxBonus = calculateChallengeScore({
      basePoints: 500,
      difficulty: 'beginner',
      targetTimeSeconds: 200,
      timeElapsedSeconds: 10,
    });
    expect(maxBonus).toBe(700); // 500 + 200
  });

  it('should deduct 75 points per hint and 150 points per mistake', () => {
    const penalized = calculateChallengeScore({
      basePoints: 500,
      difficulty: 'beginner',
      targetTimeSeconds: 30,
      timeElapsedSeconds: 30,
      hintsUsedCount: 1, // -75
      mistakesCount: 1, // -150
    });

    expect(penalized).toBe(275); // 500 - 75 - 150 = 275
  });

  it('should enforce minimum success score floor of 50 points', () => {
    const heavilyPenalized = calculateChallengeScore({
      basePoints: 500,
      difficulty: 'beginner',
      targetTimeSeconds: 30,
      timeElapsedSeconds: 30,
      hintsUsedCount: 4, // -300
      mistakesCount: 3, // -450 -> would be -250
    });

    expect(heavilyPenalized).toBe(50); // Minimum floor guaranteed
  });

  it('should add investigation bonus (+50) when thoroughness criteria met', () => {
    const withBonus = calculateChallengeScore({
      basePoints: 500,
      difficulty: 'beginner',
      targetTimeSeconds: 30,
      timeElapsedSeconds: 30,
      investigationBonus: true,
    });

    expect(withBonus).toBe(550);
  });
});
