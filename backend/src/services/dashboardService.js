import { GameSession } from '../models/GameSession.js';
import { ChallengeAttempt } from '../models/ChallengeAttempt.js';
import { Achievement } from '../models/Achievement.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { GAME_STATUS } from '../utils/constants.js';
import { ROOM_MANIFESTS } from '../data/challenges/roomManifests.js';
import { ROOM_TOPIC_MAP } from './performanceReportService.js';

/**
 * Compiles a comprehensive player dashboard summary with strict user isolation.
 *
 * Provides:
 * - activeSession: In-progress run details for continue capability (or null)
 * - currentRoom: Active room ID
 * - overallProgress: Percentage towards facility escape (0 - 100)
 * - currentScore: Active session score
 * - currentLives: Active session lives
 * - bestScore: Highest score among completed runs
 * - totalEscapes: Count of completed escapes
 * - gameHistory: Audit history of user's past escape runs
 * - achievements: Earned player badges
 * - topicPerformance: Cumulative mastery % across cybersecurity topics
 */
export async function getDashboardSummary(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }

  // 1. Check for active in-progress escape session
  const activeSessionDoc = await GameSession.findOne({
    userId,
    status: GAME_STATUS.IN_PROGRESS,
  });

  let activeSession = null;
  let currentRoom = null;
  let overallProgress = 0;
  let currentScore = 0;
  let currentLives = 0;

  if (activeSessionDoc) {
    const manifest = ROOM_MANIFESTS[activeSessionDoc.currentRoomIndex - 1];
    currentRoom = manifest ? manifest.id : 'room-01-inbox';
    overallProgress = Math.round(((activeSessionDoc.currentRoomIndex - 1) / 5) * 100);
    currentScore = activeSessionDoc.currentScore;
    currentLives = activeSessionDoc.livesRemaining;

    activeSession = {
      sessionId: activeSessionDoc._id,
      currentRoomIndex: activeSessionDoc.currentRoomIndex,
      currentRoomId: currentRoom,
      currentScore: activeSessionDoc.currentScore,
      livesRemaining: activeSessionDoc.livesRemaining,
      startTime: activeSessionDoc.startTime,
      hintsUsedCount: activeSessionDoc.hintsUsed ? activeSessionDoc.hintsUsed.length : 0,
    };
  }

  // 2. Fetch completed runs for high score and escape count
  const completedRuns = await GameSession.find({
    userId,
    status: GAME_STATUS.COMPLETED,
  }).sort({ currentScore: -1 });

  const bestScore = completedRuns.length > 0 ? completedRuns[0].currentScore : 0;
  const totalEscapes = completedRuns.length;

  if (!activeSession && totalEscapes > 0) {
    overallProgress = 100;
  }

  // 3. User's complete session history (recent 20 runs)
  const allSessions = await GameSession.find({ userId }).sort({ createdAt: -1 }).limit(20);

  const gameHistory = allSessions.map((s) => {
    const startTime = s.startTime || s.createdAt;
    const endTime = s.completionTime;
    const durationSeconds = endTime
      ? Math.max(1, Math.round((endTime.getTime() - startTime.getTime()) / 1000))
      : null;

    return {
      sessionId: s._id,
      status: s.status,
      finalScore: s.currentScore,
      currentScore: s.currentScore,
      livesRemaining: s.livesRemaining,
      currentRoomIndex: s.currentRoomIndex,
      startTime: s.startTime,
      completionTime: s.completionTime,
      durationSeconds,
      date: s.completionTime || s.createdAt,
    };
  });

  // 4. Earned achievements
  const achievements = await Achievement.find({ userId }).sort({ earnedAt: -1 });

  // 5. Cumulative topic mastery calculation
  const sessionIds = allSessions.map((s) => s._id);
  const userAttempts = await ChallengeAttempt.find({ sessionId: { $in: sessionIds } });

  const topics = ['phishing', 'password_security', 'qr_security', 'social_engineering', 'multi_threat'];
  const topicPerformance = {};

  for (const topic of topics) {
    const attemptsInTopic = userAttempts.filter((a) => ROOM_TOPIC_MAP[a.roomId] === topic);
    const total = attemptsInTopic.length;
    const correct = attemptsInTopic.filter((a) => a.isCorrect).length;
    topicPerformance[topic] = total > 0 ? Math.round((correct / total) * 100) : 100;
  }

  return {
    userId: user._id,
    username: user.username,
    email: user.email,
    activeSession,
    currentRoom,
    overallProgress,
    currentScore,
    currentLives,
    bestScore,
    totalEscapes,
    totalSessions: allSessions.length,
    gameHistory,
    achievements: achievements.map((a) => ({
      badgeCode: a.badgeCode,
      title: a.title,
      description: a.description,
      earnedAt: a.earnedAt,
    })),
    topicPerformance: {
      ...topicPerformance,
      passwordSecurity: topicPerformance.password_security,
      qrSecurity: topicPerformance.qr_security,
      socialEngineering: topicPerformance.social_engineering,
      multiThreat: topicPerformance.multi_threat,
    },
  };
}
