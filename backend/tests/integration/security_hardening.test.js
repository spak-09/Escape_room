import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { app } from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/db.js';
import { User } from '../../src/models/User.js';
import { GameSession } from '../../src/models/GameSession.js';
import { ChallengeAttempt } from '../../src/models/ChallengeAttempt.js';
import { LeaderboardEntry } from '../../src/models/LeaderboardEntry.js';
import { env } from '../../src/config/env.js';
import { GAME_STATUS } from '../../src/utils/constants.js';

describe('Phase B10: Security Hardening & Negative Testing Integration', () => {
  const testRunId = `${Date.now().toString().slice(-6)}_${Math.floor(Math.random() * 1000)}`;
  let userAToken = '';
  let userBToken = '';
  let userAId = '';
  let userBId = '';
  let userASessionId = '';
  const testSessionIds = [];

  beforeAll(async () => {
    await connectDB();
    await User.init();
    await GameSession.init();
    await ChallengeAttempt.init();
    await LeaderboardEntry.init();

    // Register User A
    const resA = await request(app).post('/api/v1/auth/register').send({
      username: `sec_a_${testRunId}`,
      email: `sec_a_${testRunId}@escape.local`,
      password: 'Password123!Secure',
    });
    userAToken = resA.body.data.accessToken;
    userAId = resA.body.data.user._id;

    // Register User B
    const resB = await request(app).post('/api/v1/auth/register').send({
      username: `sec_b_${testRunId}`,
      email: `sec_b_${testRunId}@escape.local`,
      password: 'Password123!Secure',
    });
    userBToken = resB.body.data.accessToken;
    userBId = resB.body.data.user._id;

    // Start User A session
    const sessRes = await request(app)
      .post('/api/v1/session/start')
      .set('Authorization', `Bearer ${userAToken}`);
    userASessionId = sessRes.body.data.session._id;
    testSessionIds.push(userASessionId);
  });

  afterAll(async () => {
    const userIds = [userAId, userBId].filter(Boolean);
    await Promise.all([
      User.deleteMany({ email: new RegExp(`sec_(a|b)_${testRunId}`) }),
      GameSession.deleteMany({ userId: { $in: userIds } }),
      ChallengeAttempt.deleteMany({ sessionId: { $in: testSessionIds } }),
      LeaderboardEntry.deleteMany({ userId: { $in: userIds } }),
    ]);
    await disconnectDB();
  });

  describe('1. IDOR & Cross-User Authorization Guarding', () => {
    it('User B cannot submit decisions to User A session (403 FORBIDDEN_SESSION_ACCESS)', async () => {
      const res = await request(app)
        .post('/api/v1/challenges/ch-phish-01/submit')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          sessionId: userASessionId,
          actionId: 'ACTION_QUARANTINE',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN_SESSION_ACCESS');
    });

    it('User B cannot request hints for User A session (403 FORBIDDEN_SESSION_ACCESS)', async () => {
      const res = await request(app)
        .post('/api/v1/challenges/ch-phish-01/hint')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          sessionId: userASessionId,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN_SESSION_ACCESS');
    });

    it('User B cannot access completed report belonging to User A (403 FORBIDDEN_REPORT_ACCESS)', async () => {
      const completedSession = await GameSession.create({
        userId: userAId,
        currentRoomIndex: 5,
        status: GAME_STATUS.COMPLETED,
        livesRemaining: 3,
        currentScore: 9000,
        startTime: new Date(Date.now() - 300000),
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

  describe('2. Score & Life Server-Authority (Anti-Tampering)', () => {
    it('Client cannot inject arbitrary score or lives in challenge submissions', async () => {
      const res = await request(app)
        .post('/api/v1/challenges/ch-phish-01/submit')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          sessionId: userASessionId,
          actionId: 'ACTION_QUARANTINE',
          currentScore: 999999, // Injected spoofed score
          livesRemaining: 99, // Injected spoofed lives
          status: 'COMPLETED', // Injected spoofed status
          finalScore: 999999,
        });

      expect(res.status).toBe(200);
      // Authoritative score calculation overrides any injected client body
      expect(res.body.data.currentScore).toBeLessThan(5000);
      expect(res.body.data.livesRemaining).toBe(3);
      expect(res.body.data.roomCompleted).toBe(true);
    });

    it('No API endpoints exist for client to set score or lives directly (404 ROUTE_NOT_FOUND)', async () => {
      const putRes = await request(app)
        .put('/api/v1/session/score')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ score: 999999 });
      expect(putRes.status).toBe(404);

      const patchRes = await request(app)
        .patch('/api/v1/session/lives')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ lives: 10 });
      expect(patchRes.status).toBe(404);
    });
  });

  describe('3. Sequential Progression & Room Skipping Prevention', () => {
    it('Direct access to locked Sector 03 is blocked when player is on Sector 02 (403 PREREQUISITES_INCOMPLETE)', async () => {
      // User A is currently on Room 02 (completed Room 01 in previous test)
      const res = await request(app)
        .get('/api/v1/rooms/room-03-scanner')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PREREQUISITES_INCOMPLETE');
    });

    it('Direct access to Sector 05 is blocked when player is on Sector 02 (403 PREREQUISITES_INCOMPLETE)', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-05-control')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PREREQUISITES_INCOMPLETE');
    });

    it('Submission to Sector 05 challenge is blocked when sector is locked (403 PREREQUISITES_INCOMPLETE)', async () => {
      const res = await request(app)
        .post('/api/v1/challenges/ch-ctrl-01/submit')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          sessionId: userASessionId,
          actionId: 'ACTION_TRIAGE_CONTAINMENT',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PREREQUISITES_INCOMPLETE');
    });
  });

  describe('4. Replay & Duplicate Submission Defense', () => {
    it('Submitting already completed challenge returns 409 CHALLENGE_ALREADY_COMPLETED', async () => {
      // ch-phish-01 was completed in earlier test
      const res = await request(app)
        .post('/api/v1/challenges/ch-phish-01/submit')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          sessionId: userASessionId,
          actionId: 'ACTION_QUARANTINE',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CHALLENGE_ALREADY_COMPLETED');
    });

    it('Submitting actions to FAILED session is rejected (409 SESSION_LOCKED)', async () => {
      const failedSession = await GameSession.create({
        userId: userBId,
        currentRoomIndex: 2,
        status: GAME_STATUS.FAILED,
        livesRemaining: 0,
        currentScore: 500,
      });
      testSessionIds.push(failedSession._id);

      const res = await request(app)
        .post('/api/v1/challenges/ch-phish-01/submit')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          sessionId: failedSession._id,
          actionId: 'ACTION_QUARANTINE',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('SESSION_LOCKED');
    });

    it('Submitting actions to COMPLETED session is rejected (409 SESSION_LOCKED)', async () => {
      const completedSession = await GameSession.create({
        userId: userBId,
        currentRoomIndex: 5,
        status: GAME_STATUS.COMPLETED,
        livesRemaining: 2,
        currentScore: 8000,
      });
      testSessionIds.push(completedSession._id);

      const res = await request(app)
        .post('/api/v1/challenges/ch-ctrl-01/submit')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          sessionId: completedSession._id,
          actionId: 'ACTION_TRIAGE_CONTAINMENT',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('SESSION_LOCKED');
    });
  });

  describe('5. JWT & Authentication Negative Security', () => {
    it('Rejects malformed JWT token (401 TOKEN_INVALID)', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer malformed.invalid.token');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('TOKEN_INVALID');
    });

    it('Rejects expired JWT access token (401 TOKEN_EXPIRED)', async () => {
      const expiredToken = jwt.sign(
        { userId: userAId, username: 'test', role: 'player' },
        env.JWT_SECRET,
        { expiresIn: '-1s' }
      );

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('TOKEN_EXPIRED');
    });

    it('Rejects tampered JWT signature (401 TOKEN_INVALID)', async () => {
      const tamperedToken = jwt.sign(
        { userId: userAId, username: 'test', role: 'admin' },
        'wrong_tampered_secret_key_123456789012'
      );

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('TOKEN_INVALID');
    });
  });

  describe('6. Input Validation, NoSQL Injection & Oversized Payloads', () => {
    it('Rejects NoSQL injection operator objects in login payload (400 VALIDATION_ERROR)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: { $gt: '' },
          password: { $gt: '' },
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('Rejects out-of-range assessment confidence values (400 VALIDATION_ERROR)', async () => {
      const res = await request(app)
        .post('/api/v1/assessment')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          phishingConfidence: 99, // Allowed: 1-5
          passwordConfidence: 0,
          qrConfidence: -5,
          socialConfidence: 3,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('Rejects oversized request body exceeding 10kb (413 or 400)', async () => {
      const largeString = 'A'.repeat(15 * 1024); // 15kb
      const res = await request(app)
        .post('/api/v1/challenges/ch-phish-01/submit')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          sessionId: userASessionId,
          actionId: 'ACTION_QUARANTINE',
          payload: largeString,
        });

      // express.json({ limit: '10kb' }) rejects payloads > 10kb
      expect([400, 413]).toContain(res.status);
    });
  });

  describe('7. Answer Key Secrecy & Data Sanitization', () => {
    it('Room metadata never exposes correctActionId, hiddenIoCs, or private explanations', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-01-inbox')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      const challenge = res.body.data.challenge;

      expect(challenge.correctActionId).toBeUndefined();
      expect(challenge.hiddenIoCs).toBeUndefined();
      expect(challenge.explanation).toBeUndefined();
      expect(challenge.hints).toBeUndefined();
    });
  });
});
