"use server";

import prisma from "@/lib/db";

export async function updateStudentBalance(
  studentId: string,
  adjustment: {
    type: "credit" | "debit";
    amount: number;
    description: string;
    date: Date;
  }
) {
  try {
    const transaction = await prisma.studentFinanceTransaction.create({
      data: {
        studentId,
        amount: adjustment.amount,
        type: adjustment.type,
        description: adjustment.description,
        transactionDate: adjustment.date,
      },
    });

    return { success: true, transaction };
  } catch (error) {
    console.error("Error updating student balance:", error);
    throw new Error("Failed to update student balance");
  }
}
