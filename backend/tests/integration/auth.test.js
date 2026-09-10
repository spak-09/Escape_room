import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/db.js';
import { User } from '../../src/models/User.js';
import { env } from '../../src/config/env.js';

describe('Phase B2: Authentication & Player Identity API Integration', () => {
  const testRunId = Date.now();
  const testUserData = {
    username: `cadet_auth_${testRunId}`,
    email: `cadet_auth_${testRunId}@facility.local`,
    password: 'ValidPassword123!',
  };

  let validAccessToken = '';
  let validRefreshCookie = '';

  beforeAll(async () => {
    await connectDB();
    await User.init();
  });

  afterAll(async () => {
    await User.deleteMany({ email: new RegExp(`cadet_auth_`) });
    await disconnectDB();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new player, return access token, and set HttpOnly refresh cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUserData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.username).toBe(testUserData.username);
      expect(res.body.data.user.email).toBe(testUserData.email.toLowerCase());
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.accessToken).toBeDefined();

      validAccessToken = res.body.data.accessToken;

      // Verify Set-Cookie header contains refreshToken
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const refreshCookieHeader = cookies.find((c) => c.startsWith('refreshToken='));
      expect(refreshCookieHeader).toBeDefined();
      expect(refreshCookieHeader).toContain('HttpOnly');
      expect(refreshCookieHeader).toContain('SameSite=Strict');

      validRefreshCookie = refreshCookieHeader.split(';')[0];
    });

    it('should reject registration with duplicate email (409 DUPLICATE_EMAIL)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: `another_user_${testRunId}`,
          email: testUserData.email, // duplicate
          password: 'ValidPassword123!',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
      expect(res.body.error.message).toContain('already registered');
    });

    it('should reject registration with duplicate username (409 DUPLICATE_USERNAME)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: testUserData.username, // duplicate
          email: `unique_${testRunId}@facility.local`,
          password: 'ValidPassword123!',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('DUPLICATE_USERNAME');
      expect(res.body.error.message).toContain('already taken');
    });

    it('should reject invalid input: malformed email, short password, invalid username (400 VALIDATION_ERROR)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'a!', // too short and invalid special char
          email: 'not-an-email',
          password: '123', // shorter than 8 chars
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details).toBeInstanceOf(Array);
      expect(res.body.error.details.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should successfully authenticate valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUserData.email,
          password: testUserData.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUserData.email.toLowerCase());
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.accessToken).toBeDefined();

      validAccessToken = res.body.data.accessToken;
      const cookies = res.headers['set-cookie'];
      const refreshCookieHeader = cookies.find((c) => c.startsWith('refreshToken='));
      validRefreshCookie = refreshCookieHeader.split(';')[0];
    });

    it('should reject incorrect password (401 INVALID_CREDENTIALS)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUserData.email,
          password: 'IncorrectPassword999!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(res.body.data).toBeUndefined();
    });

    it('should reject unknown email (401 INVALID_CREDENTIALS) with dummy hash comparison', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: `unknown_${testRunId}@facility.local`,
          password: 'SomePassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should issue a new 15-minute access token when valid refresh cookie is provided', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', [validRefreshCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(typeof res.body.data.accessToken).toBe('string');
    });

    it('should reject refresh when no refresh cookie is provided (401 TOKEN_MISSING)', async () => {
      const res = await request(app).post('/api/v1/auth/refresh');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('TOKEN_MISSING');
    });

    it('should reject refresh when invalid or tampered token is provided (401 TOKEN_INVALID)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', ['refreshToken=tampered.fake.jwt.token']);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('TOKEN_INVALID');
    });
  });

  describe('GET /api/v1/auth/me (Protected Route & authMiddleware)', () => {
    it('should return authenticated player profile with valid Bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${validAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.username).toBe(testUserData.username);
      expect(res.body.data.user.email).toBe(testUserData.email.toLowerCase());
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('should reject request when Authorization header is missing (401 TOKEN_MISSING)', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('TOKEN_MISSING');
    });

    it('should reject request with malformed Bearer token (401 TOKEN_INVALID)', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer totally.invalid.jwt.signature');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('TOKEN_INVALID');
    });

    it('should reject request with expired access token (401 TOKEN_EXPIRED)', async () => {
      // Generate explicitly expired token
      const expiredToken = jwt.sign(
        { userId: '123456789012345678901234', username: 'expired', role: 'player' },
        env.JWT_SECRET,
        { expiresIn: '-1s' }
      );

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('TOKEN_EXPIRED');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should clear refresh token cookie and return success', async () => {
      const res = await request(app).post('/api/v1/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toContain('Logged out successfully');

      // Check that Set-Cookie header clears refreshToken
      const cookies = res.headers['set-cookie'];
      const refreshCookieHeader = cookies.find((c) => c.startsWith('refreshToken='));
      expect(refreshCookieHeader).toBeDefined();
      // An expired or empty cookie signifies clearing
      expect(refreshCookieHeader).toMatch(/refreshToken=;|Expires=Thu, 01 Jan 1970/);
    });
  });
});
