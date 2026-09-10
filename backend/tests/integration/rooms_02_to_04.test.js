import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/db.js';
import { User } from '../../src/models/User.js';
import { GameSession } from '../../src/models/GameSession.js';
import { ChallengeAttempt } from '../../src/models/ChallengeAttempt.js';
import { KnowledgeAssessment } from '../../src/models/KnowledgeAssessment.js';
import { GAME_STATUS } from '../../src/utils/constants.js';

describe('Phases B7A, B7B, B7C: Rooms 02 to 04 Backend Engine Lifecycle Integration', () => {
  const testRunId = Date.now();
  let userToken = '';
  let userId = '';
  let activeSessionId = '';

  beforeAll(async () => {
    await connectDB();
    await User.init();
    await GameSession.init();
    await ChallengeAttempt.init();
    await KnowledgeAssessment.init();

    // Register Cadet
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: `cadet_r24_${testRunId}`,
        email: `cadet_r24_${testRunId}@facility.local`,
        password: 'Password123!',
      });
    userToken = regRes.body.data.accessToken;
    userId = regRes.body.data.user._id;

    // Baseline assessment: Low password confidence (2) to test adaptive learning calibration
    await request(app)
      .post('/api/v1/assessment')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        phishingConfidence: 4,
        passwordConfidence: 2,
        qrConfidence: 3,
        socialConfidence: 5,
      });

    // Start active playthrough session
    const sessionRes = await request(app)
      .post('/api/v1/session/start')
      .set('Authorization', `Bearer ${userToken}`);
    activeSessionId = sessionRes.body.data.session._id;
  });

  afterAll(async () => {
    await Promise.all([
      User.deleteMany({ email: new RegExp(`cadet_r24_`) }),
      GameSession.deleteMany({ userId }),
      ChallengeAttempt.deleteMany({ sessionId: activeSessionId }),
      KnowledgeAssessment.deleteMany({ userId }),
    ]);
    await disconnectDB();
  });

  describe('Sequential Sector Access Controls & Room 01 Clearance', () => {
    it('should reject Room 02 access while Room 01 is pending (403 PREREQUISITES_INCOMPLETE)', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-02-vault')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PREREQUISITES_INCOMPLETE');
    });

    it('should reject submitting Room 02 challenge before Room 01 is cleared (403 PREREQUISITES_INCOMPLETE)', async () => {
      const res = await request(app)
        .post('/api/v1/challenges/ch-vault-01/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          sessionId: activeSessionId,
          actionId: 'ACTION_DEPLOY_ACC_3',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PREREQUISITES_INCOMPLETE');
    });

    it('should reject requesting hints for locked sectors (403 PREREQUISITES_INCOMPLETE)', async () => {
      const res = await request(app)
        .post('/api/v1/challenges/ch-vault-01/hint')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sessionId: activeSessionId });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PREREQUISITES_INCOMPLETE');
    });

    it('should solve Room 01 (The Inbox) and advance session to Sector 02', async () => {
      const res = await request(app)
        .post('/api/v1/challenges/ch-phish-01/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          sessionId: activeSessionId,
          actionId: 'ACTION_QUARANTINE',
          inspectedArtifacts: ['url_inspect'],
          timeElapsedSeconds: 15,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isCorrect).toBe(true);
      expect(res.body.data.roomCompleted).toBe(true);
      expect(res.body.data.nextRoomIndex).toBe(2);

      const session = await GameSession.findById(activeSessionId);
      expect(session.currentRoomIndex).toBe(2);
    });
  });

  describe('PHASE B7A — Room 02 (The Vault) Gameplay & Authentication Rules', () => {
    it('should access Room 02 with sanitized presentation data and secret answer concealment', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-02-vault')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('The Vault');
      expect(res.body.data.sectorNumber).toBe(2);

      // Verify challenge presentation
      const challenge = res.body.data.challenge;
      expect(challenge.challengeId).toBe('ch-vault-01');
      expect(challenge.evidence.candidateAccounts).toBeDefined();
      expect(challenge.availableActions.length).toBe(3);

      // Critical Secrecy: Ensure hidden keys are NOT transmitted
      expect(challenge.correctActionId).toBeUndefined();
      expect(challenge.hiddenIoCs).toBeUndefined();
      expect(challenge.privateIndicators).toBeUndefined();
      expect(challenge.explanation).toBeUndefined();
    });

    it('should reject Room 03 access before Room 02 is solved (403 PREREQUISITES_INCOMPLETE)', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-03-scanner')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PREREQUISITES_INCOMPLETE');
    });

    it('POST /challenges/ch-vault-01/hint should reveal credential hint and deduct 75 points', async () => {
      const sessionBefore = await GameSession.findById(activeSessionId);
      const scoreBefore = sessionBefore.currentScore;

      const res = await request(app)
        .post('/api/v1/challenges/ch-vault-01/hint')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sessionId: activeSessionId });

      expect(res.status).toBe(200);
      expect(res.body.data.hint).toBeDefined();
      expect(res.body.data.scorePenaltyApplied).toBe(75);
      expect(res.body.data.currentScore).toBe(scoreBefore - 75);
    });

    it('should penalize dangerous action (ACTION_DEPLOY_ACC_1) with life deduction and Level 3 Micro-Tutorial (adaptive low confidence)', async () => {
      const res = await request(app)
        .post('/api/v1/challenges/ch-vault-01/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          sessionId: activeSessionId,
          actionId: 'ACTION_DEPLOY_ACC_1', // Reused weak password, no MFA
          inspectedArtifacts: [],
          timeElapsedSeconds: 20,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isCorrect).toBe(false);
      expect(res.body.data.lifeDelta).toBe(-1);
      expect(res.body.data.livesRemaining).toBe(2);

      // Adaptive check: passwordConfidence is 2, mistake is 1 -> Level 3 MICRO_TUTORIAL
      const intervention = res.body.data.intervention;
      expect(intervention.type).toBe('MICRO_TUTORIAL');
      expect(intervention.payload.whatHappened).toBeDefined();
      expect(intervention.payload.whyDangerous).toBeDefined();
      expect(intervention.payload.correctAction).toBeDefined();
      expect(intervention.payload.securityTip).toBeDefined();
    });

    it('should solve Room 02 with FIDO2 hardware MFA and advance to Sector 03', async () => {
      const res = await request(app)
        .post('/api/v1/challenges/ch-vault-01/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          sessionId: activeSessionId,
          actionId: 'ACTION_DEPLOY_ACC_3', // 96-bit random password + FIDO2
          inspectedArtifacts: ['entropy_calculator', 'mfa_evaluation'],
          timeElapsedSeconds: 15,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isCorrect).toBe(true);
      expect(res.body.data.investigationBonusAwarded).toBe(true);
      expect(res.body.data.roomCompleted).toBe(true);
      expect(res.body.data.nextRoomIndex).toBe(3);

      const session = await GameSession.findById(activeSessionId);
      expect(session.currentRoomIndex).toBe(3);
    });

    it('Anti-Replay: should reject resubmission of solved Room 02 challenge (409 CHALLENGE_ALREADY_COMPLETED)', async () => {
      const res = await request(app)
        .post('/api/v1/challenges/ch-vault-01/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          sessionId: activeSessionId,
          actionId: 'ACTION_DEPLOY_ACC_3',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CHALLENGE_ALREADY_COMPLETED');
    });
  });

  describe('PHASE B7B — Room 03 (The Scanner) Gameplay & QR / Quishing Rules', () => {
    it('should access Room 03 with sanitized presentation data and secret answer concealment', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-03-scanner')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('The Scanner');
      expect(res.body.data.sectorNumber).toBe(3);

      const challenge = res.body.data.challenge;
      expect(challenge.challengeId).toBe('ch-qr-01');
      expect(challenge.evidence.scannedPayload).toBe('https://bit.ly/3xSecFacilitySync');
      expect(challenge.evidence.redirectChain).toBeDefined();
      expect(challenge.availableActions.length).toBe(3);

      // Verify answer secrecy
      expect(challenge.correctActionId).toBeUndefined();
      expect(challenge.hiddenIoCs).toBeUndefined();
      expect(challenge.explanation).toBeUndefined();
    });

    it('should reject Room 04 access before Room 03 is solved (403 PREREQUISITES_INCOMPLETE)', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-04-message')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PREREQUISITES_INCOMPLETE');
    });

    it('POST /challenges/ch-qr-01/hint should reveal optical scanner hint and deduct points', async () => {
      const res = await request(app)
        .post('/api/v1/challenges/ch-qr-01/hint')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sessionId: activeSessionId });

      expect(res.status).toBe(200);
      expect(res.body.data.hint).toBeDefined();
      expect(res.body.data.scorePenaltyApplied).toBe(75);
    });

    it('should solve Room 03 by flagging quishing sticker and advance to Sector 04', async () => {
      const res = await request(app)
        .post('/api/v1/challenges/ch-qr-01/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          sessionId: activeSessionId,
          actionId: 'ACTION_PEEL_AND_REPORT',
          inspectedArtifacts: ['redirect_tracer', 'physical_inspection'],
          timeElapsedSeconds: 18,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isCorrect).toBe(true);
      expect(res.body.data.investigationBonusAwarded).toBe(true);
      expect(res.body.data.roomCompleted).toBe(true);
      expect(res.body.data.nextRoomIndex).toBe(4);

      const session = await GameSession.findById(activeSessionId);
      expect(session.currentRoomIndex).toBe(4);
    });

    it('Anti-Replay: should reject resubmission of solved Room 03 challenge (409 CHALLENGE_ALREADY_COMPLETED)', async () => {
      const res = await request(app)
        .post('/api/v1/challenges/ch-qr-01/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          sessionId: activeSessionId,
          actionId: 'ACTION_PEEL_AND_REPORT',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CHALLENGE_ALREADY_COMPLETED');
    });
  });

  describe('PHASE B7C — Room 04 (The Message) Gameplay & Social Engineering Rules', () => {
    it('should access Room 04 with sanitized presentation data and secret answer concealment', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-04-message')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('The Message');
      expect(res.body.data.sectorNumber).toBe(4);

      const challenge = res.body.data.challenge;
      expect(challenge.challengeId).toBe('ch-msg-01');
      expect(challenge.evidence.senderName).toBe('VP Operations — Marcus Vance');
      expect(challenge.evidence.channel).toBe('Direct Telegram Message');
      expect(challenge.availableActions.length).toBe(3);

      // Verify answer secrecy
      expect(challenge.correctActionId).toBeUndefined();
      expect(challenge.hiddenIoCs).toBeUndefined();
      expect(challenge.explanation).toBeUndefined();
    });

    it('should reject Room 05 access before Room 04 is solved (403 PREREQUISITES_INCOMPLETE)', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-05-control')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PREREQUISITES_INCOMPLETE');
    });

    it('POST /challenges/ch-msg-01/hint should reveal social engineering hint and deduct points', async () => {
      const res = await request(app)
        .post('/api/v1/challenges/ch-msg-01/hint')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sessionId: activeSessionId });

      expect(res.status).toBe(200);
      expect(res.body.data.hint).toBeDefined();
      expect(res.body.data.scorePenaltyApplied).toBe(75);
    });

    it('should solve Room 04 by verifying out-of-band and advance to Sector 05', async () => {
      const res = await request(app)
        .post('/api/v1/challenges/ch-msg-01/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          sessionId: activeSessionId,
          actionId: 'ACTION_VERIFY_OOB',
          inspectedArtifacts: ['directory_lookup', 'policy_check'],
          timeElapsedSeconds: 22,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isCorrect).toBe(true);
      expect(res.body.data.investigationBonusAwarded).toBe(true);
      expect(res.body.data.roomCompleted).toBe(true);
      expect(res.body.data.nextRoomIndex).toBe(5);

      const session = await GameSession.findById(activeSessionId);
      expect(session.currentRoomIndex).toBe(5);
    });

    it('Anti-Replay: should reject resubmission of solved Room 04 challenge (409 CHALLENGE_ALREADY_COMPLETED)', async () => {
      const res = await request(app)
        .post('/api/v1/challenges/ch-msg-01/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          sessionId: activeSessionId,
          actionId: 'ACTION_VERIFY_OOB',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CHALLENGE_ALREADY_COMPLETED');
    });

    it('Sector 05 Unlocked: Session now has clearance to enter Sector 05 (The Control Room)', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/room-05-control')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('The Control Room');
      expect(res.body.data.sectorNumber).toBe(5);
    });
  });

  describe('Adaptive Education & Consequence Deep Dive (Rooms 03 & 04)', () => {
    let altSessionId = '';

    beforeAll(async () => {
      const altSession = await GameSession.create({
        userId,
        currentRoomIndex: 3,
        livesRemaining: 3,
        status: GAME_STATUS.IN_PROGRESS,
      });
      altSessionId = altSession._id;
    });

    afterAll(async () => {
      await GameSession.findByIdAndDelete(altSessionId);
      await ChallengeAttempt.deleteMany({ sessionId: altSessionId });
    });

    it('Room 03 Quishing Failure: should deduct life and generate educational debrief on rogue APK', async () => {
      const res = await request(app)
        .post('/api/v1/challenges/ch-qr-01/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          sessionId: altSessionId,
          actionId: 'ACTION_SYNC_EQUIPMENT', // Dangerous action
          inspectedArtifacts: [],
          timeElapsedSeconds: 10,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isCorrect).toBe(false);
      expect(res.body.data.lifeDelta).toBe(-1);
      expect(res.body.data.livesRemaining).toBe(2);

      const intervention = res.body.data.intervention;
      expect(intervention.payload.whatHappened).toContain('sticker');
      expect(intervention.payload.evidence).toContain('.apk');
    });

    it('Room 04 Social Engineering Failure: should deduct life and generate educational debrief on OTP disclosure', async () => {
      // Advance altSession clearance to room 4
      await GameSession.findByIdAndUpdate(altSessionId, { currentRoomIndex: 4 });

      const res = await request(app)
        .post('/api/v1/challenges/ch-msg-01/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          sessionId: altSessionId,
          actionId: 'ACTION_DISCLOSE_OTP', // Catastrophic failure: surrendering OTP
          inspectedArtifacts: [],
          timeElapsedSeconds: 8,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isCorrect).toBe(false);
      expect(res.body.data.lifeDelta).toBe(-1);
      expect(res.body.data.livesRemaining).toBe(1);

      const intervention = res.body.data.intervention;
      expect(intervention.payload.whatHappened).toContain('impersonated');
      expect(intervention.payload.whyDangerous).toContain('OTP');
    });
  });
});
