import mongoose from 'mongoose';

const challengeAttemptSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GameSession',
      required: [true, 'Session reference is required'],
      index: true,
    },
    roomId: {
      type: String,
      required: [true, 'Room identifier is required'],
    },
    challengeId: {
      type: String,
      required: [true, 'Challenge identifier is required'],
    },
    actionTaken: {
      type: String,
      required: [true, 'Action taken identifier is required'],
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    lifeDelta: {
      type: Number,
      default: 0,
    },
    scoreDelta: {
      type: Number,
      default: 0,
    },
    hintsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    hintsUsedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    timeElapsedSeconds: {
      type: Number,
      default: 0,
    },
    inspectedArtifacts: {
      type: [String],
      default: [],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for analyzing topic/challenge performance within a session
challengeAttemptSchema.index({ sessionId: 1, challengeId: 1 });
challengeAttemptSchema.index({ sessionId: 1, roomId: 1 });

export const ChallengeAttempt = mongoose.model('ChallengeAttempt', challengeAttemptSchema);
