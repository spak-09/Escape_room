import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../../src/models/User.js';
import { KnowledgeAssessment } from '../../src/models/KnowledgeAssessment.js';
import { GameSession } from '../../src/models/GameSession.js';
import { ChallengeAttempt } from '../../src/models/ChallengeAttempt.js';
import { Achievement } from '../../src/models/Achievement.js';
import { LeaderboardEntry } from '../../src/models/LeaderboardEntry.js';
import { GAME_STATUS, INITIAL_LIVES } from '../../src/utils/constants.js';

describe('Base Data Models', () => {
  describe('User Model', () => {
    it('should fail validation if required fields are missing', () => {
      const user = new User();
      const error = user.validateSync();
      expect(error.errors.username).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.passwordHash).toBeDefined();
    });

    it('should fail validation for invalid email format', () => {
      const user = new User({
        username: 'cadet1',
        email: 'invalid-email-format',
        passwordHash: '$2a$12$e8Y6/x3hK/eL4l89Z.fakehashlongerthan60charactersfortestvalidation',
      });
      const error = user.validateSync();
      expect(error.errors.email).toBeDefined();
    });

    it('should compare password correctly via bcrypt', async () => {
      const password = 'TestSecretPassword123!';
      const hash = await bcrypt.hash(password, 12);
      const user = new User({
        username: 'cadet1',
        email: 'cadet1@example.com',
        passwordHash: hash,
      });

      const isMatch = await user.comparePassword(password);
      const isMismatch = await user.comparePassword('WrongPassword');

      expect(isMatch).toBe(true);
      expect(isMismatch).toBe(false);
    });

    it('should sanitize passwordHash when serialized to JSON', async () => {
      const hash = await bcrypt.hash('secret', 12);
      const user = new User({
        username: 'cadet1',
        email: 'cadet1@example.com',
        passwordHash: hash,
      });

      const json = user.toJSON();
      expect(json.passwordHash).toBeUndefined();
      expect(json.username).toBe('cadet1');
    });
  });

  describe('KnowledgeAssessment Model', () => {
    it('should validate ratings are within 1 to 5 boundaries', () => {
      const validAssessment = new KnowledgeAssessment({
        userId: new mongoose.Types.ObjectId(),
        phishingConfidence: 4,
        passwordConfidence: 3,
        qrConfidence: 2,
        socialConfidence: 5,
        tutorialRequested: true,
      });
      expect(validAssessment.validateSync()).toBeUndefined();

      const invalidAssessment = new KnowledgeAssessment({
        userId: new mongoose.Types.ObjectId(),
        phishingConfidence: 0, // out of bounds
        passwordConfidence: 6, // out of bounds
        qrConfidence: 3,
        socialConfidence: 3,
      });
      const error = invalidAssessment.validateSync();
      expect(error.errors.phishingConfidence).toBeDefined();
      expect(error.errors.passwordConfidence).toBeDefined();
    });
  });

  describe('GameSession Model', () => {
    it('should initialize with 3 lives and NOT_STARTED status', () => {
      const session = new GameSession({
        userId: new mongoose.Types.ObjectId(),
      });

      expect(session.livesRemaining).toBe(INITIAL_LIVES);
      expect(session.currentScore).toBe(0);
      expect(session.currentRoomIndex).toBe(1);
      expect(session.status).toBe(GAME_STATUS.NOT_STARTED);
      expect(session.hintsUsed).toEqual([]);
      expect(session.validateSync()).toBeUndefined();
    });

    it('should reject invalid status values', () => {
      const session = new GameSession({
        userId: new mongoose.Types.ObjectId(),
        status: 'INVALID_STATUS',
      });
      const error = session.validateSync();
      expect(error.errors.status).toBeDefined();
    });
  });

  describe('ChallengeAttempt Model', () => {
    it('should require sessionId, roomId, challengeId, actionTaken, and isCorrect', () => {
      const attempt = new ChallengeAttempt();
      const error = attempt.validateSync();
      expect(error.errors.sessionId).toBeDefined();
      expect(error.errors.roomId).toBeDefined();
      expect(error.errors.challengeId).toBeDefined();
      expect(error.errors.actionTaken).toBeDefined();
      expect(error.errors.isCorrect).toBeDefined();
    });

    it('should validate a valid attempt entry', () => {
      const attempt = new ChallengeAttempt({
        sessionId: new mongoose.Types.ObjectId(),
        roomId: 'room-01-inbox',
        challengeId: 'ch-phish-01',
        actionTaken: 'ACTION_QUARANTINE',
        isCorrect: true,
        scoreDelta: 500,
        lifeDelta: 0,
        hintsUsedCount: 0,
        timeElapsedSeconds: 15,
        inspectedArtifacts: ['header_from', 'url_inspect'],
      });
      expect(attempt.validateSync()).toBeUndefined();
    });
  });

  describe('Achievement Model', () => {
    it('should require userId, badgeCode, title, and description', () => {
      const achievement = new Achievement();
      const error = achievement.validateSync();
      expect(error.errors.userId).toBeDefined();
      expect(error.errors.badgeCode).toBeDefined();
      expect(error.errors.title).toBeDefined();
      expect(error.errors.description).toBeDefined();
    });
  });

  describe('LeaderboardEntry Model', () => {
    it('should require verified session data and numeric score metrics', () => {
      const entry = new LeaderboardEntry({
        sessionId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        username: 'Cadet942',
        finalScore: 8450,
        totalDurationSeconds: 872,
        accuracyPercentage: 88.5,
        livesRemaining: 2,
        badgesEarned: ['cyber_guardian', 'phishing_expert'],
      });
      expect(entry.validateSync()).toBeUndefined();
    });
  });
});
