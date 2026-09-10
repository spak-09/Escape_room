import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const standardRateLimitHandler = (req, res) => {
  return res.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests generated from this client. Please retry later.',
      details: null,
    },
  });
};

const isTest = env.NODE_ENV === 'test';

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isTest ? 10000 : 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardRateLimitHandler,
  skip: () => isTest,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 10000 : 10, // 10 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardRateLimitHandler,
  skip: () => isTest,
});

export const challengeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isTest ? 10000 : 30, // 30 challenge actions per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardRateLimitHandler,
  skip: () => isTest,
});
