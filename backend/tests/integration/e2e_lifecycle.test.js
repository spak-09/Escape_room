import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/db.js';
import { User } from '../../src/models/User.js';
import { GameSession } from '../../src/models/GameSession.js';
import { ChallengeAttempt } from '../../src/models/ChallengeAttempt.js';
import { KnowledgeAssessment } from '../../src/models/KnowledgeAssessment.js';
import { Achievement } from '../../src/models/Achievement.js';
import { LeaderboardEntry } from '../../src/models/LeaderboardEntry.js';
import { GAME_STATUS } from '../../src/utils/constants.js';

describe('Phase B10: End-to-End Game Lifecycle Integration', () => {
  const testRunId = `${Date.now().toString().slice(-6)}_${Math.floor(Math.random() * 1000)}`;
  let accessToken = '';
  let refreshTokenCookie = '';
  let userId = '';
  let sessionId = '';

  beforeAll(async () => {
    await connectDB();
    await User.init();
    await GameSession.init();
    await ChallengeAttempt.init();
    await KnowledgeAssessment.init();
    await Achievement.init();
    await LeaderboardEntry.init();
  });

  afterAll(async () => {
    if (userId) {
      await Promise.all([
        User.deleteMany({ _id: userId }),
        GameSession.deleteMany({ userId }),
        ChallengeAttempt.deleteMany({ sessionId }),
        KnowledgeAssessment.deleteMany({ userId }),
        Achievement.deleteMany({ userId }),
        LeaderboardEntry.deleteMany({ userId }),
      ]);
    }
    await disconnectDB();
  });

  it('Step 1: Register a new cadet account', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: `e2e_${testRunId}`,
        email: `e2e_${testRunId}@escape.local`,
        password: 'Password123!Secure',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.username).toBe(`e2e_${testRunId}`);
    expect(res.body.data.accessToken).toBeDefined();

    userId = res.body.data.user._id;

    // Verify Set-Cookie header contains HttpOnly refresh token
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toContain('HttpOnly');
    expect(refreshCookie.toLowerCase()).toContain('samesite=strict');
  });

  it('Step 2: Authenticate via login and receive dual tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: `e2e_${testRunId}@escape.local`,
        password: 'Password123!Secure',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    accessToken = res.body.data.accessToken;

    const cookies = res.headers['set-cookie'];
    refreshTokenCookie = cookies.find((c) => c.startsWith('refreshToken='));
    expect(refreshTokenCookie).toBeDefined();
  });

  it('Step 3: Submit baseline cybersecurity knowledge assessment', async () => {
    const res = await request(app)
      .post('/api/v1/assessment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        phishingConfidence: 4,
        passwordConfidence: 3,
        qrConfidence: 4,
        socialConfidence: 3,
        tutorialRequested: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.assessment.phishingConfidence).toBe(4);
    expect(res.body.data.assessment.tutorialRequested).toBe(true);
  });

  it('Step 4: Initialize authoritative escape session', async () => {
    const res = await request(app)
      .post('/api/v1/session/start')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const session = res.body.data.session;
    expect(session.currentRoomIndex).toBe(1);
    expect(session.livesRemaining).toBe(3);
    expect(session.currentScore).toBe(0);
    expect(session.status).toBe(GAME_STATUS.IN_PROGRESS);

    sessionId = session._id;
  });

  it('Step 5: Access Sector 01 (The Inbox) and verify sanitized evidence presentation', async () => {
    const res = await request(app)
      .get('/api/v1/rooms/room-01-inbox')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(data.roomId).toBe('room-01-inbox');
    expect(data.sectorNumber).toBe(1);
    expect(data.challenge.challengeId).toBe('ch-phish-01');

    // Security Verification: hidden answer keys must NOT be present
    expect(data.challenge.correctActionId).toBeUndefined();
    expect(data.challenge.hiddenIoCs).toBeUndefined();
    expect(data.challenge.explanation).toBeUndefined();
  });

  it('Step 6: Solve Sector 01 phishing challenge and advance to Sector 02', async () => {
    const res = await request(app)
      .post('/api/v1/challenges/ch-phish-01/submit')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sessionId,
        actionId: 'ACTION_QUARANTINE',
        inspectedArtifacts: ['typosquatted_domain', 'mismatched_href_text', 'spf_fail'],
        timeElapsedSeconds: 10,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isCorrect).toBe(true);
    expect(res.body.data.scoreDelta).toBeGreaterThan(0);
    expect(res.body.data.nextRoomIndex).toBe(2);
    expect(res.body.data.livesRemaining).toBe(3);
  });

  it('Step 7: Solve Sector 02 (The Vault) password/MFA challenge and advance to Sector 03', async () => {
    const res = await request(app)
      .post('/api/v1/challenges/ch-vault-01/submit')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sessionId,
        actionId: 'ACTION_DEPLOY_ACC_3',
        timeElapsedSeconds: 8,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isCorrect).toBe(true);
    expect(res.body.data.nextRoomIndex).toBe(3);
  });

  it('Step 8: Solve Sector 03 (The Scanner) QR quishing challenge and advance to Sector 04', async () => {
    const res = await request(app)
      .post('/api/v1/challenges/ch-qr-01/submit')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sessionId,
        actionId: 'ACTION_PEEL_AND_REPORT',
        timeElapsedSeconds: 9,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isCorrect).toBe(true);
    expect(res.body.data.nextRoomIndex).toBe(4);
  });

  it('Step 9: Solve Sector 04 (The Message) social engineering pretext challenge and advance to Sector 05', async () => {
    const res = await request(app)
      .post('/api/v1/challenges/ch-msg-01/submit')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sessionId,
        actionId: 'ACTION_VERIFY_OOB',
        timeElapsedSeconds: 7,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isCorrect).toBe(true);
    expect(res.body.data.nextRoomIndex).toBe(5);
  });

  it('Step 10: Solve Sector 05 (The Control Room) and achieve full facility escape', async () => {
    const res = await request(app)
      .post('/api/v1/challenges/ch-ctrl-01/submit')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sessionId,
        actionId: 'ACTION_TRIAGE_CONTAINMENT',
        containmentSequence: [
          'ACTION_SEVER_DC_C2',
          'ACTION_LOCK_VAULT_CREDS',
          'ACTION_ISOLATE_HELPDESK_PRETEXT',
          'ACTION_PURGE_KIOSK_QR',
        ],
        timeElapsedSeconds: 15,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(data.isCorrect).toBe(true);
    expect(data.escapeCompleted).toBe(true);
    expect(data.gameStatus).toBe(GAME_STATUS.COMPLETED);
    expect(data.livesRemaining).toBe(3);
    expect(data.currentScore).toBeGreaterThan(5000);
    expect(data.completionTime).toBeDefined();

    // Verify badges awarded automatically
    expect(data.badgesEarned).toContain('CYBER_GUARDIAN');
    expect(data.badgesEarned).toContain('ZERO_MISTAKE_ESCAPE');
  });

  it('Step 11: Retrieve Cybersecurity Performance Report from persisted server state', async () => {
    const res = await request(app)
      .get(`/api/v1/reports/${sessionId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const report = res.body.data;
    expect(report.sessionId).toBe(sessionId.toString());
    expect(report.status).toBe('COMPLETED');
    expect(report.accuracyPercentage).toBe(100);
    expect(report.livesRemaining).toBe(3);
    expect(report.mistakes).toBe(0);

    // 100% topic mastery across all sectors
    expect(report.topicMastery.phishing).toBe(100);
    expect(report.topicMastery.password_security).toBe(100);
    expect(report.topicMastery.qr_security).toBe(100);
    expect(report.topicMastery.social_engineering).toBe(100);
    expect(report.topicMastery.multi_threat).toBe(100);

    expect(report.badgesEarned).toContain('CYBER_GUARDIAN');
    expect(report.badgesEarned).toContain('ZERO_MISTAKE_ESCAPE');
  });

  it('Step 12: View player career dashboard and verify completed escape stats', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(data.totalEscapes).toBe(1);
    expect(data.overallProgress).toBe(100);
    expect(data.activeSession).toBeNull(); // Session successfully completed
    expect(data.bestScore).toBeGreaterThan(5000);
    expect(data.gameHistory.length).toBe(1);
    expect(data.gameHistory[0].status).toBe(GAME_STATUS.COMPLETED);
    expect(data.achievements.length).toBeGreaterThanOrEqual(2);
  });

  it('Step 13: View verified public escape leaderboard', async () => {
    const res = await request(app).get('/api/v1/leaderboard');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const board = res.body.data.leaderboard;
    const playerEntry = board.find((e) => e.username === `e2e_${testRunId}`);

    expect(playerEntry).toBeDefined();
    expect(playerEntry.finalScore).toBeGreaterThan(5000);
    expect(playerEntry.livesRemaining).toBe(3);
    expect(playerEntry.accuracyPercentage).toBe(100);
    expect(playerEntry.isVerified).toBe(true);
  });
});
