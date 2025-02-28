"use server";
import prisma from "@/lib/db";

export async function fetchStudentDocuments(studentId: string) {
  try {
    if (!studentId) return [];

    const [generalDocs, legalDocs] = await Promise.all([
      prisma.generaldocuments.findMany({
        where: { student: studentId },
      }),
      prisma.legaldocuments.findMany({
        where: { student: studentId },
      }),
    ]);

    return [...generalDocs, ...legalDocs];
  } catch (error) {
    console.error("Error fetching student documents:", error);
    return [];
  }
}
