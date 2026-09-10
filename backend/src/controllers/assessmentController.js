import * as assessmentService from '../services/assessmentService.js';

/**
 * Submit or update baseline knowledge and confidence assessment.
 */
export async function submitAssessment(req, res, next) {
  try {
    const userId = req.user.id;
    const { phishingConfidence, passwordConfidence, qrConfidence, socialConfidence, tutorialRequested } = req.body;

    const result = await assessmentService.saveAssessment({
      userId,
      phishingConfidence,
      passwordConfidence,
      qrConfidence,
      socialConfidence,
      tutorialRequested,
    });

    return res.status(200).json({
      success: true,
      data: {
        assessment: result.assessment,
        profile: result.profile,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Retrieve the authenticated user's baseline assessment and profile.
 */
export async function getAssessment(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await assessmentService.getAssessmentByUserId(userId);

    return res.status(200).json({
      success: true,
      data: {
        assessment: result.assessment,
        profile: result.profile,
      },
    });
  } catch (error) {
    return next(error);
  }
}
