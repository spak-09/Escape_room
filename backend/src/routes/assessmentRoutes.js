import { Router } from 'express';
import * as assessmentController from '../controllers/assessmentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { submitAssessmentSchema } from '../validation/assessmentSchemas.js';

export const assessmentRouter = Router();

// All assessment operations require authenticated player identity
assessmentRouter.use(authMiddleware);

assessmentRouter.post('/', validateRequest(submitAssessmentSchema), assessmentController.submitAssessment);
assessmentRouter.get('/', assessmentController.getAssessment);
