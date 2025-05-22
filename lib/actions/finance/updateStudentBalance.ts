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

    // Only select collectedFees - ignore payableFees completely
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
      balance: "0",
    };

    if (finance) {
      // Update ONLY collectedFees
      await prisma.finances.update({
        where: { id: finance.id },
        data: {
          collectedFees: calculateRunningBalance([
            ...finance.collectedFees,
            newTransaction,
          ]),
          v: { increment: 1 },
        },
      });
    } else {
      // Create new finance record with ONLY collectedFees
      await prisma.finances.create({
        data: {
          student: studentId,
          v: 1,
          collectedFees: [newTransaction],
          payableFees: [], // Initialize empty but don't touch it after
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
    // Only select collectedFees
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

    // Update ONLY collectedFees
    await prisma.finances.update({
      where: { id: finance.id },
      data: {
        collectedFees: calculateRunningBalance(updatedTransactions),
        v: { increment: 1 },
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
    // Only select collectedFees
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

    const filteredFees = finance.collectedFees.filter(
      (fee) => fee.id !== transactionId
    );

    // Update ONLY collectedFees
    await prisma.finances.update({
      where: { id: finance.id },
      data: {
        collectedFees: calculateRunningBalance(filteredFees),
        v: { increment: 1 },
      },
    });

    revalidatePath(`/admin/finance/student-balance/${studentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: "Failed to delete transaction" };
  }
}
