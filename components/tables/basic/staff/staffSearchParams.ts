// src/components/tables/main/staffSearchParams.ts
import { z } from 'zod';

export const staffSearchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().optional(),
  sort: z.string().default('username.asc'),
  search: z.string().optional(),
  email: z.string().optional(),
});

// Define types based on the Zod schema
export type StaffSearchParams = z.infer<typeof staffSearchParamsSchema>;

export const initialStaffSearchParams: Omit<StaffSearchParams, 'email'> = {
  page: 1,
  per_page: 10,
  sort: 'username.asc',
  search: '',
};

export const extraStaffParams: Pick<StaffSearchParams, 'email'> = {
  email: '',
};
