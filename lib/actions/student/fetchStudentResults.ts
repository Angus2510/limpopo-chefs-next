"use server";
import prisma from "@/lib/db";

export async function fetchStudentResults(studentId: string) {
  try {
    if (!studentId) return [];

    const results = await prisma.assignmentresults.findMany({
      where: { student: studentId },
      select: {
        id: true,
        assignment: true,
        dateTaken: true,
        scores: true,
        moderatedscores: true,
        percent: true,
        status: true,
      },
    });

    return results;
  } catch (error) {
    console.error("Error fetching student results:", error);
    return [];
  }
}
