import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as dashboardController from '../controllers/dashboardController.js';

export const dashboardRouter = Router();

dashboardRouter.use(authMiddleware);

// Career hub and active session resume state (Phase B9)
dashboardRouter.get('/summary', dashboardController.getDashboardSummary);
dashboardRouter.get('/', dashboardController.getDashboardSummary);
