import { z } from 'zod';

export const searchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  search: z.string().optional(),
  email: z.string().optional(),
  campusTitles: z.preprocess(
    (val) =>
      typeof val === 'string' ? decodeURIComponent(val).split(',') : val,
    z.array(z.string()).optional()
  ),
  intakeGroupTitles: z.preprocess(
    (val) =>
      typeof val === 'string' ? decodeURIComponent(val).split(',') : val,
    z.array(z.string()).optional()
  ),
});

export type GetStudentsSchema = z.infer<typeof searchParamsSchema>;
