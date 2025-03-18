"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { ObjectId } from "bson"; // Use bson for generating ObjectIds

interface TransactionData {
  description: string;
  credit?: number | null;
  debit?: number | null;
  transactionDate?: Date;
}

export async function updateStudentBalance(
  studentId: string,
  data: TransactionData
) {
  try {
    // Generate a proper MongoDB ObjectId for the transaction
    const objectId = new ObjectId().toString();

    // First try to find existing record
    const finance = await prisma.finances.findFirst({
      where: { student: studentId },
    });

    // Prepare the new transaction with proper ObjectId format
    const newTransaction = {
      id: objectId, // Use proper ObjectId format as string
      description: data.description,
      credit: data.credit, // Direct assignment, Prisma handles JSON conversion
      debit: data.debit, // Direct assignment, Prisma handles JSON conversion
      transactionDate: data.transactionDate || new Date(),
      balance: "0",
    };

    if (finance) {
      // Update existing finance record
      const result = await prisma.finances.update({
        where: { id: finance.id },
        data: {
          collectedFees: {
            push: newTransaction, // Use push operation directly
          },
        },
      });
      revalidatePath(`/admin/finance/student-balance/${studentId}`);
      return { success: true };
    } else {
      // Create new finance record if none exists
      const result = await prisma.finances.create({
        data: {
          student: studentId,
          v: 1,
          collectedFees: [newTransaction],
          payableFees: [],
        },
      });
      revalidatePath(`/admin/finance/student-balance/${studentId}`);
      return { success: true };
    }
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
    });

    if (!finance?.collectedFees?.length) {
      return { success: false, error: "Record not found" };
    }

    const updatedFees = finance.collectedFees.map((fee) =>
      fee.id === transactionId
        ? {
            ...fee,
            description: data.description,
            credit: data.credit,
            debit: data.debit,
            transactionDate: data.transactionDate || fee.transactionDate,
          }
        : fee
    );

    const result = await prisma.finances.update({
      where: { id: finance.id },
      data: { collectedFees: updatedFees },
    });

    revalidatePath(`/admin/finance/student-balance/${studentId}`);
    return { success: true };
  } catch (error) {
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
    });

    if (!finance?.collectedFees?.length) {
      return { success: false, error: "Record not found" };
    }

    const updatedFees = finance.collectedFees.filter(
      (fee) => fee.id !== transactionId
    );

    const result = await prisma.finances.update({
      where: { id: finance.id },
      data: { collectedFees: updatedFees },
    });

    revalidatePath(`/admin/finance/student-balance/${studentId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete transaction" };
  }
}
