import mongoose from 'mongoose';

const knowledgeAssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    phishingConfidence: {
      type: Number,
      required: [true, 'Phishing confidence rating is required'],
      min: [1, 'Confidence rating must be between 1 and 5'],
      max: [5, 'Confidence rating must be between 1 and 5'],
    },
    passwordConfidence: {
      type: Number,
      required: [true, 'Password confidence rating is required'],
      min: [1, 'Confidence rating must be between 1 and 5'],
      max: [5, 'Confidence rating must be between 1 and 5'],
    },
    qrConfidence: {
      type: Number,
      required: [true, 'QR confidence rating is required'],
      min: [1, 'Confidence rating must be between 1 and 5'],
      max: [5, 'Confidence rating must be between 1 and 5'],
    },
    socialConfidence: {
      type: Number,
      required: [true, 'Social engineering confidence rating is required'],
      min: [1, 'Confidence rating must be between 1 and 5'],
      max: [5, 'Confidence rating must be between 1 and 5'],
    },
    tutorialRequested: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const KnowledgeAssessment = mongoose.model('KnowledgeAssessment', knowledgeAssessmentSchema);
