import { z } from 'zod';

export const getRoomSchema = z.object({
  params: z.object({
    roomId: z.string().trim().min(1, 'Room identifier is required'),
  }),
});
