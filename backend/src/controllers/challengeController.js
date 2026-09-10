import * as challengeValidationService from '../services/challengeValidationService.js';

/**
 * Submit an investigative decision on an active challenge.
 */
export async function submitDecision(req, res, next) {
  try {
    const challengeId = req.params.id;
    const { sessionId, actionId, containmentSequence, inspectedArtifacts, timeElapsedSeconds } = req.body;
    const userId = req.user.id;

    const result = await challengeValidationService.submitChallengeAction({
      sessionId,
      challengeId,
      actionId,
      containmentSequence,
      inspectedArtifacts,
      timeElapsedSeconds,
      userId,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Request an authoritative hint with score penalty.
 */
export async function requestHint(req, res, next) {
  try {
    const challengeId = req.params.id;
    const { sessionId } = req.body;

    const result = await challengeValidationService.requestChallengeHint({
      sessionId,
      challengeId,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}
