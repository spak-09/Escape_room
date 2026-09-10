import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/db.js';
import { User } from '../../src/models/User.js';
import { GameSession } from '../../src/models/GameSession.js';
import { ChallengeAttempt } from '../../src/models/ChallengeAttempt.js';
import { Achievement } from '../../src/models/Achievement.js';
import { LeaderboardEntry } from '../../src/models/LeaderboardEntry.js';
import { GAME_STATUS } from '../../src/utils/constants.js';

describe('Phase B9: Player Dashboard & Verified Leaderboard Integration', () => {
  const testRunId = `${Date.now().toString().slice(-6)}_${Math.floor(Math.random() * 1000)}`;
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
    await LeaderboardEntry.init();

    // Register User A
    const resA = await request(app).post('/api/v1/auth/register').send({
      username: `cadet_${testRunId}`,
      email: `cadet_${testRunId}@escape.local`,
      password: 'SecurePassword123!',
    });
    userAToken = resA.body.data.accessToken;
    userAId = resA.body.data.user._id;

    // Register User B
    const resB = await request(app).post('/api/v1/auth/register').send({
      username: `oper_${testRunId}`,
      email: `oper_${testRunId}@escape.local`,
      password: 'OperatorPassword123!',
    });
    userBToken = resB.body.data.accessToken;
    userBId = resB.body.data.user._id;
  });

  afterAll(async () => {
    const userIds = [userAId, userBId].filter(Boolean);
    await Promise.all([
      User.deleteMany({ email: new RegExp(`(cadet|oper)_${testRunId}`) }),
      GameSession.deleteMany({ userId: { $in: userIds } }),
      ChallengeAttempt.deleteMany({ sessionId: { $in: testSessionIds } }),
      Achievement.deleteMany({ userId: { $in: userIds } }),
      LeaderboardEntry.deleteMany({ userId: { $in: userIds } }),
    ]);
    await disconnectDB();
  });

  describe('Player Dashboard (/api/v1/dashboard/summary)', () => {
    it('should reject unauthenticated requests (401 TOKEN_MISSING)', async () => {
      const res = await request(app).get('/api/v1/dashboard/summary');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('TOKEN_MISSING');
    });

    it('should return empty baseline state for new user with no games', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const data = res.body.data;
      expect(data.userId).toBe(userAId.toString());
      expect(data.username).toBe(`cadet_${testRunId}`);
      expect(data.activeSession).toBeNull();
      expect(data.currentRoom).toBeNull();
      expect(data.overallProgress).toBe(0);
      expect(data.currentScore).toBe(0);
      expect(data.bestScore).toBe(0);
      expect(data.totalEscapes).toBe(0);
      expect(data.gameHistory).toEqual([]);
      expect(data.achievements).toEqual([]);
    });

    it('should present active in-progress session with resume details', async () => {
      const activeSession = await GameSession.create({
        userId: userAId,
        currentRoomIndex: 3,
        status: GAME_STATUS.IN_PROGRESS,
        livesRemaining: 2,
        currentScore: 2800,
        hintsUsed: ['h-qr-1'],
        startTime: new Date(),
      });
      testSessionIds.push(activeSession._id);

      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      const data = res.body.data;

      expect(data.activeSession).not.toBeNull();
      expect(data.activeSession.sessionId).toBe(activeSession._id.toString());
      expect(data.activeSession.currentRoomIndex).toBe(3);
      expect(data.activeSession.currentRoomId).toBe('room-03-scanner');
      expect(data.activeSession.currentScore).toBe(2800);
      expect(data.activeSession.livesRemaining).toBe(2);
      expect(data.activeSession.hintsUsedCount).toBe(1);

      // (3 - 1) / 5 * 100 = 40%
      expect(data.overallProgress).toBe(40);
      expect(data.currentRoom).toBe('room-03-scanner');
      expect(data.currentScore).toBe(2800);
      expect(data.currentLives).toBe(2);

      // Cleanup active session
      await GameSession.deleteOne({ _id: activeSession._id });
    });

    it('should ensure strict user data isolation on dashboard', async () => {
      // Create session and achievement for User A
      const sessionA = await GameSession.create({
        userId: userAId,
        currentRoomIndex: 2,
        status: GAME_STATUS.IN_PROGRESS,
        livesRemaining: 3,
        currentScore: 1500,
        startTime: new Date(),
      });
      testSessionIds.push(sessionA._id);

      await Achievement.create({
        userId: userAId,
        badgeCode: 'PHISHING_EXPERT',
        title: 'Phishing Expert',
        description: 'Zero errors',
        earnedAt: new Date(),
      });

      // User B queries their own dashboard
      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(200);
      const data = res.body.data;

      expect(data.userId).toBe(userBId.toString());
      expect(data.username).toBe(`oper_${testRunId}`);
      expect(data.activeSession).toBeNull();
      expect(data.achievements).toEqual([]);
      expect(data.gameHistory).toEqual([]);

      // Cleanup
      await GameSession.deleteOne({ _id: sessionA._id });
      await Achievement.deleteMany({ userId: userAId });
    });

    it('should aggregate career escape history, best score, and cumulative topic performance', async () => {
      // Create completed session for User A
      const completedSession = await GameSession.create({
        userId: userAId,
        currentRoomIndex: 5,
        status: GAME_STATUS.COMPLETED,
        livesRemaining: 3,
        currentScore: 9800,
        startTime: new Date(Date.now() - 500000),
        completionTime: new Date(),
      });
      testSessionIds.push(completedSession._id);

      // Create failed session for User A
      const failedSession = await GameSession.create({
        userId: userAId,
        currentRoomIndex: 2,
        status: GAME_STATUS.FAILED,
        livesRemaining: 0,
        currentScore: 1200,
        startTime: new Date(Date.now() - 900000),
        completionTime: new Date(Date.now() - 800000),
      });
      testSessionIds.push(failedSession._id);

      // Add attempt history
      await ChallengeAttempt.create({
        sessionId: completedSession._id,
        roomId: 'room-01-inbox',
        challengeId: 'ch-phish-01',
        actionTaken: 'ACTION_QUARANTINE',
        isCorrect: true,
      });

      // Add achievement
      await Achievement.create({
        userId: userAId,
        badgeCode: 'CYBER_GUARDIAN',
        title: 'Cyber Guardian',
        description: 'Neutralized all cyber threats',
        earnedAt: new Date(),
      });

      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      const data = res.body.data;

      expect(data.totalEscapes).toBe(1);
      expect(data.bestScore).toBe(9800);
      expect(data.totalSessions).toBe(2);
      expect(data.gameHistory.length).toBe(2);
      expect(data.achievements.length).toBe(1);
      expect(data.achievements[0].badgeCode).toBe('CYBER_GUARDIAN');
      expect(data.topicPerformance.phishing).toBe(100);

      // Cleanup
      await GameSession.deleteMany({ _id: { $in: [completedSession._id, failedSession._id] } });
      await ChallengeAttempt.deleteMany({ sessionId: completedSession._id });
      await Achievement.deleteMany({ userId: userAId });
    });
  });

  describe('Verified Public Leaderboard (/api/v1/leaderboard)', () => {
    it('should allow public access without authentication', async () => {
      const res = await request(app).get('/api/v1/leaderboard');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.leaderboard).toBeDefined();
    });

    it('should sort entries strictly by finalScore DESC and duration ASC with verified audit flag', async () => {
      // Clear test user leaderboard entries before testing sort order
      await LeaderboardEntry.deleteMany({ userId: { $in: [userAId, userBId] } });

      const session1 = await GameSession.create({
        userId: userAId,
        currentRoomIndex: 5,
        status: GAME_STATUS.COMPLETED,
        livesRemaining: 3,
        currentScore: 9000,
      });
      const session2 = await GameSession.create({
        userId: userBId,
        currentRoomIndex: 5,
        status: GAME_STATUS.COMPLETED,
        livesRemaining: 2,
        currentScore: 9500, // Higher score -> Rank 1
      });
      const session3 = await GameSession.create({
        userId: userAId,
        currentRoomIndex: 5,
        status: GAME_STATUS.COMPLETED,
        livesRemaining: 1,
        currentScore: 9000, // Tie on score, but longer duration -> Rank 3
      });
      testSessionIds.push(session1._id, session2._id, session3._id);

      await LeaderboardEntry.create([
        {
          sessionId: session1._id,
          userId: userAId,
          username: `Cadet_${testRunId}`,
          finalScore: 9000,
          totalDurationSeconds: 400, // Faster than session3
          accuracyPercentage: 90,
          livesRemaining: 3,
          badgesEarned: ['CYBER_GUARDIAN'],
        },
        {
          sessionId: session2._id,
          userId: userBId,
          username: `Operator_${testRunId}`,
          finalScore: 9500,
          totalDurationSeconds: 600,
          accuracyPercentage: 95,
          livesRemaining: 2,
          badgesEarned: ['CYBER_GUARDIAN', 'MULTI_THREAT_MASTER'],
        },
        {
          sessionId: session3._id,
          userId: userAId,
          username: `Cadet_${testRunId}`,
          finalScore: 9000,
          totalDurationSeconds: 550, // Slower than session1
          accuracyPercentage: 85,
          livesRemaining: 1,
          badgesEarned: ['CYBER_GUARDIAN'],
        },
      ]);

      const res = await request(app).get('/api/v1/leaderboard');

      expect(res.status).toBe(200);
      const data = res.body.data;
      expect(data.totalEntries).toBeGreaterThanOrEqual(3);

      const board = data.leaderboard;
      expect(board.length).toBeGreaterThanOrEqual(3);

      // Filter to our test entries
      const testEntries = board.filter((e) => e.username.includes(testRunId));
      expect(testEntries.length).toBe(3);

      // Rank 1 of test entries: Operator with 9500 pts
      expect(testEntries[0].username).toBe(`Operator_${testRunId}`);
      expect(testEntries[0].finalScore).toBe(9500);
      expect(testEntries[0].isVerified).toBe(true);

      // Rank 2: Cadet with 9000 pts (400s)
      expect(testEntries[1].username).toBe(`Cadet_${testRunId}`);
      expect(testEntries[1].finalScore).toBe(9000);
      expect(testEntries[1].totalDurationSeconds).toBe(400);

      // Rank 3: Cadet with 9000 pts (550s)
      expect(testEntries[2].username).toBe(`Cadet_${testRunId}`);
      expect(testEntries[2].finalScore).toBe(9000);
      expect(testEntries[2].totalDurationSeconds).toBe(550);

      // Clean up test sessions & entries
      await GameSession.deleteMany({ _id: { $in: [session1._id, session2._id, session3._id] } });
      await LeaderboardEntry.deleteMany({ userId: { $in: [userAId, userBId] } });
    });

    it('should support pagination via page and limit query parameters', async () => {
      await LeaderboardEntry.deleteMany({ userId: userAId });

      const createdSessionIds = [];
      for (let i = 1; i <= 5; i++) {
        const dummySession = await GameSession.create({
          userId: userAId,
          currentRoomIndex: 5,
          status: GAME_STATUS.COMPLETED,
          livesRemaining: 3,
          currentScore: 1000 * i,
        });
        createdSessionIds.push(dummySession._id);
        testSessionIds.push(dummySession._id);
        await LeaderboardEntry.create({
          sessionId: dummySession._id,
          userId: userAId,
          username: `Player_${i}_${testRunId}`,
          finalScore: 1000 * i,
          totalDurationSeconds: 100 * i,
          accuracyPercentage: 90,
          livesRemaining: 3,
        });
      }

      // Query page 1 with limit 2
      const resPage1 = await request(app).get('/api/v1/leaderboard?page=1&limit=2');
      expect(resPage1.status).toBe(200);
      expect(resPage1.body.data.leaderboard.length).toBe(2);
      expect(resPage1.body.data.leaderboard[0].rank).toBe(1);
      expect(resPage1.body.data.leaderboard[1].rank).toBe(2);

      // Query page 2 with limit 2
      const resPage2 = await request(app).get('/api/v1/leaderboard?page=2&limit=2');
      expect(resPage2.status).toBe(200);
      expect(resPage2.body.data.leaderboard.length).toBe(2);
      expect(resPage2.body.data.leaderboard[0].rank).toBe(3);
      expect(resPage2.body.data.leaderboard[1].rank).toBe(4);

      // Clean up
      await GameSession.deleteMany({ _id: { $in: createdSessionIds } });
      await LeaderboardEntry.deleteMany({ userId: userAId });
    });

    it('Anti-Tampering: Incomplete, failed, and abandoned sessions never appear on leaderboard', async () => {
      // Incomplete sessions in GameSession
      const s1 = await GameSession.create({
        userId: userAId,
        currentRoomIndex: 2,
        status: GAME_STATUS.IN_PROGRESS,
        currentScore: 99999, // Artificially high score
      });
      const s2 = await GameSession.create({
        userId: userBId,
        currentRoomIndex: 4,
        status: GAME_STATUS.FAILED,
        currentScore: 88888,
      });
      const s3 = await GameSession.create({
        userId: userBId,
        currentRoomIndex: 1,
        status: GAME_STATUS.ABANDONED,
        currentScore: 77777,
      });
      testSessionIds.push(s1._id, s2._id, s3._id);

      // Query leaderboard
      const res = await request(app).get('/api/v1/leaderboard');
      expect(res.status).toBe(200);
      // None of the non-completed sessions should appear in leaderboard entries
      const sessionIdsInBoard = res.body.data.leaderboard.map((e) => e.sessionId.toString());
      expect(sessionIdsInBoard).not.toContain(s1._id.toString());
      expect(sessionIdsInBoard).not.toContain(s2._id.toString());
      expect(sessionIdsInBoard).not.toContain(s3._id.toString());

      await GameSession.deleteMany({ _id: { $in: [s1._id, s2._id, s3._id] } });
    });

    it('Anti-Tampering: Direct POST to /api/v1/leaderboard is blocked (404/405)', async () => {
      const res = await request(app)
        .post('/api/v1/leaderboard')
        .send({
          username: 'Hacker',
          finalScore: 999999,
        });

      // POST method does not exist on leaderboard route
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
