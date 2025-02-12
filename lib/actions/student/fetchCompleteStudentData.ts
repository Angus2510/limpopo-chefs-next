"use server";

import prisma from "../../db";

// Define types for our data structure
export interface StudentData {
  student: {
    id: string;
    admissionNumber: string;
    email: string;
    active: boolean;
    alumni: boolean;
    avatarUrl?: string;
    campus: string[];
    intakeGroup: string[];
    qualification: string[];
    profile: {
      firstName: string;
      middleName: string;
      lastName: string;
      dateOfBirth: string;
      gender: string;
      idNumber: string;
      mobileNumber: string;
      admissionDate: string;
      cityAndGuildNumber: string;
      homeLanguage: string;
      address: {
        street1: string;
        street2: string;
        city: string;
        province: string;
        country: string;
        postalCode: string;
      };
      postalAddress: {
        street1: string;
        street2: string;
        city: string;
        province: string;
        country: string;
        postalCode: string;
      };
    };
    importantInformation?: string;
  };
  attendance: Array<{
    date: Date;
    status: string;
    timeCheckedIn?: Date;
  }>;
  assignments: Array<{
    assignment: string;
    dateTaken: Date;
    scores?: number;
    moderatedscores?: number;
    percent?: number;
    status: string;
  }>;
  welRecords: Array<{
    establishmentName: string;
    establishmentContact: string;
    startDate: Date;
    endDate: Date;
    totalHours: number;
    evaluated: boolean;
  }>;
  finances: {
    collectedFees: Array<{
      description: string;
      credit?: number;
      debit?: number;
      balance: string;
      transactionDate?: Date;
    }>;
    payableFees: Array<{
      amount: number;
      arrears: number;
      dueDate?: Date;
    }>;
  };
  documents: {
    legal: Array<{
      id: string;
      title: string;
      description: string;
      documentUrl: string;
      uploadDate?: Date;
    }>;
    general: Array<{
      id: string;
      title: string;
      description: string;
      documentUrl: string;
      uploadDate?: Date;
    }>;
  };
}

export async function fetchStudentData(
  studentId: string
): Promise<StudentData> {
  try {
    // Fetch basic student information
    const student = await prisma.students.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        admissionNumber: true,
        email: true,
        active: true,
        alumni: true,
        avatarUrl: true,
        campus: true,
        intakeGroup: true,
        qualification: true,
        profile: true,
        importantInformation: true,
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    // Fetch attendance records
    const attendances = await prisma.attendances.findMany({
      where: {
        // Filter attendance records where at least one attendee has the given studentId.
        attendees: {
          some: {
            // Use the correct field name from your schema.
            studentId: studentId,
          },
        },
      },
      select: {
        attendanceDate: true,
        attendees: {
          select: {
            status: true,
            timeCheckedIn: true,
          },
        },
      },
      orderBy: { attendanceDate: "desc" },
    });

    // Fetch assignments with results
    const assignments = await prisma.assignmentresults.findMany({
      where: { student: studentId },
      select: {
        assignment: true,
        dateTaken: true,
        scores: true,
        moderatedscores: true,
        percent: true,
        status: true,
      },
      orderBy: { dateTaken: "desc" },
    });

    // Fetch WEL records
    const welRecords = await prisma.studentwelrecords.findFirst({
      where: { student: studentId },
      select: { welRecords: true },
    });

    // Fetch financial records
    const finances = await prisma.finances.findFirst({
      where: { student: studentId },
      select: {
        collectedFees: true,
        payableFees: true,
      },
    });

    // Fetch documents
    const [legalDocs, generalDocs] = await Promise.all([
      prisma.legaldocuments.findMany({
        where: { student: studentId },
        select: {
          id: true,
          title: true,
          description: true,
          documentUrl: true,
          uploadDate: true,
        },
      }),
      prisma.generaldocuments.findMany({
        where: { student: studentId },
        select: {
          id: true,
          title: true,
          description: true,
          documentUrl: true,
          uploadDate: true,
        },
      }),
    ]);

    // Return the structured data
    return {
      student,
      attendance: attendances.map((record) => ({
        date: record.attendanceDate,
        status: record.attendees[0]?.status,
        timeCheckedIn: record.attendees[0]?.timeCheckedIn,
      })),
      assignments,
      welRecords: welRecords?.welRecords ?? [],
      finances: finances ?? { collectedFees: [], payableFees: [] },
      documents: {
        legal: legalDocs,
        general: generalDocs,
      },
    };
  } catch (error) {
    console.error("Error fetching student data:", error);
    throw error;
  }
}
