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
import { generatePerformanceReport } from '../../src/services/reportService.js';
import { GAME_STATUS } from '../../src/utils/constants.js';

describe('Phase B7D: Room 05 (The Control Room) Multi-Threat Engine Integration', () => {
  const testRunId = Date.now();
  let user1Token = '';
  let user1Id = '';
  let user2Token = '';
  let user2Id = '';
  let activeSessionId = '';
  const challengeId = 'ch-ctrl-01';

  beforeAll(async () => {
    await connectDB();
    await User.init();
    await GameSession.init();
    await ChallengeAttempt.init();
    await KnowledgeAssessment.init();
    await Achievement.init();
    await LeaderboardEntry.init();

    // Register User 1 (Cadet 1 - The Player)
    const res1 = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: `cadet_r5_1_${testRunId}`,
        email: `cadet_r5_1_${testRunId}@facility.local`,
        password: 'Password123!',
      });
    user1Token = res1.body.data.accessToken;
    user1Id = res1.body.data.user._id;

    // Knowledge Assessment for User 1
    await request(app)
      .post('/api/v1/assessment')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        phishingConfidence: 4,
        passwordConfidence: 4,
        qrConfidence: 4,
        socialConfidence: 4,
      });

    // Register User 2 (Unauthorized Player)
    const res2 = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: `cadet_r5_2_${testRunId}`,
        email: `cadet_r5_2_${testRunId}@facility.local`,
        password: 'Password123!',
      });
    user2Token = res2.body.data.accessToken;
    user2Id = res2.body.data.user._id;

    // Start playthrough for User 1
    const sessionRes = await request(app)
      .post('/api/v1/session/start')
      .set('Authorization', `Bearer ${user1Token}`);
    activeSessionId = sessionRes.body.data.session._id;

    // Solve Room 01 -> unlocks Room 02
    await request(app)
      .post('/api/v1/challenges/ch-phish-01/submit')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ sessionId: activeSessionId, actionId: 'ACTION_QUARANTINE' });

    // Solve Room 02 -> unlocks Room 03
    await request(app)
      .post('/api/v1/challenges/ch-vault-01/submit')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ sessionId: activeSessionId, actionId: 'ACTION_DEPLOY_ACC_3' });

    // Solve Room 03 -> unlocks Room 04
    await request(app)
      .post('/api/v1/challenges/ch-qr-01/submit')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ sessionId: activeSessionId, actionId: 'ACTION_PEEL_AND_REPORT' });

    // Solve Room 04 -> unlocks Room 05
    await request(app)
      .post('/api/v1/challenges/ch-msg-01/submit')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ sessionId: activeSessionId, actionId: 'ACTION_VERIFY_OOB' });
  });

  afterAll(async () => {
    await Promise.all([
      User.deleteMany({ email: new RegExp(`cadet_r5_`) }),
      GameSession.deleteMany({ userId: { $in: [user1Id, user2Id] } }),
      ChallengeAttempt.deleteMany({ sessionId: activeSessionId }),
      KnowledgeAssessment.deleteMany({ userId: { $in: [user1Id, user2Id] } }),
      Achievement.deleteMany({ userId: { $in: [user1Id, user2Id] } }),
      LeaderboardEntry.deleteMany({ sessionId: activeSessionId }),
    ]);
    await disconnectDB();
  });

  describe('Multi-Threat State Presentation & Room Clearance Access', () => {
    it('Sequential Progression: Session should now have clearance for Sector 05', async () => {
      const session = await GameSession.findById(activeSessionId);
      expect(session.currentRoomIndex).toBe(5);
    });

    it('Room Ownership: User 2 cannot access Room 05 on User 1 session (403 NO_ACTIVE_SESSION)', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-05-control')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('NO_ACTIVE_SESSION');
    });

    it('GET /api/v1/rooms/room-05-control should present multi-threat incident matrix and strip hidden answers', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-05-control')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sectorNumber).toBe(5);
      expect(res.body.data.title).toBe('The Control Room');

      const challenge = res.body.data.challenge;
      expect(challenge.challengeId).toBe('ch-ctrl-01');
      expect(challenge.topic).toBe('multi_threat');

      // Verify 4 concurrent threat alarms
      const alarms = challenge.evidence.activeAlarms;
      expect(alarms.length).toBe(4);
      expect(alarms.some((a) => a.id === 'threat_phish_c2')).toBe(true);
      expect(alarms.some((a) => a.id === 'threat_vault_creds')).toBe(true);
      expect(alarms.some((a) => a.id === 'threat_social_helpdesk')).toBe(true);
      expect(alarms.some((a) => a.id === 'threat_qr_kiosk')).toBe(true);

      // Verify answer secrecy: hidden keys never transmitted over API
      expect(challenge.correctActionId).toBeUndefined();
      expect(challenge.authoritativeContainmentOrder).toBeUndefined();
      expect(challenge.hiddenIoCs).toBeUndefined();
      expect(challenge.explanation).toBeUndefined();
    });

    it('Report Generation Gate: Should reject performance report before escape is completed (400 REPORT_NOT_AVAILABLE)', async () => {
      await expect(generatePerformanceReport(activeSessionId, user1Id)).rejects.toThrow(
        /Performance report is only generated for completed escape sessions/
      );
    });
  });

  describe('Triage Validation: Incorrect Prioritization & Invalid Order', () => {
    let testSessionId = '';

    beforeAll(async () => {
      // Create dedicated test session for testing invalid decisions without draining User 1 lives
      const s = await GameSession.create({
        userId: user1Id,
        currentRoomIndex: 5,
        livesRemaining: 3,
        status: GAME_STATUS.IN_PROGRESS,
      });
      testSessionId = s._id;
    });

    afterAll(async () => {
      await GameSession.findByIdAndDelete(testSessionId);
      await ChallengeAttempt.deleteMany({ sessionId: testSessionId });
    });

    it('Incorrect Prioritization: Containing perimeter QR kiosk before critical Domain Controller exfiltration should fail', async () => {
      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/submit`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          sessionId: testSessionId,
          actionId: 'ACTION_PURGE_KIOSK_QR', // Low-impact perimeter threat chosen first
          timeElapsedSeconds: 15,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isCorrect).toBe(false);
      expect(res.body.data.lifeDelta).toBe(-1);
      expect(res.body.data.livesRemaining).toBe(2);
      expect(res.body.data.reason).toBe('INCORRECT_PRIORITIZATION');

      // Debrief payload explains why DC exfiltration is critical
      expect(res.body.data.intervention.payload.whyDangerous).toContain('exfiltration');
    });

    it('Invalid Containment Order: Submitting out-of-order sequence should fail and deduct life', async () => {
      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/submit`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          sessionId: testSessionId,
          actionId: 'ACTION_CONTAIN_INCIDENT_SEQUENCE',
          containmentSequence: [
            'ACTION_SEVER_DC_C2', // Step 1: correct
            'ACTION_PURGE_KIOSK_QR', // Step 2: INVALID (kiosk before vault/helpdesk)
            'ACTION_LOCK_VAULT_CREDS',
            'ACTION_ISOLATE_HELPDESK_PRETEXT',
          ],
          timeElapsedSeconds: 18,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isCorrect).toBe(false);
      expect(res.body.data.lifeDelta).toBe(-1);
      expect(res.body.data.livesRemaining).toBe(1);
      expect(res.body.data.reason).toBe('INVALID_CONTAINMENT_ORDER');
    });

    it('IDOR Session Guard: User 2 cannot submit decisions to User 1 session (403 FORBIDDEN_SESSION_ACCESS)', async () => {
      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/submit`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          sessionId: testSessionId,
          actionId: 'ACTION_SEVER_DC_C2',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN_SESSION_ACCESS');
    });
  });

  describe('Step-by-Step Multi-Threat Containment & Final Escape Completion', () => {
    it('Step 1: Sever Domain Controller C2 Link (Critical Exfiltration)', async () => {
      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/submit`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          sessionId: activeSessionId,
          actionId: 'ACTION_SEVER_DC_C2',
          inspectedArtifacts: ['c2_traffic_analyzer'],
          timeElapsedSeconds: 12,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isCorrect).toBe(true);
      expect(res.body.data.stepCompleted).toBe(true);
      expect(res.body.data.roomCompleted).toBe(false);
      expect(res.body.data.containedThreats).toContain('threat_phish_c2');
      expect(res.body.data.remainingThreats).toBe(3);
    });

    it('Step 2: Lock Cryptographic Vault Credentials (High Brute-Force)', async () => {
      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/submit`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          sessionId: activeSessionId,
          actionId: 'ACTION_LOCK_VAULT_CREDS',
          inspectedArtifacts: ['vault_audit_log'],
          timeElapsedSeconds: 10,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isCorrect).toBe(true);
      expect(res.body.data.stepCompleted).toBe(true);
      expect(res.body.data.containedThreats).toContain('threat_vault_creds');
      expect(res.body.data.remainingThreats).toBe(2);
    });

    it('Step 3: Isolate Helpdesk Pretext (High Social Manipulation)', async () => {
      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/submit`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          sessionId: activeSessionId,
          actionId: 'ACTION_ISOLATE_HELPDESK_PRETEXT',
          inspectedArtifacts: ['helpdesk_directory_check'],
          timeElapsedSeconds: 8,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isCorrect).toBe(true);
      expect(res.body.data.stepCompleted).toBe(true);
      expect(res.body.data.containedThreats).toContain('threat_social_helpdesk');
      expect(res.body.data.remainingThreats).toBe(1);
    });

    it('Step 4: Purge Visitor Kiosk QR Node -> Completes Containment & Final Escape', async () => {
      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/submit`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          sessionId: activeSessionId,
          actionId: 'ACTION_PURGE_KIOSK_QR',
          inspectedArtifacts: ['kiosk_firmware_scan'],
          timeElapsedSeconds: 10,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isCorrect).toBe(true);
      expect(res.body.data.roomCompleted).toBe(true);
      expect(res.body.data.isFullyContained).toBe(true);
      expect(res.body.data.escapeCompleted).toBe(true);
      expect(res.body.data.gameStatus).toBe(GAME_STATUS.COMPLETED);
      expect(res.body.data.completionTime).toBeDefined();
      expect(res.body.data.isLeaderboardEligible).toBe(true);
      expect(res.body.data.scoreDelta).toBeGreaterThanOrEqual(1500); // Control room expert score
    });
  });

  describe('Escape State Authority, Persistence & Lifecycle Integrity', () => {
    it('Authoritative Session State: Session in DB is COMPLETED with completionTime and leaderboard eligibility', async () => {
      const session = await GameSession.findById(activeSessionId);
      expect(session.status).toBe(GAME_STATUS.COMPLETED);
      expect(session.completionTime).toBeDefined();
      expect(session.isLeaderboardEligible).toBe(true);
      expect(session.containmentState.isFullyContained).toBe(true);
      expect(session.containmentState.containedThreats.length).toBe(4);
    });

    it('Attempt History Preservation: Database preserves complete attempt history across all sectors', async () => {
      const attempts = await ChallengeAttempt.find({ sessionId: activeSessionId });
      expect(attempts.length).toBeGreaterThanOrEqual(5);

      // Verify attempts for each sector exist
      const roomIds = attempts.map((a) => a.roomId);
      expect(roomIds).toContain('room-01-inbox');
      expect(roomIds).toContain('room-02-vault');
      expect(roomIds).toContain('room-03-scanner');
      expect(roomIds).toContain('room-04-message');
      expect(roomIds).toContain('room-05-control');
    });

    it('Leaderboard Entry Persistence: Document created in LeaderboardEntry collection', async () => {
      const entry = await LeaderboardEntry.findOne({ sessionId: activeSessionId });
      expect(entry).toBeDefined();
      expect(entry.userId.toString()).toBe(user1Id.toString());
      expect(entry.finalScore).toBeGreaterThan(2000);
      expect(entry.accuracyPercentage).toBe(100);
      expect(entry.badgesEarned.length).toBeGreaterThan(0);
      expect(entry.totalDurationSeconds).toBeGreaterThan(0);
    });

    it('Achievement Evaluation: Authoritatively awarded Cyber Guardian and multi-threat badges', async () => {
      const achievements = await Achievement.find({ userId: user1Id });
      expect(achievements.length).toBeGreaterThan(0);

      const codes = achievements.map((a) => a.badgeCode);
      expect(codes).toContain('CYBER_GUARDIAN');
      expect(codes).toContain('MULTI_THREAT_MASTER');
      expect(codes).toContain('ZERO_MISTAKE_ESCAPE');
    });

    it('Performance Report Compilation: generatePerformanceReport produces authoritative diagnostic breakdown', async () => {
      const report = await generatePerformanceReport(activeSessionId, user1Id);

      expect(report).toBeDefined();
      expect(report.sessionId.toString()).toBe(activeSessionId.toString());
      expect(report.status).toBe(GAME_STATUS.COMPLETED);
      expect(report.finalScore).toBeGreaterThan(2000);
      expect(report.accuracyPercentage).toBe(100);
      expect(report.topicScores).toBeDefined();
      expect(report.topicScores.phishing).toBe(100);
      expect(report.topicScores.passwordSecurity).toBe(100);
      expect(report.topicScores.qrSecurity).toBe(100);
      expect(report.topicScores.socialEngineering).toBe(100);
      expect(report.topicScores.multiThreat).toBe(100);
      expect(report.strongestSkill).toBeDefined();
      expect(report.personalizedRecommendation).toBeDefined();
    });

    it('Closed Session Protection: Subsequent actions to COMPLETED session are rejected (409 SESSION_LOCKED)', async () => {
      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/submit`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          sessionId: activeSessionId,
          actionId: 'ACTION_SEVER_DC_C2',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('SESSION_LOCKED');
    });

    it('Room Access Rejection: Completed session cannot re-enter rooms as an active session (403 NO_ACTIVE_SESSION)', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-05-control')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('NO_ACTIVE_SESSION');
    });
  });

  describe('Bulk Sequence Submission Mode', () => {
    let bulkSessionId = '';

    beforeAll(async () => {
      // Create session at Room 05 to verify single bulk sequence submission
      const s = await GameSession.create({
        userId: user1Id,
        currentRoomIndex: 5,
        livesRemaining: 3,
        status: GAME_STATUS.IN_PROGRESS,
      });
      bulkSessionId = s._id;
    });

    afterAll(async () => {
      await GameSession.findByIdAndDelete(bulkSessionId);
      await ChallengeAttempt.deleteMany({ sessionId: bulkSessionId });
      await LeaderboardEntry.deleteMany({ sessionId: bulkSessionId });
    });

    it('Bulk Sequence: Submitting complete correct sequence array should clear Room 05 immediately', async () => {
      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/submit`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          sessionId: bulkSessionId,
          actionId: 'ACTION_CONTAIN_INCIDENT_SEQUENCE',
          containmentSequence: [
            'ACTION_SEVER_DC_C2',
            'ACTION_LOCK_VAULT_CREDS',
            'ACTION_ISOLATE_HELPDESK_PRETEXT',
            'ACTION_PURGE_KIOSK_QR',
          ],
          inspectedArtifacts: ['c2_traffic_analyzer', 'vault_audit_log'],
          timeElapsedSeconds: 25,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isCorrect).toBe(true);
      expect(res.body.data.isFullyContained).toBe(true);
      expect(res.body.data.escapeCompleted).toBe(true);
      expect(res.body.data.gameStatus).toBe(GAME_STATUS.COMPLETED);

      const session = await GameSession.findById(bulkSessionId);
      expect(session.status).toBe(GAME_STATUS.COMPLETED);
      expect(session.isLeaderboardEligible).toBe(true);
    });
  });
});
