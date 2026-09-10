import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../../src/config/db.js';
import { User } from '../../src/models/User.js';
import { KnowledgeAssessment } from '../../src/models/KnowledgeAssessment.js';
import { GameSession } from '../../src/models/GameSession.js';
import { ChallengeAttempt } from '../../src/models/ChallengeAttempt.js';
import { Achievement } from '../../src/models/Achievement.js';
import { LeaderboardEntry } from '../../src/models/LeaderboardEntry.js';
import { GAME_STATUS } from '../../src/utils/constants.js';

describe('Phase B1: Authoritative Persistence Layer Integration', () => {
  const testRunId = Date.now();
  let testUser1;
  let testSession1;

  beforeAll(async () => {
    await connectDB();
    // Ensure all indexes are built in MongoDB
    await Promise.all([
      User.init(),
      KnowledgeAssessment.init(),
      GameSession.init(),
      ChallengeAttempt.init(),
      Achievement.init(),
      LeaderboardEntry.init(),
    ]);
  });

  afterAll(async () => {
    // Clean up all test data generated during this run
    if (testUser1?._id) {
      await Promise.all([
        User.deleteMany({ email: new RegExp(`test_${testRunId}`) }),
        KnowledgeAssessment.deleteMany({ userId: testUser1._id }),
        GameSession.deleteMany({ userId: testUser1._id }),
        ChallengeAttempt.deleteMany({ sessionId: testSession1?._id }),
        Achievement.deleteMany({ userId: testUser1._id }),
        LeaderboardEntry.deleteMany({ userId: testUser1._id }),
      ]);
    }
    await disconnectDB();
  });

  describe('User Persistence & Constraints', () => {
    it('should successfully persist a new user and sanitize passwordHash in JSON', async () => {
      const hash = await bcrypt.hash('SecurePassword123!', 12);
      testUser1 = await User.create({
        username: `cadet_${testRunId}`,
        email: `test_${testRunId}@facility.local`,
        passwordHash: hash,
        role: 'player',
      });

      expect(testUser1._id).toBeDefined();
      expect(testUser1.role).toBe('player');
      expect(testUser1.createdAt).toBeDefined();

      const json = testUser1.toJSON();
      expect(json.passwordHash).toBeUndefined();
      expect(json.__v).toBeUndefined();
    });

    it('should enforce unique email constraint at database level', async () => {
      const duplicateUser = new User({
        username: `cadet_alt_${testRunId}`,
        email: `test_${testRunId}@facility.local`, // duplicate email
        passwordHash: '$2a$12$e8Y6/x3hK/eL4l89Z.fakehashlongerthan60charactersfortestvalidation',
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it('should enforce unique username constraint at database level', async () => {
      const duplicateUser = new User({
        username: `cadet_${testRunId}`, // duplicate username
        email: `alt_test_${testRunId}@facility.local`,
        passwordHash: '$2a$12$e8Y6/x3hK/eL4l89Z.fakehashlongerthan60charactersfortestvalidation',
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });
  });

  describe('KnowledgeAssessment Persistence', () => {
    it('should persist baseline assessment linked to user', async () => {
      const assessment = await KnowledgeAssessment.create({
        userId: testUser1._id,
        phishingConfidence: 4,
        passwordConfidence: 3,
        qrConfidence: 5,
        socialConfidence: 2,
        tutorialRequested: true,
      });

      expect(assessment._id).toBeDefined();
      expect(assessment.userId.toString()).toBe(testUser1._id.toString());
      expect(assessment.tutorialRequested).toBe(true);
    });

    it('should prevent duplicate assessment for the same user', async () => {
      const duplicateAssessment = new KnowledgeAssessment({
        userId: testUser1._id,
        phishingConfidence: 2,
        passwordConfidence: 2,
        qrConfidence: 2,
        socialConfidence: 2,
      });

      await expect(duplicateAssessment.save()).rejects.toThrow();
    });
  });

  describe('GameSession Persistence & State Machine', () => {
    it('should create session with default lives (3) and NOT_STARTED status', async () => {
      testSession1 = await GameSession.create({
        userId: testUser1._id,
        startTime: new Date(),
      });

      expect(testSession1.livesRemaining).toBe(3);
      expect(testSession1.currentScore).toBe(0);
      expect(testSession1.currentRoomIndex).toBe(1);
      expect(testSession1.status).toBe(GAME_STATUS.NOT_STARTED);
    });

    it('should transition session status from NOT_STARTED to IN_PROGRESS and update score/lives atomically', async () => {
      const updated = await GameSession.findByIdAndUpdate(
        testSession1._id,
        {
          $set: { status: GAME_STATUS.IN_PROGRESS, currentScore: 500 },
          $inc: { livesRemaining: -1 },
        },
        { new: true }
      );

      expect(updated.status).toBe(GAME_STATUS.IN_PROGRESS);
      expect(updated.currentScore).toBe(500);
      expect(updated.livesRemaining).toBe(2);
    });
  });

  describe('ChallengeAttempt Persistence & Indexing', () => {
    it('should log immutable attempt records linked to session', async () => {
      const attempt = await ChallengeAttempt.create({
        sessionId: testSession1._id,
        roomId: 'room-01-inbox',
        challengeId: 'ch-phish-01',
        actionTaken: 'ACTION_QUARANTINE',
        isCorrect: true,
        scoreDelta: 500,
        lifeDelta: 0,
        hintsUsed: 1,
        timeElapsedSeconds: 18,
        inspectedArtifacts: ['header_from', 'url_inspect'],
      });

      expect(attempt._id).toBeDefined();
      expect(attempt.sessionId.toString()).toBe(testSession1._id.toString());
      expect(attempt.hintsUsed).toBe(1);
      expect(attempt.inspectedArtifacts).toContain('url_inspect');
    });
  });

  describe('Achievement Persistence & Unique Badge Constraint', () => {
    it('should award achievement badge to user', async () => {
      const achievement = await Achievement.create({
        userId: testUser1._id,
        badgeCode: 'cyber_guardian',
        title: 'Cyber Guardian',
        description: 'Completed facility escape room',
      });

      expect(achievement._id).toBeDefined();
      expect(achievement.badgeCode).toBe('cyber_guardian');
    });

    it('should prevent awarding duplicate badgeCode to the same user', async () => {
      const duplicateAchievement = new Achievement({
        userId: testUser1._id,
        badgeCode: 'cyber_guardian',
        title: 'Cyber Guardian Duplicate',
        description: 'Should fail due to unique index',
      });

      await expect(duplicateAchievement.save()).rejects.toThrow();
    });
  });

  describe('LeaderboardEntry Sorting & Query Optimization', () => {
    it('should persist and sort leaderboard entries by score descending and duration ascending', async () => {
      const user2 = await User.create({
        username: `cadet2_${testRunId}`,
        email: `test2_${testRunId}@facility.local`,
        passwordHash: '$2a$12$e8Y6/x3hK/eL4l89Z.fakehashlongerthan60charactersfortestvalidation',
      });

      const session2 = await GameSession.create({
        userId: user2._id,
        status: GAME_STATUS.COMPLETED,
      });

      await LeaderboardEntry.create([
        {
          sessionId: testSession1._id,
          userId: testUser1._id,
          username: testUser1.username,
          finalScore: 8000,
          totalDurationSeconds: 600,
          accuracyPercentage: 90,
          livesRemaining: 2,
        },
        {
          sessionId: session2._id,
          userId: user2._id,
          username: user2.username,
          finalScore: 8000,
          totalDurationSeconds: 450, // Faster with same score -> should rank higher
          accuracyPercentage: 95,
          livesRemaining: 3,
        },
      ]);

      const rankings = await LeaderboardEntry.find({
        userId: { $in: [testUser1._id, user2._id] },
      }).sort({ finalScore: -1, totalDurationSeconds: 1 });

      expect(rankings.length).toBe(2);
      expect(rankings[0].username).toBe(user2.username); // Lower duration ranks higher on score tie
      expect(rankings[1].username).toBe(testUser1.username);

      // Cleanup user2
      await User.deleteOne({ _id: user2._id });
      await GameSession.deleteOne({ _id: session2._id });
      await LeaderboardEntry.deleteMany({ userId: user2._id });
    });
  });
});
