import { z } from 'zod';

export const getReportSchema = z.object({
  params: z.object({
    sessionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Valid 24-character hex MongoDB ObjectId required for sessionId'),
  }),
});
