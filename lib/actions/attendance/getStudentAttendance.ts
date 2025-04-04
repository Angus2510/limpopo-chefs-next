"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";

interface AttendanceData {
  studentId: string;
  qrData: {
    campusId: string;
    outcomeId: string;
    date: string;
  };
}

type AttendanceStatus = "full" | "half" | "lesson" | "sick" | "absent";

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

    return attendanceRecords.map((record) => ({
      id: record.id,
      date: record.date,
      status: record.status as AttendanceStatus,
      timeCheckedIn: record.timeCheckedIn,
    }));
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return [];
  }
}

export async function markAttendance(data: AttendanceData) {
  if (!data || !data.studentId || !data.qrData) {
    throw new Error("Invalid attendance data provided");
  }

  try {
    const { studentId, qrData } = data;

    // Validate date format
    const attendanceDate = new Date(qrData.date);
    if (isNaN(attendanceDate.getTime())) {
      throw new Error("Invalid date format");
    }

    // Check for existing attendance
    const existingAttendance = await prisma.attendances.findFirst({
      where: {
        studentId,
        date: attendanceDate,
        campus: qrData.campusId,
        intakeGroup: qrData.outcomeId,
      },
    });

    if (existingAttendance) {
      return {
        success: false,
        error: "Attendance already marked for this session",
      };
    }

    // Create attendance record with all required fields
    const attendance = await prisma.attendances.create({
      data: {
        studentId,
        campus: qrData.campusId,
        date: attendanceDate,
        status: "full",
        timeCheckedIn: new Date(),
        intakeGroup: qrData.outcomeId,
        v: 1, // Required version field from schema
      },
    });

    console.log("Created attendance record:", attendance);
    revalidatePath("/student/attendance/calendar");

    return {
      success: true,
      data: attendance,
    };
  } catch (error) {
    console.error("Failed to mark attendance:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to mark attendance",
    };
  }
}
