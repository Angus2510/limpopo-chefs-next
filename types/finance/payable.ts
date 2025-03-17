export interface GetPayableSchema {
  page: number;
  per_page: number;
  sort: string;
  search?: string;
  email?: string;
  campusTitles?: string[];
  intakeGroupTitles?: string[];
  startDate?: string;
  endDate?: string;
  paymentStatus?: "PAID" | "PENDING" | "OVERDUE";
}
