import { z } from 'zod';

const SAFE_IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]+$/;

export const analyzeFoodRequestSchema = z
  .object({
    entryId: z.string().min(1).regex(SAFE_IDENTIFIER_PATTERN),

    photoPath: z.string().min(1),

    photoUrl: z.url(),

    comment: z.string().max(1_000),

    language: z.enum(['en', 'ru']),
  })
  .strict();

export type AnalyzeFoodRequest = z.infer<typeof analyzeFoodRequestSchema>;
