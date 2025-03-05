// Define prop type for the component
interface StudentViewProps {
  data: {
    student: any;
    guardians: any[];
    results?: any[];
    wellnessRecords?: any[];
    finances?: {
      collectedFees?: any[];
      payableFees?: any[];
    };
    documents?: any[];
  };
}

// Add these types at the top of StudentView.tsx
interface CollectedFee {
  id: string;
  balance: string;
  credit?: number | null;
  debit?: number | null;
  description: string;
  transactionDate?: Date;
}

interface PayableFee {
  id: string;
  amount: number;
  arrears: number;
  dueDate?: Date;
}

interface StudentFinances {
  collectedFees?: CollectedFee[];
  payableFees?: PayableFee[];
}

// Update the StudentViewProps interface
interface StudentViewProps {
  data: {
    student: any;
    guardians: any[];
    results?: any[];
    wellnessRecords?: any[];
    finances?: StudentFinances;
    documents?: any[];
  };
}
