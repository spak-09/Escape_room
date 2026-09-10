import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/db.js';
import { User } from '../../src/models/User.js';
import { KnowledgeAssessment } from '../../src/models/KnowledgeAssessment.js';

describe('Phase B3: Knowledge Assessment & Baseline Profiling Integration', () => {
  const testRunId = Date.now();
  let user1Token = '';
  let user2Token = '';
  let user1Id = '';
  let user2Id = '';

  beforeAll(async () => {
    await connectDB();
    await User.init();
    await KnowledgeAssessment.init();

    // Register User 1
    const res1 = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: `cadet_assess_1_${testRunId}`,
        email: `cadet_assess_1_${testRunId}@facility.local`,
        password: 'Password123!',
      });
    user1Token = res1.body.data.accessToken;
    user1Id = res1.body.data.user._id;

    // Register User 2
    const res2 = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: `cadet_assess_2_${testRunId}`,
        email: `cadet_assess_2_${testRunId}@facility.local`,
        password: 'Password123!',
      });
    user2Token = res2.body.data.accessToken;
    user2Id = res2.body.data.user._id;
  });

  afterAll(async () => {
    await Promise.all([
      User.deleteMany({ email: new RegExp(`cadet_assess_`) }),
      KnowledgeAssessment.deleteMany({ userId: { $in: [user1Id, user2Id] } }),
    ]);
    await disconnectDB();
  });

  describe('POST /api/v1/assessment', () => {
    it('should reject unauthenticated submission (401 TOKEN_MISSING)', async () => {
      const res = await request(app)
        .post('/api/v1/assessment')
        .send({
          phishingConfidence: 4,
          passwordConfidence: 4,
          qrConfidence: 3,
          socialConfidence: 2,
          tutorialRequested: true,
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('TOKEN_MISSING');
    });

    it('should reject submission with missing required fields (400 VALIDATION_ERROR)', async () => {
      const res = await request(app)
        .post('/api/v1/assessment')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          passwordConfidence: 4,
          qrConfidence: 3,
          // phishingConfidence and socialConfidence omitted
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject ratings outside the 1 to 5 range (400 VALIDATION_ERROR)', async () => {
      const res = await request(app)
        .post('/api/v1/assessment')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          phishingConfidence: 0, // invalid (< 1)
          passwordConfidence: 6, // invalid (> 5)
          qrConfidence: 3,
          socialConfidence: 4,
          tutorialRequested: false,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should successfully submit baseline assessment and calculate baseline profile', async () => {
      const res = await request(app)
        .post('/api/v1/assessment')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          phishingConfidence: 5,
          passwordConfidence: 3,
          qrConfidence: 4,
          socialConfidence: 2,
          tutorialRequested: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.assessment.phishingConfidence).toBe(5);
      expect(res.body.data.assessment.passwordConfidence).toBe(3);
      expect(res.body.data.assessment.qrConfidence).toBe(4);
      expect(res.body.data.assessment.socialConfidence).toBe(2);
      expect(res.body.data.assessment.tutorialRequested).toBe(true);

      // Verify baseline profile calculation
      const profile = res.body.data.profile;
      expect(profile.averageConfidence).toBe(3.5); // (5+3+4+2)/4 = 3.5
      expect(profile.perceivedStrongest).toBe('phishing');
      expect(profile.perceivedWeakest).toBe('social_engineering');
      expect(profile.tutorialRequested).toBe(true);
    });

    it('should support re-submission/update without duplicate key error', async () => {
      const res = await request(app)
        .post('/api/v1/assessment')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          phishingConfidence: 4,
          passwordConfidence: 4,
          qrConfidence: 4,
          socialConfidence: 4,
          tutorialRequested: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.assessment.phishingConfidence).toBe(4);
      expect(res.body.data.profile.averageConfidence).toBe(4.0);
      expect(res.body.data.profile.tutorialRequested).toBe(false);
    });
  });

  describe('GET /api/v1/assessment (Retrieval & User Isolation)', () => {
    it('should return 404 if user has not completed assessment yet', async () => {
      const res = await request(app)
        .get('/api/v1/assessment')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ASSESSMENT_NOT_FOUND');
    });

    it('should retrieve authenticated user assessment with complete profile', async () => {
      const res = await request(app)
        .get('/api/v1/assessment')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.assessment.phishingConfidence).toBe(4);
      expect(res.body.data.profile).toBeDefined();
    });

    it('should maintain strict user isolation (User 2 submission does not affect User 1)', async () => {
      // User 2 submits distinct assessment
      await request(app)
        .post('/api/v1/assessment')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          phishingConfidence: 1,
          passwordConfidence: 1,
          qrConfidence: 2,
          socialConfidence: 1,
          tutorialRequested: true,
        });

      // User 2 retrieval
      const res2 = await request(app)
        .get('/api/v1/assessment')
        .set('Authorization', `Bearer ${user2Token}`);
      expect(res2.body.data.assessment.phishingConfidence).toBe(1);
      expect(res2.body.data.profile.averageConfidence).toBe(1.25);

      // User 1 retrieval remains unchanged
      const res1 = await request(app)
        .get('/api/v1/assessment')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(res1.body.data.assessment.phishingConfidence).toBe(4);
      expect(res1.body.data.profile.averageConfidence).toBe(4.0);
    });
  });
});
