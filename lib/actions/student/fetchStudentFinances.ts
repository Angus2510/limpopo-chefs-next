"use server";
import prisma from "@/lib/db";

interface StudentFinances {
  collectedFees?: Array<{
    id: string;
    balance: string;
    credit?: number | null;
    debit?: number | null;
    description: string;
    transactionDate?: Date;
  }>;
  payableFees?: Array<{
    id: string;
    amount: number;
    arrears: number;
    dueDate?: Date;
  }>;
}

export async function fetchStudentFinances(
  studentId: string
): Promise<StudentFinances> {
  try {
    if (!studentId) return { collectedFees: [], payableFees: [] };

    const finances = await prisma.finances.findFirst({
      where: { student: studentId },
      select: {
        collectedFees: true,
        payableFees: true,
      },
    });

    return {
      collectedFees:
        finances?.collectedFees.map((fee) => ({
          ...fee,
          credit: typeof fee.credit === "number" ? fee.credit : null,
          debit: typeof fee.debit === "number" ? fee.debit : null,
        })) || [],
      payableFees:
        finances?.payableFees.map((fee) => ({
          ...fee,
          amount: Number(fee.amount),
          arrears: Number(fee.arrears),
        })) || [],
    };
  } catch (error) {
    console.error("Error fetching student finances:", error);
    return { collectedFees: [], payableFees: [] };
  }
}
