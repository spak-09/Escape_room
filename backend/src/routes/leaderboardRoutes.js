import { Router } from 'express';
import * as leaderboardController from '../controllers/leaderboardController.js';

export const leaderboardRouter = Router();

leaderboardRouter.get('/', leaderboardController.getLeaderboard);
