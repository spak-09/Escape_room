import * as leaderboardService from '../services/leaderboardService.js';

/**
 * Retrieves the global verified facility escape rankings.
 * Publicly accessible (no auth required).
 */
export async function getLeaderboard(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await leaderboardService.getVerifiedLeaderboard({ page, limit });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}
