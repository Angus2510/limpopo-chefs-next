import { z } from 'zod';

// Define the schema for staff search parameters
export const campusSearchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().optional(),
  sort: z.string().default('title.asc'),
  search: z.string().optional(),
  email: z.string().optional(),
});

export type CampusSearchParams = z.infer<typeof campusSearchParamsSchema>;

export const initialStaffSearchParams: CampusSearchParams = {
  page: 1,
  per_page: 10,
  sort: 'title.asc',
  search: '',
};
