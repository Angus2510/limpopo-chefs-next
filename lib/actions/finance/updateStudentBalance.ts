"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { ObjectId } from "bson";

interface TransactionData {
  description: string;
  credit?: number | null;
  debit?: number | null;
  transactionDate?: Date;
}

// Helper function to calculate running balance
function calculateRunningBalance(transactions: any[]) {
  let balance = 0;
  return transactions.map((t) => {
    const credit = Number(t.credit) || 0;
    const debit = Number(t.debit) || 0;
    balance += credit - debit;
    return { ...t, balance: balance.toFixed(2) };
  });
}

export async function updateStudentBalance(
  studentId: string,
  data: TransactionData
) {
  try {
    const objectId = new ObjectId().toString();

    // Find existing finance record, ONLY select collectedFees and preserve payableFees
    const finance = await prisma.finances.findFirst({
      where: { student: studentId },
      select: {
        id: true,
        collectedFees: true,
        payableFees: true, // Select this to preserve it
      },
    });

    const newTransaction = {
      id: objectId,
      description: data.description,
      credit: data.credit || 0,
      debit: data.debit || 0,
      transactionDate: data.transactionDate || new Date(),
      balance: "0", // Will be calculated
    };

    if (finance) {
      // Update only collectedFees while preserving payableFees
      await prisma.finances.update({
        where: { id: finance.id },
        data: {
          collectedFees: calculateRunningBalance([
            ...finance.collectedFees,
            newTransaction,
          ]),
          v: { increment: 1 },
          payableFees: finance.payableFees, // Explicitly preserve existing payableFees
        },
      });
    } else {
      // Create new finance record
      await prisma.finances.create({
        data: {
          student: studentId,
          v: 1,
          collectedFees: [newTransaction],
          payableFees: [], // Initialize empty array
        },
      });
    }

    revalidatePath(`/admin/finance/student-balance/${studentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return { success: false, error: "Failed to create transaction" };
  }
}

export async function editTransaction(
  studentId: string,
  transactionId: string,
  data: TransactionData
) {
  try {
    const finance = await prisma.finances.findFirst({
      where: { student: studentId },
      select: {
        id: true,
        collectedFees: true,
        payableFees: true, // Select to preserve
      },
    });

    if (!finance?.collectedFees?.length) {
      return { success: false, error: "Record not found" };
    }

    // Update only the specific transaction while preserving payableFees
    const updatedTransactions = finance.collectedFees.map((fee) =>
      fee.id === transactionId
        ? {
            ...fee,
            description: data.description,
            credit: data.credit || 0,
            debit: data.debit || 0,
            transactionDate: data.transactionDate || fee.transactionDate,
          }
        : fee
    );

    await prisma.finances.update({
      where: { id: finance.id },
      data: {
        collectedFees: calculateRunningBalance(updatedTransactions),
        v: { increment: 1 },
        payableFees: finance.payableFees, // Explicitly preserve payableFees
      },
    });

    revalidatePath(`/admin/finance/student-balance/${studentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating transaction:", error);
    return { success: false, error: "Failed to update transaction" };
  }
}

export async function deleteTransaction(
  studentId: string,
  transactionId: string
) {
  try {
    const finance = await prisma.finances.findFirst({
      where: { student: studentId },
      select: {
        id: true,
        collectedFees: true,
        payableFees: true, // Select to preserve
      },
    });

    if (!finance?.collectedFees?.length) {
      return { success: false, error: "Record not found" };
    }

    // Remove transaction while preserving payableFees
    const filteredFees = finance.collectedFees.filter(
      (fee) => fee.id !== transactionId
    );

    await prisma.finances.update({
      where: { id: finance.id },
      data: {
        collectedFees: calculateRunningBalance(filteredFees),
        v: { increment: 1 },
        payableFees: finance.payableFees, // Explicitly preserve payableFees
      },
    });

    revalidatePath(`/admin/finance/student-balance/${studentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: "Failed to delete transaction" };
  }
}
