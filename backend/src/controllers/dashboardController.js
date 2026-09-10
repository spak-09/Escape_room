import * as dashboardService from '../services/dashboardService.js';

/**
 * Retrieves the aggregated player career dashboard, resume state, and achievements.
 */
export async function getDashboardSummary(req, res, next) {
  try {
    const userId = req.user.id;
    const summary = await dashboardService.getDashboardSummary(userId);

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return next(error);
  }
}
