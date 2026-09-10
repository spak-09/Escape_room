import { z } from 'zod';

export const submitChallengeSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Challenge ID is required in URL parameter'),
  }),
  body: z.object({
    sessionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Valid 24-character hex MongoDB ObjectId required for sessionId'),
    actionId: z.string().min(1, 'Action ID is required'),
    containmentSequence: z.array(z.string()).optional(),
    inspectedArtifacts: z.array(z.string()).default([]),
    timeElapsedSeconds: z.number().nonnegative('timeElapsedSeconds must be >= 0').default(15),
  }),
});

export const requestHintSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Challenge ID is required in URL parameter'),
  }),
  body: z.object({
    sessionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Valid 24-character hex MongoDB ObjectId required for sessionId'),
  }),
});
