import { z } from "zod";

export const campusSearchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().default("title.asc"),
  search: z.string().optional(),
});

export type CampusSearchParams = z.infer<typeof campusSearchParamsSchema>;
export interface Campus {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampusInput {
  title: string;
}
