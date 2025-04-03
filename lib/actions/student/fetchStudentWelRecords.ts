"use server";

import prisma from "@/lib/db";

export async function fetchStudentWelRecords(studentId: string) {
  try {
    const records = await prisma.studentwelrecords.findMany({
      where: {
        student: studentId,
      },
      select: {
        welRecords: true,
      },
    });

    // Flatten the welRecords arrays from all records into a single array
    const allWelRecords = records.flatMap((record) => record.welRecords);

    // Sort by date added, most recent first
    return allWelRecords.sort(
      (a, b) =>
        new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    );
  } catch (error) {
    console.error("Error fetching WEL records:", error);
    return [];
  }
}
