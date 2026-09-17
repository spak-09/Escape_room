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

describe('Post-Run Navigation & Lifecycle Integrity Tests', () => {
  const testRunId = `postrun_${Date.now().toString().slice(-6)}_${Math.floor(Math.random() * 1000)}`;
  let accessToken = '';
  let userId = '';
  let completedSessionId = '';
  let finalScore = 0;

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
        completedSessionId ? ChallengeAttempt.deleteMany({ sessionId: completedSessionId }) : Promise.resolve(),
        KnowledgeAssessment.deleteMany({ userId }),
        Achievement.deleteMany({ userId }),
        LeaderboardEntry.deleteMany({ userId }),
      ]);
    }
    await disconnectDB();
  });

  it('Scenario A: Complete run -> Verify run completion -> Ensure no automatic new run', async () => {
    // 1. Register & Login
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: testRunId,
        email: `${testRunId}@escape.local`,
        password: 'Password123!Secure',
      });
    expect(regRes.status).toBe(201);
    accessToken = regRes.body.data.accessToken;
    userId = regRes.body.data.user._id;

    // 2. Start a run
    const startRes = await request(app)
      .post('/api/v1/session/start')
      .set('Authorization', `Bearer ${accessToken}`);
    expect([200, 201]).toContain(startRes.status);
    expect(startRes.body.success).toBe(true);
    completedSessionId = startRes.body.data.session._id || startRes.body.data.session.sessionId;
    expect(completedSessionId).toBeDefined();

    // 3. Fast-forward session to Room 5 for completion
    await GameSession.findByIdAndUpdate(completedSessionId, {
      currentRoomIndex: 5,
      currentScore: 4000,
    });

    // 4. Submit Room 5 final containment challenge
    const submitRes = await request(app)
      .post('/api/v1/challenges/ch-ctrl-01/submit')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sessionId: completedSessionId,
        actionId: 'ACTION_TRIAGE_CONTAINMENT',
        containmentSequence: [
          'ACTION_SEVER_DC_C2',
          'ACTION_LOCK_VAULT_CREDS',
          'ACTION_ISOLATE_HELPDESK_PRETEXT',
          'ACTION_PURGE_KIOSK_QR',
        ],
        timeElapsedSeconds: 20,
      });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.success).toBe(true);
    expect(submitRes.body.data.isCorrect).toBe(true);
    expect(submitRes.body.data.escapeCompleted).toBe(true);
    expect(submitRes.body.data.gameStatus).toBe(GAME_STATUS.COMPLETED);
    finalScore = submitRes.body.data.currentScore;

    // 5. Verify Escape Result screen report can be loaded
    const reportRes = await request(app)
      .get(`/api/v1/reports/${completedSessionId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(reportRes.status).toBe(200);
    expect(reportRes.body.success).toBe(true);
    expect(reportRes.body.data.status).toBe('COMPLETED');
    expect(reportRes.body.data.finalScore).toBe(finalScore);

    // 6. Verify NO new active run exists
    const activeRes = await request(app)
      .get('/api/v1/session/active')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(activeRes.status).toBe(404);

    // 7. Verify Dashboard summary correctly reflects completed run and NO active session
    const dashRes = await request(app)
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(dashRes.status).toBe(200);
    expect(dashRes.body.data.activeSession).toBeNull();
    expect(dashRes.body.data.totalEscapes).toBe(1);
    expect(dashRes.body.data.gameHistory.length).toBe(1);
    expect(dashRes.body.data.gameHistory[0].status).toBe(GAME_STATUS.COMPLETED);
    expect(dashRes.body.data.gameHistory[0].finalScore).toBe(finalScore);
  });

  it('Scenario B: Refresh Escape Result screen -> No duplicate run created', async () => {
    // 1. Re-fetch the performance report (simulates page refresh on /game/escape-result/:sessionId)
    const reportRes = await request(app)
      .get(`/api/v1/reports/${completedSessionId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(reportRes.status).toBe(200);
    expect(reportRes.body.success).toBe(true);

    // 2. Verify no active session was spawned
    const activeRes = await request(app)
      .get('/api/v1/session/active')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(activeRes.status).toBe(404);

    // 3. Verify Dashboard still has exactly 1 completed escape
    const dashRes = await request(app)
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(dashRes.status).toBe(200);
    expect(dashRes.body.data.activeSession).toBeNull();
    expect(dashRes.body.data.totalEscapes).toBe(1);
  });

  it('Scenario C: Start new run manually from Dashboard -> Succeeds without overwriting completed run', async () => {
    // 1. Player manually clicks 'NEW ESCAPE RUN' from dashboard
    const startRes = await request(app)
      .post('/api/v1/session/start')
      .set('Authorization', `Bearer ${accessToken}`);
    expect([200, 201]).toContain(startRes.status);
    expect(startRes.body.success).toBe(true);
    const newSessionId = startRes.body.data.session._id || startRes.body.data.session.sessionId;
    expect(newSessionId).not.toBe(completedSessionId);

    // 2. Verify active session now exists
    const activeRes = await request(app)
      .get('/api/v1/session/active')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(activeRes.status).toBe(200);
    expect(activeRes.body.data.session._id).toBe(newSessionId);
    expect(activeRes.body.data.session.status).toBe(GAME_STATUS.IN_PROGRESS);

    // 3. Verify Dashboard shows active session AND previous completed run in history
    const dashRes = await request(app)
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(dashRes.status).toBe(200);
    expect(dashRes.body.data.activeSession).not.toBeNull();
    expect(dashRes.body.data.activeSession.sessionId.toString()).toBe(newSessionId.toString());
    expect(dashRes.body.data.totalEscapes).toBe(1);
    expect(dashRes.body.data.gameHistory.length).toBe(2);

    // Cleanup new session
    await GameSession.deleteMany({ _id: newSessionId });
  });

  it('Scenario D: Authentication & Security Guards remain intact', async () => {
    // Unauthenticated access to reports is rejected
    const reportRes = await request(app).get(`/api/v1/reports/${completedSessionId}`);
    expect(reportRes.status).toBe(401);

    // Unauthenticated access to dashboard is rejected
    const dashRes = await request(app).get('/api/v1/dashboard/summary');
    expect(dashRes.status).toBe(401);

    // Completed session rejects further challenge submissions
    const tamperRes = await request(app)
      .post('/api/v1/challenges/ch-ctrl-01/submit')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sessionId: completedSessionId,
        actionId: 'ACTION_TRIAGE_CONTAINMENT',
      });
    expect(tamperRes.status).toBe(409);
  });
});
