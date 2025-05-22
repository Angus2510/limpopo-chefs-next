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
    balance += (Number(t.credit) || 0) - (Number(t.debit) || 0);
    return { ...t, balance: balance.toFixed(2) };
  });
}

export async function updateStudentBalance(
  studentId: string,
  data: TransactionData
) {
  try {
    const objectId = new ObjectId().toString();

    // Find existing finance record
    const finance = await prisma.finances.findFirst({
      where: { student: studentId },
      select: {
        id: true,
        collectedFees: true,
      },
    });

    const newTransaction = {
      id: objectId,
      description: data.description,
      credit: data.credit || 0,
      debit: data.debit || 0,
      transactionDate: data.transactionDate || new Date(),
      balance: "0", // Will be calculated before saving
    };

    if (finance) {
      // Add new transaction and recalculate all balances
      const updatedFees = calculateRunningBalance([
        ...finance.collectedFees,
        newTransaction,
      ]);

      await prisma.finances.update({
        where: { id: finance.id },
        data: {
          collectedFees: updatedFees,
        },
      });
    } else {
      // Create new finance record with initial transaction
      await prisma.finances.create({
        data: {
          student: studentId,
          v: 1,
          collectedFees: calculateRunningBalance([newTransaction]),
          payableFees: [], // Initialize empty payableFees array
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
      },
    });

    if (!finance?.collectedFees?.length) {
      return { success: false, error: "Record not found" };
    }

    // Update the specific transaction
    const updatedFees = finance.collectedFees.map((fee) =>
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

    // Recalculate all balances
    const recalculatedFees = calculateRunningBalance(updatedFees);

    await prisma.finances.update({
      where: { id: finance.id },
      data: { collectedFees: recalculatedFees },
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
      },
    });

    if (!finance?.collectedFees?.length) {
      return { success: false, error: "Record not found" };
    }

    // Remove the transaction and recalculate balances
    const updatedFees = finance.collectedFees.filter(
      (fee) => fee.id !== transactionId
    );

    const recalculatedFees = calculateRunningBalance(updatedFees);

    await prisma.finances.update({
      where: { id: finance.id },
      data: { collectedFees: recalculatedFees },
    });

    revalidatePath(`/admin/finance/student-balance/${studentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: "Failed to delete transaction" };
  }
}
