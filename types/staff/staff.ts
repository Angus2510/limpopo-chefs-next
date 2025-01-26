import { z } from 'zod';

export const staffSearchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().default('username.asc'),
  search: z.string().optional(),
  email: z.string().optional(),
});

export type StaffSearchParams = z.infer<typeof staffSearchParamsSchema>;
