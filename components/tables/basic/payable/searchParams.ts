// src/components/tables/main/searchParams.ts
import { z } from 'zod';

export const payableSearchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().optional(),
  sort: z.string().default('admissionNumber.asc'),
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

// Define types based on the Zod schema
export type PayableSearchParams = z.infer<typeof payableSearchParamsSchema>;

export const initialPayableSearchParams: Omit<
  PayableSearchParams,
  'campusTitles' | 'intakeGroupTitles' | 'email'
> = {
  page: 1,
  per_page: 10,
  sort: 'admissionNumber.asc',
  search: '',
};

export const extraParams: Pick<
  PayableSearchParams,
  'email' | 'campusTitles' | 'intakeGroupTitles'
> = {
  email: '',
  campusTitles: [],
  intakeGroupTitles: [],
};
