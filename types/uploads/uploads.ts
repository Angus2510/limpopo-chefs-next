import { z } from 'zod';

export const uploadsSearchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().default('title.asc'),
  search: z.string().optional(),
  intakeGroupTitles: z.preprocess(
    (val) =>
      typeof val === 'string' ? decodeURIComponent(val).split(',') : val,
    z.array(z.string()).optional()
  ),
});

export type UploadsSearchParams = z.infer<typeof uploadsSearchParamsSchema>;
