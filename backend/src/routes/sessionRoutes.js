import { Router } from 'express';
import * as sessionController from '../controllers/sessionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export const sessionRouter = Router();

sessionRouter.use(authMiddleware);

sessionRouter.post('/start', sessionController.start);
sessionRouter.get('/active', sessionController.getActive);
sessionRouter.post('/abandon', sessionController.abandon);
