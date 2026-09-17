import mongoose from 'mongoose';
import { DIFFICULTY_LEVELS } from '../utils/constants.js';

const leaderboardEntrySchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GameSession',
      required: [true, 'Session reference is required'],
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    username: {
      type: String,
      required: [true, 'Player username is required'],
    },
    difficulty: {
      type: String,
      enum: Object.values(DIFFICULTY_LEVELS),
      default: DIFFICULTY_LEVELS.BEGINNER,
      required: true,
      index: true,
    },
    finalScore: {
      type: Number,
      required: [true, 'Final score is required'],
      min: 0,
    },
    normalizedScore: {
      type: Number,
      required: [true, 'Normalized score is required'],
      min: 0,
      max: 100,
      default: 0,
    },
    totalDurationSeconds: {
      type: Number,
      required: [true, 'Total duration in seconds is required'],
      min: 0,
    },
    accuracyPercentage: {
      type: Number,
      required: [true, 'Accuracy percentage is required'],
      min: 0,
      max: 100,
    },
    livesRemaining: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    badgesEarned: {
      type: [String],
      default: [],
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// High performance indexes for leaderboard sorting
leaderboardEntrySchema.index({ difficulty: 1, normalizedScore: -1, totalDurationSeconds: 1 });
leaderboardEntrySchema.index({ finalScore: -1, totalDurationSeconds: 1 });

export const LeaderboardEntry = mongoose.model('LeaderboardEntry', leaderboardEntrySchema);
