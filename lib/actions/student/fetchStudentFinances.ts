"use server";
import prisma from "@/lib/db";

export async function fetchStudentFinances(studentId: string) {
  try {
    if (!studentId) return { collectedFees: [], payableFees: [] };

    const finances = await prisma.finances.findFirst({
      where: { student: studentId },
    });

    return finances || { collectedFees: [], payableFees: [] };
  } catch (error) {
    console.error("Error fetching student finances:", error);
    return { collectedFees: [], payableFees: [] };
  }
}
