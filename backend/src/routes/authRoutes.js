import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { registerSchema, loginSchema } from '../validation/authSchemas.js';
import { authLimiter } from '../middleware/rateLimiter.js';

export const authRouter = Router();

authRouter.post('/register', validateRequest(registerSchema), authController.register);
authRouter.post('/login', authLimiter, validateRequest(loginSchema), authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', authMiddleware, authController.getMe);
