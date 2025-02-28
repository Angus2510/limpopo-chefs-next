"use server";
import prisma from "@/lib/db";

export async function fetchStudentWelRecords(studentId: string) {
  try {
    if (!studentId) return [];

    const welRecords = await prisma.studentwelrecords.findFirst({
      where: { student: studentId },
    });

    return welRecords?.welRecords || [];
  } catch (error) {
    console.error("Error fetching student WEL records:", error);
    return [];
  }
}
