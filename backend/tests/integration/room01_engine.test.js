import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/db.js';
import { User } from '../../src/models/User.js';
import { GameSession } from '../../src/models/GameSession.js';
import { ChallengeAttempt } from '../../src/models/ChallengeAttempt.js';
import { KnowledgeAssessment } from '../../src/models/KnowledgeAssessment.js';
import { GAME_STATUS } from '../../src/utils/constants.js';

describe('Phase B6: Room 01 (The Inbox) Backend Engine Lifecycle Integration', () => {
  const testRunId = Date.now();
  let user1Token = '';
  let user2Token = '';
  let user1Id = '';
  let user2Id = '';
  let activeSessionId = '';
  const challengeId = 'ch-phish-01';

  beforeAll(async () => {
    await connectDB();
    await User.init();
    await GameSession.init();
    await ChallengeAttempt.init();
    await KnowledgeAssessment.init();

    // Register User 1 (Cadet 1)
    const res1 = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: `cadet_r1_1_${testRunId}`,
        email: `cadet_r1_1_${testRunId}@facility.local`,
        password: 'Password123!',
      });
    user1Token = res1.body.data.accessToken;
    user1Id = res1.body.data.user._id;

    // Cadet 1 baseline assessment (Phishing confidence = 4)
    await request(app)
      .post('/api/v1/assessment')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        phishingConfidence: 4,
        passwordConfidence: 3,
        qrConfidence: 3,
        socialConfidence: 3,
      });

    // Register User 2 (Attacker / Unauthorized Cadet)
    const res2 = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: `cadet_r1_2_${testRunId}`,
        email: `cadet_r1_2_${testRunId}@facility.local`,
        password: 'Password123!',
      });
    user2Token = res2.body.data.accessToken;
    user2Id = res2.body.data.user._id;

    // Start active playthrough for User 1
    const sessionRes = await request(app)
      .post('/api/v1/session/start')
      .set('Authorization', `Bearer ${user1Token}`);
    activeSessionId = sessionRes.body.data.session._id;
  });

  afterAll(async () => {
    await Promise.all([
      User.deleteMany({ email: new RegExp(`cadet_r1_`) }),
      GameSession.deleteMany({ userId: { $in: [user1Id, user2Id] } }),
      ChallengeAttempt.deleteMany({ sessionId: activeSessionId }),
      KnowledgeAssessment.deleteMany({ userId: { $in: [user1Id, user2Id] } }),
    ]);
    await disconnectDB();
  });

  describe('Hints Lifecycle & Tradeoffs', () => {
    it('POST /api/v1/challenges/:id/hint should reveal clue and deduct 75 points', async () => {
      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/hint`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ sessionId: activeSessionId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hint).toBeDefined();
      expect(res.body.data.scorePenaltyApplied).toBe(75);

      // Verify atomic DB persistence of hint
      const session = await GameSession.findById(activeSessionId);
      expect(session.hintsUsed.length).toBe(1);
    });

    it('Ownership guard: User 2 cannot request hints on User 1 session (403 FORBIDDEN_SESSION_ACCESS)', async () => {
      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/hint`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ sessionId: activeSessionId });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN_SESSION_ACCESS');
    });
  });

  describe('Incorrect Decisions & Adaptive Consequences', () => {
    it('should deduct a life, log attempt, and trigger 5-part educational intervention', async () => {
      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/submit`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          sessionId: activeSessionId,
          actionId: 'ACTION_CLICK_LINK', // Dangerous action
          inspectedArtifacts: [],
          timeElapsedSeconds: 20,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isCorrect).toBe(false);
      expect(res.body.data.lifeDelta).toBe(-1);
      expect(res.body.data.livesRemaining).toBe(2);
      expect(res.body.data.gameOver).toBe(false);

      // Verify 5-part educational payload
      const intervention = res.body.data.intervention;
      expect(intervention).toBeDefined();
      expect(intervention.type).toBe('CONTEXTUAL_EXPLANATION');
      expect(intervention.payload.whatHappened).toBeDefined();
      expect(intervention.payload.evidence).toBeDefined();
      expect(intervention.payload.whyDangerous).toBeDefined();
      expect(intervention.payload.correctAction).toBeDefined();
      expect(intervention.payload.securityTip).toBeDefined();

      // Verify atomic persistence in DB
      const session = await GameSession.findById(activeSessionId);
      expect(session.livesRemaining).toBe(2);

      const attempt = await ChallengeAttempt.findOne({
        sessionId: activeSessionId,
        challengeId,
        isCorrect: false,
      });
      expect(attempt).toBeDefined();
      expect(attempt.lifeDelta).toBe(-1);
    });
  });

  describe('Correct Decisions & Progression', () => {
    it('should award score, grant investigation bonus, and unlock Sector 02', async () => {
      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/submit`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          sessionId: activeSessionId,
          actionId: 'ACTION_QUARANTINE', // Correct defensive action
          inspectedArtifacts: ['url_inspect', 'header_return_path'],
          timeElapsedSeconds: 15,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isCorrect).toBe(true);
      expect(res.body.data.scoreDelta).toBeGreaterThanOrEqual(50);
      expect(res.body.data.investigationBonusAwarded).toBe(true);
      expect(res.body.data.roomCompleted).toBe(true);
      expect(res.body.data.nextRoomIndex).toBe(2); // Unlocks Room 02

      // Verify DB persistence of progression
      const session = await GameSession.findById(activeSessionId);
      expect(session.currentRoomIndex).toBe(2);
    });

    it('Sequential Progression Verification: User 1 can now access Sector 02', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-02-vault')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('The Vault');
    });

    it('Anti-Replay: should reject duplicate completion of already solved challenge (409 CHALLENGE_ALREADY_COMPLETED)', async () => {
      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/submit`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          sessionId: activeSessionId,
          actionId: 'ACTION_QUARANTINE',
          inspectedArtifacts: [],
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CHALLENGE_ALREADY_COMPLETED');
    });
  });

  describe('Game Over & Terminal State Locking', () => {
    let failSessionId = '';

    beforeAll(async () => {
      // Create a fresh session for testing zero lives condition
      const res = await GameSession.create({
        userId: user1Id,
        currentRoomIndex: 1,
        livesRemaining: 1, // 1 life remaining
        status: GAME_STATUS.IN_PROGRESS,
      });
      failSessionId = res._id;
    });

    it('should trigger game over (LOCKDOWN_BREACH) when lives reach 0', async () => {
      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/submit`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          sessionId: failSessionId,
          actionId: 'ACTION_CLICK_LINK', // Wrong action -> drops from 1 to 0
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isCorrect).toBe(false);
      expect(res.body.data.livesRemaining).toBe(0);
      expect(res.body.data.gameOver).toBe(true);
      expect(res.body.data.reason).toBe('LOCKDOWN_BREACH');

      // Verify status in DB became FAILED
      const session = await GameSession.findById(failSessionId);
      expect(session.status).toBe(GAME_STATUS.FAILED);
      expect(session.completionTime).toBeDefined();
    });

    it('should reject further submissions to failed session (409 SESSION_LOCKED)', async () => {
      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/submit`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          sessionId: failSessionId,
          actionId: 'ACTION_QUARANTINE',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('SESSION_LOCKED');
    });
  });
});
