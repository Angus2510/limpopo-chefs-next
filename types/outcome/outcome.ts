import { z } from 'zod';

export const searchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  search: z.string().optional(),
  type: z.string().optional(),
  hidden: z.string().optional(),
});

export type GetOutcomeSchema = z.infer<typeof searchParamsSchema>;
