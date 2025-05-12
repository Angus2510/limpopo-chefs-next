"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { ObjectId } from "bson";

interface PayableUpdate {
  studentId: string;
  amount: number;
  dueDate: string | null;
}

export async function updatePayableFees(updates: PayableUpdate[]) {
  try {
    console.log("Processing updates:", updates);

    const results = await Promise.all(
      updates.map(async (update) => {
        const { studentId, amount, dueDate } = update;

        // Find existing finance record for the student with complete data
        const finance = await prisma.finances.findFirst({
          where: { student: studentId },
          select: {
            id: true,
            payableFees: true,
            collectedFees: true,
            v: true,
          },
        });

        // CRITICAL FIX: Always convert amount to string for consistent storage
        const amountValue = amount.toString();

        // Calculate the current collected balance
        const collectedFees = finance?.collectedFees || [];
        const collectedBalance = collectedFees.reduce((sum, fee) => {
          // CRITICAL FIX: Handle both string and number cases safely
          const credit = fee.credit
            ? typeof fee.credit === "number"
              ? fee.credit
              : parseFloat(fee.credit.toString() || "0")
            : 0;
          const debit = fee.debit
            ? typeof fee.debit === "number"
              ? fee.debit
              : parseFloat(fee.debit.toString() || "0")
            : 0;
          return sum + credit - debit;
        }, 0);

        console.log(
          `Student ${studentId} - Setting amount: ${amountValue}, Collected balance: ${collectedBalance}`
        );

        if (finance) {
          // Finance record exists
          if (finance.payableFees && finance.payableFees.length > 0) {
            // Update existing payable fee
            const updatedFees = finance.payableFees.map((fee, index) => {
              if (index === 0) {
                // CRITICAL FIX: Keep the original id and explicitly set all fields
                return {
                  id: fee.id,
                  amount: amountValue, // String value consistently
                  arrears: "0", // String value consistently
                  dueDate: dueDate ? new Date(dueDate) : null,
                };
              }
              return fee;
            });

            await prisma.finances.update({
              where: { id: finance.id },
              data: {
                payableFees: updatedFees,
                v: { increment: 1 }, // Force timestamp update for cache invalidation
              },
            });

            console.log(`Updated payable fee for student ${studentId}`);
          } else {
            // No payable fees yet, add one
            const newFee = {
              id: new ObjectId().toString(),
              amount: amountValue, // String value consistently
              arrears: "0", // String value consistently
              dueDate: dueDate ? new Date(dueDate) : null,
            };

            await prisma.finances.update({
              where: { id: finance.id },
              data: {
                payableFees: [newFee],
                v: { increment: 1 },
              },
            });

            console.log(`Added new payable fee for student ${studentId}`);
          }
        } else {
          // Create new finance record
          const newFee = {
            id: new ObjectId().toString(),
            amount: amountValue, // String value consistently
            arrears: "0", // String value consistently
            dueDate: dueDate ? new Date(dueDate) : null,
          };

          await prisma.finances.create({
            data: {
              student: studentId,
              v: 1,
              payableFees: [newFee],
              collectedFees: [],
            },
          });

          console.log(`Created new finance record for student ${studentId}`);
        }

        // Calculate and update net balance consistently with FinanceTabs logic
        // CRITICAL FIX: This matches how FinanceTabs calculates it
        const netBalance = collectedBalance - parseFloat(amountValue);
        console.log(`Student ${studentId} - Net balance: ${netBalance}`);

        // Revalidate ALL paths that use financial data
        revalidatePath(`/admin/student/${studentId}`);
        revalidatePath(`/admin/finance/student-balance/${studentId}`);
        revalidatePath(`/admin/student/${studentId}/finances`);
        revalidatePath(`/admin/finance/payable`);

        return {
          studentId,
          success: true,
          netBalance: netBalance,
        };
      })
    );

    return { success: true, updatedCount: results.length };
  } catch (error) {
    console.error("Error updating payable fees:", error);
    return {
      success: false,
      error: "Failed to update financial records",
    };
  }
}
