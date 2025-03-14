export interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  campuses: string;
  idNumber: string;
  profileBlocked: string;
  payableAmounts: string;
  payableDueDates: string;
  cityAndGuildNumber: string;
  admissionDate: string;
}

export interface StudentFinances {
  collectedFees: Array<{
    id: string;
    balance: string;
    credit?: number | null;
    debit?: number | null;
    description: string;
    transactionDate?: Date;
  }>;
  payableFees: Array<{
    id: string;
    amount: number;
    arrears: number;
    dueDate?: Date;
  }>;
}

export interface BalanceAdjustment {
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: Date;
}
