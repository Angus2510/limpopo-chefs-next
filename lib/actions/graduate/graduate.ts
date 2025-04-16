"use server";
import prisma from "@/lib/db";

import { revalidatePath } from "next/cache";

interface GraduationStatus {
  [key: string]: boolean;
}

export async function graduateStudents(graduationStatus: GraduationStatus) {
  // Mark as server action

  try {
    if (!graduationStatus || Object.keys(graduationStatus).length === 0) {
      throw new Error("No students selected for graduation");
    }

    // First verify students exist and get their current status
    const studentIds = Object.keys(graduationStatus);
    const existingStudents = await prisma.students.findMany({
      where: {
        id: { in: studentIds },
      },
      select: {
        id: true,
        admissionNumber: true,
      },
    });

    if (existingStudents.length === 0) {
      throw new Error("No valid students found");
    }

    // Create update operations with explicit alumni field
    const updateOperations = existingStudents.map((student) => {
      return prisma.students.update({
        where: {
          id: student.id,
        },
        data: {
          alumni: graduationStatus[student.id],
          updatedAt: new Date(),
        },
      });
    });

    // Execute all updates in a transaction
    const results = await prisma.$transaction(updateOperations);

    // Revalidate the alumni page
    revalidatePath("/admin/admin/alumni");

    return {
      success: true,
      message: `Successfully updated ${results.length} students graduation status`,
      results,
    };
  } catch (error) {
    console.error("Error updating graduation status:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to update graduation status: ${error.message}`);
    }
    throw new Error("Failed to update graduation status");
  }
}
