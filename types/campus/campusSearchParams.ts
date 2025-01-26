import { z } from 'zod';

// Define the schema for staff search parameters without email
export const campusSearchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().optional(),
  sort: z.string().default('title.asc'),
  search: z.string().optional(),
});

// Define types based on the Zod schema
export type CampusSearchParams = z.infer<typeof campusSearchParamsSchema>;

// Provide initial values for search parameters
export const initialStaffSearchParams: CampusSearchParams = {
  page: 1,
  per_page: 10,
  sort: 'username.asc',
  search: '',
};
