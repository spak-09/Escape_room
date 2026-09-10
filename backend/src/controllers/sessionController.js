import * as sessionService from '../services/sessionService.js';

/**
 * Start a new playthrough or resume active playthrough.
 */
export async function start(req, res, next) {
  try {
    const result = await sessionService.startSession(req.user.id);
    const statusCode = result.isResumed ? 200 : 201;

    return res.status(statusCode).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Fetch the authenticated player's active in-progress playthrough.
 */
export async function getActive(req, res, next) {
  try {
    const session = await sessionService.getActiveSession(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        session,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Terminate/abandon an active playthrough.
 */
export async function abandon(req, res, next) {
  try {
    const session = await sessionService.abandonSession(req.user.id, req.body?.sessionId);

    return res.status(200).json({
      success: true,
      data: {
        session,
        message: 'Escape session abandoned.',
      },
    });
  } catch (error) {
    return next(error);
  }
}
