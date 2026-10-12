import { z } from 'zod';

export const addressQuerySchema = z.object({
  text: z.string().trim().min(2, 'Type at least 2 characters').max(200),
});
