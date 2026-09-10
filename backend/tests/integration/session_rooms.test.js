import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/db.js';
import { User } from '../../src/models/User.js';
import { GameSession } from '../../src/models/GameSession.js';
import { GAME_STATUS } from '../../src/utils/constants.js';

describe('Phase B4: Game Session State & Room Access Integration', () => {
  const testRunId = Date.now();
  let user1Token = '';
  let user2Token = '';
  let user1Id = '';
  let user2Id = '';
  let activeSessionId = '';

  beforeAll(async () => {
    await connectDB();
    await User.init();
    await GameSession.init();

    // Register User 1
    const res1 = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: `cadet_sess_1_${testRunId}`,
        email: `cadet_sess_1_${testRunId}@facility.local`,
        password: 'Password123!',
      });
    user1Token = res1.body.data.accessToken;
    user1Id = res1.body.data.user._id;

    // Register User 2
    const res2 = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: `cadet_sess_2_${testRunId}`,
        email: `cadet_sess_2_${testRunId}@facility.local`,
        password: 'Password123!',
      });
    user2Token = res2.body.data.accessToken;
    user2Id = res2.body.data.user._id;
  });

  afterAll(async () => {
    await Promise.all([
      User.deleteMany({ email: new RegExp(`cadet_sess_`) }),
      GameSession.deleteMany({ userId: { $in: [user1Id, user2Id] } }),
    ]);
    await disconnectDB();
  });

  describe('Session Lifecycle & State Machine', () => {
    it('GET /api/v1/session/active should return 404 before session is started', async () => {
      const res = await request(app)
        .get('/api/v1/session/active')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ACTIVE_SESSION_NOT_FOUND');
    });

    it('POST /api/v1/session/start should initialize new session with 3 lives and score 0', async () => {
      const res = await request(app)
        .post('/api/v1/session/start')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.session.livesRemaining).toBe(3);
      expect(res.body.data.session.currentScore).toBe(0);
      expect(res.body.data.session.currentRoomIndex).toBe(1);
      expect(res.body.data.session.status).toBe(GAME_STATUS.IN_PROGRESS);
      expect(res.body.data.isResumed).toBe(false);

      activeSessionId = res.body.data.session._id;
    });

    it('POST /api/v1/session/start called again should resume existing active session (200 OK)', async () => {
      const res = await request(app)
        .post('/api/v1/session/start')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isResumed).toBe(true);
      expect(res.body.data.session._id).toBe(activeSessionId);
    });

    it('GET /api/v1/session/active should retrieve the active playthrough', async () => {
      const res = await request(app)
        .get('/api/v1/session/active')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.session._id).toBe(activeSessionId);
      expect(res.body.data.session.livesRemaining).toBe(3);
    });

    it('User isolation: User 2 cannot access or resume User 1 active session', async () => {
      const res = await request(app)
        .get('/api/v1/session/active')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('ACTIVE_SESSION_NOT_FOUND');
    });
  });

  describe('Room Access Foundation & Sequential Restrictions', () => {
    it('should reject room access if user has no active session (403 NO_ACTIVE_SESSION)', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-01-inbox')
        .set('Authorization', `Bearer ${user2Token}`); // User 2 has no active session

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NO_ACTIVE_SESSION');
    });

    it('should permit access to active Sector 01 for User 1', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-01-inbox')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sectorNumber).toBe(1);
      expect(res.body.data.title).toBe('The Inbox');
      expect(res.body.data.topic).toBe('phishing');
      expect(res.body.data.challenge).toBeDefined();
      expect(res.body.data.challenge.challengeId).toBe('ch-phish-01');
      expect(res.body.data.challenge.availableActions.length).toBeGreaterThanOrEqual(2);
    });

    it('should enforce sequential progression: reject Room 02 access while Room 01 is active (403 PREREQUISITES_INCOMPLETE)', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-02-vault')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PREREQUISITES_INCOMPLETE');
      expect(res.body.error.message).toContain('Sector 02 is sealed');
    });

    it('should enforce sequential progression: reject Room 05 access (403 PREREQUISITES_INCOMPLETE)', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-05-control')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PREREQUISITES_INCOMPLETE');
    });

    it('should return 404 for nonexistent room ID', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/nonexistent-room')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('ROOM_NOT_FOUND');
    });
  });

  describe('Answer Secrecy & Data Sanitization', () => {
    it('room response MUST NOT contain correctActionId, hiddenIoCs, or explanations', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-01-inbox')
        .set('Authorization', `Bearer ${user1Token}`);

      const responseString = JSON.stringify(res.body);

      // Verify server-side secret keys are completely absent
      expect(res.body.data.challenge.correctActionId).toBeUndefined();
      expect(res.body.data.challenge.hiddenIoCs).toBeUndefined();
      expect(res.body.data.challenge.explanation).toBeUndefined();
      expect(res.body.data.challenge.hints).toBeUndefined();

      // String-level audit against known private manifest keywords
      expect(responseString).not.toContain('correctActionId');
      expect(responseString).not.toContain('hiddenIoCs');
      expect(responseString).not.toContain('typosquatted_domain'); // Secret IoC
      expect(responseString).not.toContain('attacker-controlled'); // Private explanation text
    });
  });

  describe('Session Termination & Locking Rules', () => {
    it('POST /api/v1/session/abandon should transition session to ABANDONED', async () => {
      const res = await request(app)
        .post('/api/v1/session/abandon')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.session.status).toBe(GAME_STATUS.ABANDONED);
      expect(res.body.data.session.completionTime).toBeDefined();
    });

    it('subsequent room access should be rejected after session is abandoned (403 NO_ACTIVE_SESSION)', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-01-inbox')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('NO_ACTIVE_SESSION');
    });

    it('abandoning an already closed session should return 404 or 409', async () => {
      const res = await request(app)
        .post('/api/v1/session/abandon')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('ACTIVE_SESSION_NOT_FOUND');
    });
  });
});
