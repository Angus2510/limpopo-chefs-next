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

type AttendanceStatus =
  | "full"
  | "absent"
  | "absent with reason"
  | "W.E.L"
  | "sick";

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

    const attendanceDate = new Date(qrData.date);
    if (isNaN(attendanceDate.getTime())) {
      throw new Error("Invalid date format");
    }

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

    const attendance = await prisma.attendances.create({
      data: {
        studentId,
        campus: qrData.campusId,
        date: attendanceDate,
        status: "full",
        timeCheckedIn: new Date(),
        intakeGroup: qrData.outcomeId,
        v: 1,
      },
    });

    revalidatePath("/student/attendance/calendar");
    revalidatePath("/admin/attendance/student");

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

export async function updateStudentAttendance(
  studentId: string,
  date: Date,
  status: AttendanceStatus
) {
  try {
    console.log("Attempting to update attendance:", {
      studentId,
      date,
      status,
    });

    const existingAttendance = await prisma.attendances.findFirst({
      where: {
        studentId,
        date: {
          equals: date,
        },
      },
    });

    console.log("Existing attendance record:", existingAttendance);

    let result;

    if (existingAttendance) {
      result = await prisma.attendances.update({
        where: {
          id: existingAttendance.id,
        },
        data: {
          status,
          updatedAt: new Date(),
        },
      });
      console.log("Updated existing attendance:", result);
    } else {
      // Create new attendance record with minimal required fields
      result = await prisma.attendances.create({
        data: {
          studentId,
          date,
          status,
          timeCheckedIn: new Date(),
          // Set default values for required fields that can't be null
          campus: "000000000000000000000000", // Default MongoDB ObjectId
          intakeGroup: "000000000000000000000000", // Default MongoDB ObjectId
          v: 1,
        },
      });
      console.log("Created new attendance:", result);
    }

    revalidatePath("/admin/attendance/student");

    console.log("Operation successful");
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Failed to update attendance:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update attendance",
    };
  }
}
export async function updateGroupAttendance(
  studentIds: string[],
  date: Date,
  status: AttendanceStatus,
  campusId: string,
  groupId: string
) {
  try {
    console.log("Attempting to update group attendance:", {
      studentIds,
      date,
      status,
      campusId,
      groupId,
    });

    const results = await Promise.all(
      studentIds.map(async (studentId) => {
        const existingAttendance = await prisma.attendances.findFirst({
          where: {
            studentId,
            date: {
              equals: date,
            },
          },
        });

        if (existingAttendance) {
          return prisma.attendances.update({
            where: {
              id: existingAttendance.id,
            },
            data: {
              status,
              updatedAt: new Date(),
            },
          });
        } else {
          return prisma.attendances.create({
            data: {
              studentId,
              date,
              status,
              timeCheckedIn: new Date(),
              campus: campusId,
              intakeGroup: groupId,
              v: 1,
            },
          });
        }
      })
    );

    revalidatePath("/admin/attendance/group");
    revalidatePath("/admin/attendance/student");

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("Failed to update group attendance:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update group attendance",
    };
  }
}
