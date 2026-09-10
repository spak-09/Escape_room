import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { getReportSchema } from '../validation/reportSchemas.js';
import * as reportController from '../controllers/reportController.js';

export const reportRouter = Router();

// Root route stub preserves Phase 0 test expectations (tests/integration/app.test.js)
reportRouter.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'PHASE_NOT_IMPLEMENTED',
      message: 'The Performance Reports endpoint is scheduled for Phase 8.',
      details: null,
    },
  });
});

// Authoritative session performance report (Phase B8)
reportRouter.get(
  '/:sessionId',
  authMiddleware,
  validateRequest(getReportSchema),
  reportController.getSessionReport
);
