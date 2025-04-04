"use server";

import prisma from "@/lib/db";

export async function getStudentAttendance(studentId: string, year: number) {
  try {
    const startDate = new Date(year, 0, 1); // January 1st
    const endDate = new Date(year, 11, 31); // December 31st

    const attendanceRecords = await prisma.attendances.findMany({
      where: {
        studentId: studentId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        date: true,
        status: true,
        timeCheckedIn: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Transform the data to match the expected format
    return attendanceRecords.map((record) => ({
      id: record.id,
      date: record.date,
      status: record.status as "full" | "half" | "lesson" | "sick" | "absent",
      timeCheckedIn: record.timeCheckedIn,
    }));
  } catch (error) {
    console.error("Error fetching attendance:", error);
    // Return empty array instead of null
    return [];
  }
}

export async function markAttendance({
  studentId,
  qrData,
}: {
  studentId: string;
  qrData: {
    campusId: string;
    outcomeId: string;
    date: string;
  };
}) {
  try {
    const attendance = await prisma.attendances.create({
      data: {
        studentId,
        campus: qrData.campusId,
        date: new Date(qrData.date),
        status: "full",
        timeCheckedIn: new Date(),
        intakeGroup: qrData.outcomeId,
      },
    });

    revalidatePath("/student/attendance/calendar");
    return { success: true, data: attendance };
  } catch (error) {
    console.error("Failed to mark attendance:", error);
    return { success: false, error: "Failed to mark attendance" };
  }
}
