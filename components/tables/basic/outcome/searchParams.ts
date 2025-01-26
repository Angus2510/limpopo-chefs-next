// src/components/tables/main/searchParams.ts
import { z } from 'zod';

export const outcomeSearchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().optional(),
  sort: z.string().default('title.asc'),
  search: z.string().optional(),
  type: z.string().optional(),
  hidden: z.string().optional(),
});

// Define types based on the Zod schema
export type OutcomeSearchParams = z.infer<typeof outcomeSearchParamsSchema>;

export const initialOutcomeSearchParams: Omit<
  OutcomeSearchParams,
  'type' | 'hidden'
> = {
  page: 1,
  per_page: 10,
  sort: 'title.asc',
  search: '',
};

export const extraParams: Pick<OutcomeSearchParams, 'type' | 'hidden'> = {
  type: '',
  hidden: '',
};
