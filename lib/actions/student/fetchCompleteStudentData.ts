import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fetchCompleteStudentData(studentId: string) {
  try {
    // Fetch basic student information
    const student = await prisma.students.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    // Fetch all related data in parallel for better performance
    const [
      answers,
      assignmentResults,
      attendances,
      finances,
      generalDocuments,
      legalDocuments,
      results,
      welRecords,
      // Fetch guardians using the guardians array from student
      guardians,
    ] = await Promise.all([
      // Get all student's answers
      prisma.answers.findMany({
        where: { student: studentId },
      }),

      // Get assignment results
      prisma.assignmentresults.findMany({
        where: { student: studentId },
      }),

      // Get attendance records
      prisma.attendances.findMany({
        where: {
          attendees: {
            some: {
              student: studentId,
            },
          },
        },
      }),

      // Get financial records
      prisma.finances.findFirst({
        where: { student: studentId },
      }),

      // Get general documents
      prisma.generaldocuments.findMany({
        where: { student: studentId },
      }),

      // Get legal documents
      prisma.legaldocuments.findMany({
        where: { student: studentId },
      }),

      // Get academic results
      prisma.results.findMany({
        where: {
          results: {
            some: {
              student: studentId,
            },
          },
        },
      }),

      // Get WEL records
      prisma.studentwelrecords.findFirst({
        where: { student: studentId },
      }),

      // Get guardian information
      prisma.guardians.findMany({
        where: {
          id: {
            in: student.guardians,
          },
        },
      }),
    ]);

    // Get accommodation information if the student is listed as an occupant
    const accommodation = await prisma.accommodations.findFirst({
      where: {
        occupants: {
          has: studentId,
        },
      },
    });

    // Compile all data into a single object
    const completeStudentData = {
      personalInfo: student,
      academic: {
        answers,
        assignmentResults,
        results,
      },
      attendance: {
        regularAttendance: attendances,
        welRecords,
      },
      documents: {
        general: generalDocuments,
        legal: legalDocuments,
      },
      financial: finances,
      living: accommodation,
      guardianInfo: guardians,
    };

    return completeStudentData;
  } catch (error) {
    console.error("Error fetching student data:", error);
    throw error;
  }
}

// Type definition for the return value
type CompleteStudentData = {
  personalInfo: {
    id: string;
    admissionNumber: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      middleName: string;
      dateOfBirth: string;
      gender: string;
      mobileNumber: string;
      idNumber: string;
      cityAndGuildNumber: string;
      admissionDate: string;
      homeLanguage: string;
      address: {
        street1: string;
        street2: string;
        city: string;
        province: string;
        postalCode: string;
        country: string;
      };
      postalAddress: {
        street1: string;
        street2: string;
        city: string;
        province: string;
        postalCode: string;
        country: string;
      };
    };
    campus: string[];
    intakeGroup: string[];
    qualification: string[];
    active: boolean;
    alumni?: boolean;
    // ... other student fields
  };
  academic: {
    answers: any[];
    assignmentResults: any[];
    results: any[];
  };
  attendance: {
    regularAttendance: any[];
    welRecords: any;
  };
  documents: {
    general: any[];
    legal: any[];
  };
  financial: any;
  living: any;
  guardianInfo: any[];
};

export { fetchCompleteStudentData };
