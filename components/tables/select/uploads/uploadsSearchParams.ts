// src/components/tables/main/staffSearchParams.ts
import { z } from 'zod';

export const uploadsSearchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().optional(),
  sort: z.string().default('title.asc'),
  search: z.string().optional(),
  intakeGroupTitles: z.preprocess(
    (val) =>
      typeof val === 'string' ? decodeURIComponent(val).split(',') : val,
    z.array(z.string()).optional()
  ),
});

// Define types based on the Zod schema
export type UploadsSearchParams = z.infer<typeof uploadsSearchParamsSchema>;

// export const initialUploadSearchParams: UploadsSearchParams = {
//   page: 1,
//   per_page: 10,
//   sort: 'username.asc',
//   search: '',
// };

export const initialUploadsSearchParams: Omit<
  UploadsSearchParams,
  'intakeGroupTitles'
> = {
  page: 1,
  per_page: 10,
  sort: 'username.asc',
  search: '',
};

export const extraParams: Pick<UploadsSearchParams, 'intakeGroupTitles'> = {
  intakeGroupTitles: [],
};
