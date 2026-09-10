import mongoose from 'mongoose';
import { GAME_STATUS, INITIAL_LIVES } from '../utils/constants.js';

const gameSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    currentRoomIndex: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    currentChallengeIndex: {
      type: Number,
      default: 0,
      min: 0,
    },
    livesRemaining: {
      type: Number,
      default: INITIAL_LIVES,
      min: 0,
      max: INITIAL_LIVES,
    },
    currentScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    hintsUsed: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(GAME_STATUS),
      default: GAME_STATUS.NOT_STARTED,
      index: true,
    },
    startTime: {
      type: Date,
      default: null,
    },
    completionTime: {
      type: Date,
      default: null,
    },
    containmentState: {
      activeThreats: {
        type: [String],
        default: ['threat_phish_c2', 'threat_vault_creds', 'threat_social_helpdesk', 'threat_qr_kiosk'],
      },
      containedThreats: {
        type: [String],
        default: [],
      },
      containmentSequence: {
        type: [String],
        default: [],
      },
      isFullyContained: {
        type: Boolean,
        default: false,
      },
    },
    isLeaderboardEligible: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient active session queries
gameSessionSchema.index({ userId: 1, status: 1 });

export const GameSession = mongoose.model('GameSession', gameSessionSchema);
