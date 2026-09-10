import { Router } from 'express';
import { authRouter } from './authRoutes.js';
import { assessmentRouter } from './assessmentRoutes.js';
import { sessionRouter } from './sessionRoutes.js';
import { roomRouter } from './roomRoutes.js';
import { challengeRouter } from './challengeRoutes.js';
import { reportRouter } from './reportRoutes.js';
import { dashboardRouter } from './dashboardRoutes.js';
import { leaderboardRouter } from './leaderboardRoutes.js';

export const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'operational',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    },
  });
});

// Authenticated Identity Tier (Phase B2)
apiRouter.use('/auth', authRouter);

// Knowledge Assessment & Baseline Profiling (Phase B3)
apiRouter.use('/assessment', assessmentRouter);

// Authoritative Game Session Lifecycle (Phase B4)
apiRouter.use('/session', sessionRouter);

// Sequential Sector Access & Presentation (Phase B4)
apiRouter.use('/rooms', roomRouter);

// Server-Authoritative Challenge Execution (Phase B6)
apiRouter.use('/challenges', challengeRouter);

// Cybersecurity Performance Reports (Phase B8)
apiRouter.use('/reports', reportRouter);

// Player Dashboard & Career Hub (Phase B9)
apiRouter.use('/dashboard', dashboardRouter);

// Verified Escape Leaderboard (Phase B9 / Phase 10)
apiRouter.use('/leaderboard', leaderboardRouter);
