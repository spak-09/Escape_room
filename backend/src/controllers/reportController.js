import * as performanceReportService from '../services/performanceReportService.js';

/**
 * Retrieves the compiled Cybersecurity Performance Report for a completed escape session.
 */
export async function getSessionReport(req, res, next) {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const report = await performanceReportService.generatePerformanceReport(sessionId, userId);

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    return next(error);
  }
}
