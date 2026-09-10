import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    badgeCode: {
      type: String,
      required: [true, 'Badge code is required'],
    },
    title: {
      type: String,
      required: [true, 'Achievement title is required'],
    },
    description: {
      type: String,
      required: [true, 'Achievement description is required'],
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate badge awards for the same user
achievementSchema.index({ userId: 1, badgeCode: 1 }, { unique: true });

export const Achievement = mongoose.model('Achievement', achievementSchema);
