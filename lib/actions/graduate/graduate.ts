"use server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

interface GraduationStatus {
  [key: string]: boolean;
}

export async function graduateStudents(graduationStatus: GraduationStatus) {
  try {
    if (!graduationStatus || typeof graduationStatus !== "object") {
      throw new Error("Invalid graduation status data");
    }

    const studentIds = Object.keys(graduationStatus);
    if (studentIds.length === 0) {
      throw new Error("No students provided for status update");
    }

    // First verify students exist and get their current status
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

    const updatedCount = results.length;
    const graduatedCount = results.filter(
      (student) => graduationStatus[student.id]
    ).length;
    const ungraduatedCount = updatedCount - graduatedCount;

    let message = `Successfully updated ${updatedCount} student${
      updatedCount !== 1 ? "s" : ""
    } status`;
    if (graduatedCount > 0 && ungraduatedCount > 0) {
      message += ` (${graduatedCount} graduated, ${ungraduatedCount} ungraduated)`;
    }

    return {
      success: true,
      message,
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
