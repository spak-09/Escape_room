import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/db.js';
import { User } from '../../src/models/User.js';
import { GameSession } from '../../src/models/GameSession.js';
import { LeaderboardEntry } from '../../src/models/LeaderboardEntry.js';
import { DIFFICULTY_LEVELS } from '../../src/utils/constants.js';
import { findChallengeById } from '../../src/services/questionBankService.js';

describe('Assessment Difficulty Selection & Multi-Question Progression Integration', () => {
  const testRunId = Date.now();
  let userToken = '';
  let userId = '';

  beforeAll(async () => {
    await connectDB();
    await User.init();
    await GameSession.init();
    await LeaderboardEntry.init();

    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: `cadet_diff_${testRunId}`,
        email: `cadet_diff_${testRunId}@facility.local`,
        password: 'Password123!',
      });
    userToken = regRes.body.data.accessToken;
    userId = regRes.body.data.user._id;
  });

  afterAll(async () => {
    await Promise.all([
      User.deleteMany({ email: new RegExp(`cadet_diff_`) }),
      GameSession.deleteMany({ userId }),
      LeaderboardEntry.deleteMany({ userId }),
    ]);
    await disconnectDB();
  });

  describe('1. Difficulty Level Initialization & Validation', () => {
    it('should reject unknown difficulty levels with 400 INVALID_DIFFICULTY', async () => {
      const res = await request(app)
        .post('/api/v1/session/start')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ difficulty: 'nightmare' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_DIFFICULTY');
    });

    it('should initialize Beginner session with 1 question per room (5 total)', async () => {
      const res = await request(app)
        .post('/api/v1/session/start')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ difficulty: 'beginner', restart: true });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      const session = res.body.data.session;
      expect(session.difficulty).toBe('beginner');
      expect(session.currentRoomIndex).toBe(1);
      expect(session.currentChallengeIndex).toBe(0);

      const roomQuestions = session.roomQuestions;
      const rooms = ['room-01-inbox', 'room-02-vault', 'room-03-scanner', 'room-04-message', 'room-05-control'];

      for (const r of rooms) {
        expect(roomQuestions[r]).toBeDefined();
        expect(roomQuestions[r].length).toBe(1);
        const ch = findChallengeById(roomQuestions[r][0]);
        expect(ch.difficulty).toBe('beginner');
      }
    });

    it('should initialize Intermediate session with 3 questions per room (15 total)', async () => {
      const res = await request(app)
        .post('/api/v1/session/start')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ difficulty: 'intermediate', restart: true });

      expect(res.status).toBe(201);
      const session = res.body.data.session;
      expect(session.difficulty).toBe('intermediate');

      const roomQuestions = session.roomQuestions;
      const rooms = ['room-01-inbox', 'room-02-vault', 'room-03-scanner', 'room-04-message', 'room-05-control'];

      let totalQuestions = 0;
      for (const r of rooms) {
        expect(roomQuestions[r].length).toBe(3);
        totalQuestions += roomQuestions[r].length;

        // Ensure all questions are strictly intermediate
        for (const chId of roomQuestions[r]) {
          const ch = findChallengeById(chId);
          expect(ch.difficulty).toBe('intermediate');
        }

        // Ensure duplicate-free selection within room
        const uniqueSet = new Set(roomQuestions[r]);
        expect(uniqueSet.size).toBe(3);
      }
      expect(totalQuestions).toBe(15);
    });

    it('should initialize Expert session with 10 questions per room (50 total)', async () => {
      const res = await request(app)
        .post('/api/v1/session/start')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ difficulty: 'expert', restart: true });

      expect(res.status).toBe(201);
      const session = res.body.data.session;
      expect(session.difficulty).toBe('expert');

      const roomQuestions = session.roomQuestions;
      const rooms = ['room-01-inbox', 'room-02-vault', 'room-03-scanner', 'room-04-message', 'room-05-control'];

      let totalQuestions = 0;
      for (const r of rooms) {
        expect(roomQuestions[r].length).toBe(10);
        totalQuestions += roomQuestions[r].length;

        // Ensure all questions are strictly expert
        for (const chId of roomQuestions[r]) {
          const ch = findChallengeById(chId);
          expect(ch.difficulty).toBe('expert');
        }

        // Ensure duplicate-free selection within room
        const uniqueSet = new Set(roomQuestions[r]);
        expect(uniqueSet.size).toBe(10);
      }
      expect(totalQuestions).toBe(50);
    });
  });

  describe('2. Multi-Question In-Room Progression (Intermediate Run)', () => {
    let intermediateSession;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/v1/session/start')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ difficulty: 'intermediate', restart: true });
      intermediateSession = res.body.data.session;
    });

    it('should serve challenge 0 of Sector 01 upon entering room', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-01-inbox')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalChallengesInSector).toBe(3);
      expect(res.body.data.currentChallengeIndex).toBe(0);

      const expectedFirstChallengeId = intermediateSession.roomQuestions['room-01-inbox'][0];
      expect(res.body.data.challenge.challengeId).toBe(expectedFirstChallengeId);
    });

    it('should reject out-of-order submission for challenge 2 when challenge 0 is active', async () => {
      const thirdChallengeId = intermediateSession.roomQuestions['room-01-inbox'][2];

      const res = await request(app)
        .post(`/api/v1/challenges/${thirdChallengeId}/submit`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          sessionId: intermediateSession._id,
          actionId: 'ACTION_QUARANTINE_AITM',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('CHALLENGE_OUT_OF_ORDER');
    });

    it('should solve challenge 0: stay in Sector 01 and increment currentChallengeIndex to 1', async () => {
      const ch0Id = intermediateSession.roomQuestions['room-01-inbox'][0];
      const ch0Def = findChallengeById(ch0Id);

      const res = await request(app)
        .post(`/api/v1/challenges/${ch0Id}/submit`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          sessionId: intermediateSession._id,
          actionId: ch0Def.correctActionId,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isCorrect).toBe(true);
      expect(res.body.data.roomCompleted).toBe(false); // DOES NOT transition door!
      expect(res.body.data.escapeCompleted).toBe(false);
      expect(res.body.data.nextRoomIndex).toBe(1); // Stays in Room 1!
      expect(res.body.data.currentChallengeIndex).toBe(1);
    });

    it('should fetch room details now displaying challenge 1', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-01-inbox')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.currentChallengeIndex).toBe(1);

      const expectedSecondChallengeId = intermediateSession.roomQuestions['room-01-inbox'][1];
      expect(res.body.data.challenge.challengeId).toBe(expectedSecondChallengeId);
    });

    it('should solve challenge 1: stay in Sector 01 and increment currentChallengeIndex to 2', async () => {
      const ch1Id = intermediateSession.roomQuestions['room-01-inbox'][1];
      const ch1Def = findChallengeById(ch1Id);

      const res = await request(app)
        .post(`/api/v1/challenges/${ch1Id}/submit`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          sessionId: intermediateSession._id,
          actionId: ch1Def.correctActionId,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isCorrect).toBe(true);
      expect(res.body.data.roomCompleted).toBe(false);
      expect(res.body.data.currentChallengeIndex).toBe(2);
    });

    it('should solve challenge 2 (final in sector): complete room and unlock Sector 02', async () => {
      const ch2Id = intermediateSession.roomQuestions['room-01-inbox'][2];
      const ch2Def = findChallengeById(ch2Id);

      const res = await request(app)
        .post(`/api/v1/challenges/${ch2Id}/submit`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          sessionId: intermediateSession._id,
          actionId: ch2Def.correctActionId,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isCorrect).toBe(true);
      expect(res.body.data.roomCompleted).toBe(true); // Bulkhead door transition triggers!
      expect(res.body.data.nextRoomIndex).toBe(2);
      expect(res.body.data.currentChallengeIndex).toBe(0);
    });

    it('should permit entry to Sector 02 (The Vault) with challenge 0 of vault', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-02-vault')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.sectorNumber).toBe(2);
      expect(res.body.data.currentChallengeIndex).toBe(0);
      expect(res.body.data.totalChallengesInSector).toBe(3);

      const expectedVaultCh0 = intermediateSession.roomQuestions['room-02-vault'][0];
      expect(res.body.data.challenge.challengeId).toBe(expectedVaultCh0);
    });
  });

  describe('3. Leaderboard Filtering by Difficulty & Normalized Scoring', () => {
    it('GET /api/v1/leaderboard should accept difficulty query param', async () => {
      const res = await request(app).get('/api/v1/leaderboard?difficulty=intermediate');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.difficulty).toBe('intermediate');
      expect(Array.isArray(res.body.data.leaderboard)).toBe(true);
    });
  });
});
