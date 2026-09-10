import { KnowledgeAssessment } from '../models/KnowledgeAssessment.js';
import { AppError } from '../utils/AppError.js';
import { TOPICS } from '../utils/constants.js';

/**
 * Calculates user's baseline confidence profile for later adaptive learning reference.
 * Note: Self-reported confidence does NOT permanently determine game difficulty (per Master Plan).
 */
export function calculateBaselineProfile(assessment) {
  const topics = [
    { topic: TOPICS.PHISHING, rating: assessment.phishingConfidence },
    { topic: TOPICS.PASSWORD_SECURITY, rating: assessment.passwordConfidence },
    { topic: TOPICS.QR_SECURITY, rating: assessment.qrConfidence },
    { topic: TOPICS.SOCIAL_ENGINEERING, rating: assessment.socialConfidence },
  ];

  const total = topics.reduce((acc, t) => acc + t.rating, 0);
  const averageConfidence = Number((total / topics.length).toFixed(2));

  // Sort to identify perceived strengths and weaknesses
  const sorted = [...topics].sort((a, b) => b.rating - a.rating);
  const perceivedStrongest = sorted[0].topic;
  const perceivedWeakest = sorted[sorted.length - 1].topic;

  return {
    averageConfidence,
    perceivedStrongest,
    perceivedWeakest,
    tutorialRequested: assessment.tutorialRequested,
  };
}

/**
 * Persists or updates the authenticated player's baseline confidence survey.
 */
export async function saveAssessment({
  userId,
  phishingConfidence,
  passwordConfidence,
  qrConfidence,
  socialConfidence,
  tutorialRequested,
}) {
  const assessment = await KnowledgeAssessment.findOneAndUpdate(
    { userId },
    {
      phishingConfidence,
      passwordConfidence,
      qrConfidence,
      socialConfidence,
      tutorialRequested: Boolean(tutorialRequested),
      completedAt: new Date(),
    },
    { upsert: true, new: true, runValidators: true }
  );

  const profile = calculateBaselineProfile(assessment);

  return {
    assessment,
    profile,
  };
}

/**
 * Retrieves the authenticated player's baseline assessment.
 */
export async function getAssessmentByUserId(userId) {
  const assessment = await KnowledgeAssessment.findOne({ userId });

  if (!assessment) {
    throw new AppError('Baseline security assessment not found for this cadet.', 404, 'ASSESSMENT_NOT_FOUND');
  }

  const profile = calculateBaselineProfile(assessment);

  return {
    assessment,
    profile,
  };
}
