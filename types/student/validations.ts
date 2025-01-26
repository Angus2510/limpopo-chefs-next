// /types/validations.ts
import { z } from 'zod';

export const searchParamsSchema = z.object({
  page: z.number().min(1).optional(),
  per_page: z.number().min(1).optional(),
  sort: z.string().optional(),
  firstName: z.string().optional(),
  email: z.string().optional(),
  campusTitles: z.array(z.string()).optional(),
  intakeGroupTitles: z.array(z.string()).optional(),
});

export type GetStudentsSchema = z.infer<typeof searchParamsSchema>;
