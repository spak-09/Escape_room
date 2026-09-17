import { LeaderboardEntry } from '../models/LeaderboardEntry.js';

/**
 * Retrieves authoritative, verified facility escape rankings.
 *
 * Requirements:
 * - Only verified completed sessions appear (stored in LeaderboardEntry).
 * - Ordered by finalScore DESC, totalDurationSeconds ASC.
 * - Supports pagination (page, limit).
 * - Assigns authoritative ranks #1, #2, etc.
 */
export async function getVerifiedLeaderboard({ page = 1, limit = 50, difficulty } = {}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (difficulty && difficulty.toLowerCase() !== 'all') {
    filter.difficulty = difficulty.toLowerCase();
  }

  const totalEntries = await LeaderboardEntry.countDocuments(filter);

  const entries = await LeaderboardEntry.find(filter)
    .sort({ normalizedScore: -1, finalScore: -1, totalDurationSeconds: 1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  const rankedLeaderboard = entries.map((entry, index) => {
    const entryDiff = entry.difficulty || 'beginner';
    const fallbackNormalized = entry.normalizedScore != null
      ? entry.normalizedScore
      : Math.min(100, Math.round((entry.finalScore / (entryDiff === 'expert' ? 50000 : entryDiff === 'intermediate' ? 15000 : 5000)) * 100));

    return {
      rank: skip + index + 1,
      id: entry._id,
      sessionId: entry.sessionId,
      userId: entry.userId,
      username: entry.username,
      difficulty: entryDiff,
      finalScore: entry.finalScore,
      normalizedScore: fallbackNormalized,
      totalDurationSeconds: entry.totalDurationSeconds,
      accuracyPercentage: entry.accuracyPercentage,
      livesRemaining: entry.livesRemaining,
      badgesEarned: entry.badgesEarned || [],
      recordedAt: entry.recordedAt,
      isVerified: true,
    };
  });

  return {
    totalEntries,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(totalEntries / limitNum) || 1,
    difficulty: difficulty || 'all',
    leaderboard: rankedLeaderboard,
  };
}
