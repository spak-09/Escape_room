import mongoose from 'mongoose';

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
    finalScore: {
      type: Number,
      required: [true, 'Final score is required'],
      min: 0,
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

// High performance index for leaderboard sorting
leaderboardEntrySchema.index({ finalScore: -1, totalDurationSeconds: 1 });

export const LeaderboardEntry = mongoose.model('LeaderboardEntry', leaderboardEntrySchema);
