import { Router } from 'express';
import * as challengeController from '../controllers/challengeController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { sessionGuard } from '../middleware/sessionGuard.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { submitChallengeSchema, requestHintSchema } from '../validation/challengeSchemas.js';
import { challengeLimiter } from '../middleware/rateLimiter.js';

export const challengeRouter = Router();

challengeRouter.use(authMiddleware);

// Action submission: Authenticated, Validated by Zod, Guarded for session ownership & state, Rate limited
challengeRouter.post(
  '/:id/submit',
  validateRequest(submitChallengeSchema),
  sessionGuard,
  challengeLimiter,
  challengeController.submitDecision
);

// Hint request: Authenticated, Validated by Zod, Guarded for session ownership & state
challengeRouter.post(
  '/:id/hint',
  validateRequest(requestHintSchema),
  sessionGuard,
  challengeController.requestHint
);
