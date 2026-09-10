import { describe, it, expect } from 'vitest';
import { GAME_STATUS, INITIAL_LIVES, MAX_ROOMS, SCORING, TOPICS, INTERVENTION_LEVELS, USER_ROLES } from '../../src/utils/constants.js';

describe('System Constants', () => {
  it('should define authoritative game statuses', () => {
    expect(GAME_STATUS.NOT_STARTED).toBe('NOT_STARTED');
    expect(GAME_STATUS.IN_PROGRESS).toBe('IN_PROGRESS');
    expect(GAME_STATUS.COMPLETED).toBe('COMPLETED');
    expect(GAME_STATUS.FAILED).toBe('FAILED');
    expect(GAME_STATUS.ABANDONED).toBe('ABANDONED');
    expect(Object.isFrozen(GAME_STATUS)).toBe(true);
  });

  it('should define initial lives and room limits', () => {
    expect(INITIAL_LIVES).toBe(3);
    expect(MAX_ROOMS).toBe(5);
  });

  it('should define scoring standards matching architecture', () => {
    expect(SCORING.BASE_POINTS_STANDARD).toBe(500);
    expect(SCORING.BASE_POINTS_CONTROL_ROOM).toBe(1500);
    expect(SCORING.HINT_PENALTY).toBe(75);
    expect(SCORING.MISTAKE_PENALTY).toBe(150);
    expect(SCORING.MIN_CHALLENGE_SCORE).toBe(50);
    expect(SCORING.MAX_TIME_BONUS).toBe(200);
  });

  it('should define core cybersecurity topics', () => {
    expect(TOPICS.PHISHING).toBe('phishing');
    expect(TOPICS.PASSWORD_SECURITY).toBe('password_security');
    expect(TOPICS.QR_SECURITY).toBe('qr_security');
    expect(TOPICS.SOCIAL_ENGINEERING).toBe('social_engineering');
    expect(TOPICS.MULTI_THREAT).toBe('multi_threat');
  });

  it('should define 4 adaptive intervention levels', () => {
    expect(INTERVENTION_LEVELS.LEVEL_1_NONE).toBe(1);
    expect(INTERVENTION_LEVELS.LEVEL_2_CONTEXTUAL_EXPLANATION).toBe(2);
    expect(INTERVENTION_LEVELS.LEVEL_3_MICRO_TUTORIAL).toBe(3);
    expect(INTERVENTION_LEVELS.LEVEL_4_GUIDED_RETRY).toBe(4);
  });

  it('should define user roles', () => {
    expect(USER_ROLES.PLAYER).toBe('player');
    expect(USER_ROLES.ADMIN).toBe('admin');
  });
});
