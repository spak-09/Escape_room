import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/db.js';
import { User } from '../../src/models/User.js';
import { GameSession } from '../../src/models/GameSession.js';
import { ChallengeAttempt } from '../../src/models/ChallengeAttempt.js';
import { Achievement } from '../../src/models/Achievement.js';
import { evaluateAndAwardAchievements, BADGE_DEFINITIONS } from '../../src/services/achievementService.js';
import { GAME_STATUS } from '../../src/utils/constants.js';

describe('Phase B8: Cybersecurity Performance Reports & Achievements Integration', () => {
  const testRunId = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  let userAToken = '';
  let userBToken = '';
  let userAId = '';
  let userBId = '';
  const testSessionIds = [];

  beforeAll(async () => {
    await connectDB();
    await User.init();
    await GameSession.init();
    await ChallengeAttempt.init();
    await Achievement.init();

    // Register User A
    const resA = await request(app).post('/api/v1/auth/register').send({
      username: `agent_alpha_${testRunId}`,
      email: `alpha_${testRunId}@facility.local`,
      password: 'AlphaPassword123!',
    });
    userAToken = resA.body.data.accessToken;
    userAId = resA.body.data.user._id;

    // Register User B
    const resB = await request(app).post('/api/v1/auth/register').send({
      username: `agent_bravo_${testRunId}`,
      email: `bravo_${testRunId}@facility.local`,
      password: 'BravoPassword123!',
    });
    userBToken = resB.body.data.accessToken;
    userBId = resB.body.data.user._id;
  });

  afterAll(async () => {
    await Promise.all([
      User.deleteMany({ email: new RegExp(`(alpha|bravo)_${testRunId}`) }),
      GameSession.deleteMany({ userId: { $in: [userAId, userBId] } }),
      ChallengeAttempt.deleteMany({ sessionId: { $in: testSessionIds } }),
      Achievement.deleteMany({ userId: { $in: [userAId, userBId] } }),
    ]);
    await disconnectDB();
  });

  describe('Route Access & Input Validation', () => {
    it('GET /api/v1/reports (root) should return 501 stub', async () => {
      const res = await request(app).get('/api/v1/reports');

      expect(res.status).toBe(501);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PHASE_NOT_IMPLEMENTED');
      expect(res.body.error.message).toContain('Phase 8');
    });

    it('should reject unauthenticated request to /api/v1/reports/:sessionId (401 TOKEN_MISSING)', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/v1/reports/${fakeId}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('TOKEN_MISSING');
    });

    it('should return 404 SESSION_NOT_FOUND when session does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/v1/reports/${nonExistentId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('SESSION_NOT_FOUND');
    });
  });

  describe('Session Status Gating & IDOR Ownership Protection', () => {
    it('should reject report generation for IN_PROGRESS session (400 REPORT_NOT_AVAILABLE)', async () => {
      const inProgressSession = await GameSession.create({
        userId: userAId,
        currentRoomIndex: 2,
        status: GAME_STATUS.IN_PROGRESS,
        livesRemaining: 3,
        currentScore: 1200,
        startTime: new Date(),
      });
      testSessionIds.push(inProgressSession._id);

      const res = await request(app)
        .get(`/api/v1/reports/${inProgressSession._id}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('REPORT_NOT_AVAILABLE');
      expect(res.body.error.message).toContain('IN_PROGRESS');
    });

    it('should reject report generation for FAILED session (400 REPORT_NOT_AVAILABLE)', async () => {
      const failedSession = await GameSession.create({
        userId: userAId,
        currentRoomIndex: 3,
        status: GAME_STATUS.FAILED,
        livesRemaining: 0,
        currentScore: 500,
        startTime: new Date(Date.now() - 300000),
        completionTime: new Date(),
      });
      testSessionIds.push(failedSession._id);

      const res = await request(app)
        .get(`/api/v1/reports/${failedSession._id}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('REPORT_NOT_AVAILABLE');
      expect(res.body.error.message).toContain('FAILED');
    });

    it('IDOR Protection: should reject User B accessing User A completed report (403 FORBIDDEN_REPORT_ACCESS)', async () => {
      const completedSession = await GameSession.create({
        userId: userAId,
        currentRoomIndex: 5,
        status: GAME_STATUS.COMPLETED,
        livesRemaining: 2,
        currentScore: 8500,
        startTime: new Date(Date.now() - 600000),
        completionTime: new Date(),
      });
      testSessionIds.push(completedSession._id);

      const res = await request(app)
        .get(`/api/v1/reports/${completedSession._id}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN_REPORT_ACCESS');
    });
  });

  describe('Authoritative Report Compilation & Topic Mastery Calculations', () => {
    it('should calculate accurate topic mastery, identify strongest/weakest skills, and provide personalized advice', async () => {
      const startTime = new Date(Date.now() - 720000); // 12 minutes ago
      const completionTime = new Date();

      const session = await GameSession.create({
        userId: userAId,
        currentRoomIndex: 5,
        status: GAME_STATUS.COMPLETED,
        livesRemaining: 2,
        currentScore: 9200,
        hintsUsed: ['hint-phish-1'],
        startTime,
        completionTime,
      });
      testSessionIds.push(session._id);

      // Create attempts:
      // Room 01 (phishing): 1 attempt, 1 correct, 1 hint -> 100% mastery, 1 hint
      await ChallengeAttempt.create({
        sessionId: session._id,
        roomId: 'room-01-inbox',
        challengeId: 'ch-phish-01',
        actionTaken: 'ACTION_QUARANTINE',
        isCorrect: true,
        hintsUsed: 1,
        lifeDelta: 0,
        scoreDelta: 1200,
      });

      // Room 02 (password_security): 2 attempts (1 mistake, 1 correct) -> 50% mastery
      await ChallengeAttempt.create({
        sessionId: session._id,
        roomId: 'room-02-vault',
        challengeId: 'ch-vault-01',
        actionTaken: 'ACTION_REUSE_PASSWORD',
        isCorrect: false,
        hintsUsed: 0,
        lifeDelta: -1,
        scoreDelta: -150,
      });
      await ChallengeAttempt.create({
        sessionId: session._id,
        roomId: 'room-02-vault',
        challengeId: 'ch-vault-01',
        actionTaken: 'ACTION_MFA_FIDO2',
        isCorrect: true,
        hintsUsed: 0,
        lifeDelta: 0,
        scoreDelta: 1400,
      });

      // Room 03 (qr_security): 1 attempt, 1 correct, 0 hints -> 100% mastery, 0 hints
      await ChallengeAttempt.create({
        sessionId: session._id,
        roomId: 'room-03-scanner',
        challengeId: 'ch-qr-01',
        actionTaken: 'ACTION_PEEL_AND_REPORT',
        isCorrect: true,
        hintsUsed: 0,
        lifeDelta: 0,
        scoreDelta: 1500,
      });

      // Room 04 (social_engineering): 1 attempt, 1 correct, 0 hints -> 100% mastery, 0 hints
      await ChallengeAttempt.create({
        sessionId: session._id,
        roomId: 'room-04-message',
        challengeId: 'ch-msg-01',
        actionTaken: 'ACTION_VERIFY_OOB',
        isCorrect: true,
        hintsUsed: 0,
        lifeDelta: 0,
        scoreDelta: 1600,
      });

      // Room 05 (multi_threat): 4 attempts, 4 correct, 0 hints -> 100% mastery, 0 hints
      for (const chId of ['ch-ctrl-01', 'ch-ctrl-02', 'ch-ctrl-03', 'ch-ctrl-04']) {
        await ChallengeAttempt.create({
          sessionId: session._id,
          roomId: 'room-05-control',
          challengeId: chId,
          actionTaken: 'ACTION_CONTAIN',
          isCorrect: true,
          hintsUsed: 0,
          lifeDelta: 0,
          scoreDelta: 500,
        });
      }

      // Add badge
      await Achievement.create({
        userId: userAId,
        badgeCode: 'CYBER_GUARDIAN',
        title: 'Cyber Guardian',
        description: 'Neutralized all threats',
        earnedAt: new Date(),
      });

      const res = await request(app)
        .get(`/api/v1/reports/${session._id}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const report = res.body.data;
      expect(report.sessionId).toBe(session._id.toString());
      expect(report.userId).toBe(userAId.toString());
      expect(report.status).toBe('COMPLETED');
      expect(report.overallScore).toBe(9200);
      expect(report.livesRemaining).toBe(2);

      // Total attempts = 1 + 2 + 1 + 1 + 4 = 9. Correct = 8. Mistakes = 1.
      // Accuracy = Math.round(8 / 9 * 100) = 89%
      expect(report.accuracy).toBe(89);
      expect(report.mistakes).toBe(1);
      expect(report.challengesCompleted).toBe(8);
      expect(report.hintsUsed).toBe(1);
      expect(report.totalDurationSeconds).toBeGreaterThanOrEqual(700);

      // Topic Mastery breakdown:
      // password_security: 1 correct / 2 total = 50%
      // phishing: 1 / 1 = 100%
      // qr_security: 1 / 1 = 100%
      // social_engineering: 1 / 1 = 100%
      // multi_threat: 4 / 4 = 100%
      expect(report.topicMastery.password_security).toBe(50);
      expect(report.topicMastery.phishing).toBe(100);
      expect(report.topicMastery.qr_security).toBe(100);
      expect(report.topicMastery.social_engineering).toBe(100);
      expect(report.topicMastery.multi_threat).toBe(100);

      // Weakest skill should be password_security (50%)
      expect(report.weakestSkill).toBe('password_security');
      expect(report.primaryVulnerability).toBe('password_security');
      expect(report.personalizedRecommendation).toContain('passphrases');

      // Strongest skill should be among the 100% topics with 0 hints (not phishing which used 1 hint)
      expect(['qr_security', 'social_engineering', 'multi_threat']).toContain(report.strongestSkill);

      // Badges
      expect(report.badgesEarned).toContain('CYBER_GUARDIAN');
    });
  });

  describe('Achievement Service & Deduping Integrity', () => {
    it('should evaluate and award badges upon session completion', async () => {
      const session = await GameSession.create({
        userId: userAId,
        currentRoomIndex: 5,
        status: GAME_STATUS.COMPLETED,
        livesRemaining: 3, // Full lives -> ZERO_MISTAKE_ESCAPE
        currentScore: 10500,
        hintsUsed: [],
        startTime: new Date(Date.now() - 400000),
        completionTime: new Date(),
      });
      testSessionIds.push(session._id);

      // Flawless room attempts across all 5 sectors
      const rooms = ['room-01-inbox', 'room-02-vault', 'room-03-scanner', 'room-04-message', 'room-05-control'];
      for (const roomId of rooms) {
        await ChallengeAttempt.create({
          sessionId: session._id,
          roomId,
          challengeId: `ch-${roomId}`,
          actionTaken: 'ACTION_SOLVE',
          isCorrect: true,
          hintsUsed: 0,
        });
      }

      const awardedBadges = await evaluateAndAwardAchievements(session);

      expect(awardedBadges).toContain(BADGE_DEFINITIONS.CYBER_GUARDIAN.badgeCode);
      expect(awardedBadges).toContain(BADGE_DEFINITIONS.ZERO_MISTAKE_ESCAPE.badgeCode);
      expect(awardedBadges).toContain(BADGE_DEFINITIONS.PHISHING_EXPERT.badgeCode);
      expect(awardedBadges).toContain(BADGE_DEFINITIONS.SECURE_AUTHENTICATOR.badgeCode);
      expect(awardedBadges).toContain(BADGE_DEFINITIONS.QR_DETECTIVE.badgeCode);
      expect(awardedBadges).toContain(BADGE_DEFINITIONS.SOCIAL_SHIELD.badgeCode);
      expect(awardedBadges).toContain(BADGE_DEFINITIONS.MULTI_THREAT_MASTER.badgeCode);

      // Verify records in DB
      const userAchievements = await Achievement.find({ userId: userAId });
      expect(userAchievements.length).toBeGreaterThanOrEqual(7);

      // Calling again should not duplicate
      const reAwarded = await evaluateAndAwardAchievements(session);
      expect(reAwarded.length).toBe(7);

      const countAfter = await Achievement.countDocuments({ userId: userAId });
      expect(countAfter).toBe(userAchievements.length);
    });

    it('should not award achievements for incomplete sessions', async () => {
      const incompleteSession = await GameSession.create({
        userId: userBId,
        currentRoomIndex: 3,
        status: GAME_STATUS.IN_PROGRESS,
        livesRemaining: 3,
        currentScore: 2000,
      });
      testSessionIds.push(incompleteSession._id);

      const awarded = await evaluateAndAwardAchievements(incompleteSession);
      expect(awarded).toEqual([]);

      const count = await Achievement.countDocuments({ userId: userBId });
      expect(count).toBe(0);
    });
  });
});
