import { z } from 'zod';

export const submitAssessmentSchema = z.object({
  body: z.object({
    phishingConfidence: z
      .number({ required_error: 'Phishing confidence is required' })
      .int('Confidence must be an integer')
      .min(1, 'Phishing confidence must be between 1 and 5')
      .max(5, 'Phishing confidence must be between 1 and 5'),
    passwordConfidence: z
      .number({ required_error: 'Password confidence is required' })
      .int('Confidence must be an integer')
      .min(1, 'Password confidence must be between 1 and 5')
      .max(5, 'Password confidence must be between 1 and 5'),
    qrConfidence: z
      .number({ required_error: 'QR confidence is required' })
      .int('Confidence must be an integer')
      .min(1, 'QR confidence must be between 1 and 5')
      .max(5, 'QR confidence must be between 1 and 5'),
    socialConfidence: z
      .number({ required_error: 'Social engineering confidence is required' })
      .int('Confidence must be an integer')
      .min(1, 'Social engineering confidence must be between 1 and 5')
      .max(5, 'Social engineering confidence must be between 1 and 5'),
    tutorialRequested: z.boolean().default(false),
  }),
});
