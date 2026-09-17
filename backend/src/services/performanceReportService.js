import { GameSession } from '../models/GameSession.js';
import { ChallengeAttempt } from '../models/ChallengeAttempt.js';
import { Achievement } from '../models/Achievement.js';
import { AppError } from '../utils/AppError.js';
import { GAME_STATUS } from '../utils/constants.js';

export const ROOM_TOPIC_MAP = {
  'room-01-inbox': 'phishing',
  'room-02-vault': 'password_security',
  'room-03-scanner': 'qr_security',
  'room-04-message': 'social_engineering',
  'room-05-control': 'multi_threat',
};

export const TOPIC_RECOMMENDATIONS = {
  phishing: 'Always inspect the exact root domain URL after the @ symbol, review raw SPF/DKIM headers, and navigate directly to bookmarked official portals rather than clicking urgency-driven links.',
  password_security: 'Mandate unique, random 16+ character passphrases stored in a password manager, avoid credential reuse across environments, and enforce FIDO2 hardware tokens or WebAuthn.',
  qr_security: 'Treat QR codes with identical suspicion to unverified URLs. Always preview the decoded destination, check for physical adhesive sticker overlays, and never authorize connections from untrusted optical prompts.',
  social_engineering: 'Attackers exploit authority, urgency, and fear. Never disclose multi-factor authentication tokens or administrative credentials, and always independently verify urgent requests via official out-of-band communication channels.',
  multi_threat: 'During concurrent multi-vector intrusions, triage containment by active data exfiltration and critical infrastructure first before addressing perimeter decoy alarms.',
};

/**
 * Authoritatively compiles a comprehensive Cybersecurity Performance Report for a completed escape session.
 *
 * Requirements:
 * - Session must exist and belong to the authenticated user.
 * - Session must be in COMPLETED status.
 * - Topic mastery calculated via: (successful decisions in topic / total actions in topic) * 100.
 * - Strongest skill: Highest mastery with lowest hint usage considered.
 * - Weakest skill: Lowest accuracy and/or highest life losses.
 * - Actionable recommendation targeting the primary vulnerability.
 */
export async function generatePerformanceReport(sessionId, userId) {
  const session = await GameSession.findById(sessionId);

  if (!session) {
    throw new AppError('Game session not found.', 404, 'SESSION_NOT_FOUND');
  }

  if (session.userId.toString() !== userId.toString()) {
    throw new AppError('Access denied: You do not have clearance for this game report.', 403, 'FORBIDDEN_REPORT_ACCESS');
  }

  if (session.status !== GAME_STATUS.COMPLETED) {
    throw new AppError(
      `Performance report is only generated for completed escape sessions. Current status: ${session.status}`,
      400,
      'REPORT_NOT_AVAILABLE'
    );
  }

  const attempts = await ChallengeAttempt.find({ sessionId: session._id }).sort({ timestamp: 1 });
  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter((a) => a.isCorrect).length;
  const mistakes = attempts.filter((a) => !a.isCorrect).length;
  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 100;

  const startTime = session.startTime || session.createdAt || new Date();
  const completionTime = session.completionTime || new Date();
  const totalDurationSeconds = Math.max(1, Math.round((completionTime.getTime() - startTime.getTime()) / 1000));

  const uniqueSolvedChallenges = new Set(attempts.filter((a) => a.isCorrect).map((a) => a.challengeId)).size;
  const challengesCompleted = uniqueSolvedChallenges > 0 ? uniqueSolvedChallenges : correctAttempts;

  const topics = ['phishing', 'password_security', 'qr_security', 'social_engineering', 'multi_threat'];
  const topicStats = {};

  for (const topic of topics) {
    const topicAttempts = attempts.filter((a) => ROOM_TOPIC_MAP[a.roomId] === topic);
    const totalActions = topicAttempts.length;
    const successfulDecisions = topicAttempts.filter((a) => a.isCorrect).length;
    const topicHints = topicAttempts.reduce((sum, a) => sum + (a.hintsUsed || 0), 0);
    const topicMistakes = topicAttempts.filter((a) => !a.isCorrect).length;
    const topicLifeLosses = topicAttempts
      .filter((a) => !a.isCorrect)
      .reduce((sum, a) => sum + Math.abs(a.lifeDelta || 1), 0);

    // Topic mastery formula: (successful decisions in topic / total actions in topic) * 100
    const masteryPercentage = totalActions > 0 ? Math.round((successfulDecisions / totalActions) * 100) : 100;

    topicStats[topic] = {
      topic,
      totalActions,
      successfulDecisions,
      masteryPercentage,
      topicHints,
      topicMistakes,
      topicLifeLosses,
    };
  }

  // Strongest skill: Highest mastery with lowest hint usage considered
  const sortedByStrength = [...topics].sort((tA, tB) => {
    const a = topicStats[tA];
    const b = topicStats[tB];
    if (b.masteryPercentage !== a.masteryPercentage) {
      return b.masteryPercentage - a.masteryPercentage; // Highest first
    }
    return a.topicHints - b.topicHints; // Lowest hints first
  });
  const strongestSkill = sortedByStrength[0];

  // Weakest skill / primary vulnerability: Lowest accuracy / highest life losses
  const sortedByWeakness = [...topics].sort((tA, tB) => {
    const a = topicStats[tA];
    const b = topicStats[tB];
    if (a.masteryPercentage !== b.masteryPercentage) {
      return a.masteryPercentage - b.masteryPercentage; // Lowest accuracy first
    }
    if (b.topicLifeLosses !== a.topicLifeLosses) {
      return b.topicLifeLosses - a.topicLifeLosses; // Highest life loss first
    }
    return b.topicMistakes - a.topicMistakes; // Highest mistakes first
  });
  const weakestSkill = sortedByWeakness[0];

  const badges = await Achievement.find({ userId: session.userId }).sort({ earnedAt: -1 });

  return {
    sessionId: session._id,
    userId: session.userId,
    status: session.status,
    difficulty: session.difficulty || 'beginner',
    overallScore: session.currentScore,
    finalScore: session.currentScore,
    normalizedScore: session.normalizedScore ?? null,
    accuracy,
    accuracyPercentage: accuracy,
    livesRemaining: session.livesRemaining,
    completionTime: session.completionTime,
    totalDurationSeconds,
    challengesCompleted,
    hintsUsed: session.hintsUsed ? session.hintsUsed.length : 0,
    hintsUsedCount: session.hintsUsed ? session.hintsUsed.length : 0,
    mistakes,
    totalMistakes: mistakes,
    topicMastery: {
      phishing: topicStats.phishing.masteryPercentage,
      password_security: topicStats.password_security.masteryPercentage,
      qr_security: topicStats.qr_security.masteryPercentage,
      social_engineering: topicStats.social_engineering.masteryPercentage,
      multi_threat: topicStats.multi_threat.masteryPercentage,
      passwordSecurity: topicStats.password_security.masteryPercentage,
      qrSecurity: topicStats.qr_security.masteryPercentage,
      socialEngineering: topicStats.social_engineering.masteryPercentage,
      multiThreat: topicStats.multi_threat.masteryPercentage,
    },
    topicScores: {
      phishing: topicStats.phishing.masteryPercentage,
      passwordSecurity: topicStats.password_security.masteryPercentage,
      qrSecurity: topicStats.qr_security.masteryPercentage,
      socialEngineering: topicStats.social_engineering.masteryPercentage,
      multiThreat: topicStats.multi_threat.masteryPercentage,
    },
    strongestSkill,
    weakestSkill,
    primaryVulnerability: weakestSkill,
    personalizedRecommendation: TOPIC_RECOMMENDATIONS[weakestSkill] || TOPIC_RECOMMENDATIONS.multi_threat,
    personalizedActionableRecommendation: TOPIC_RECOMMENDATIONS[weakestSkill] || TOPIC_RECOMMENDATIONS.multi_threat,
    badgesEarned: badges.map((b) => b.badgeCode),
  };
}
