"use server";

import prisma from "@/lib/db";

interface AssignmentResult {
  id: string;
  dateTaken: Date;
  assignmentData: {
    title: string;
    type: string;
  };
  testScore: number | null;
  taskScore: number | null;
  scores: number | null;
  percent: number | null;
  status: string;
  feedback: any;
}

interface StudentInfo {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
}

interface GetStudentMarksResponse {
  results: AssignmentResult[];
  student: StudentInfo;
  error?: string;
}

export async function getStudentMarks(
  studentNumber: string
): Promise<GetStudentMarksResponse | { error: string }> {
  if (!studentNumber) {
    return { error: "Student number is required" };
  }

  try {
    // First get the student
    const student = await prisma.students.findFirst({
      where: {
        admissionNumber: studentNumber,
      },
      select: {
        id: true,
        profile: true,
        admissionNumber: true,
      },
    });

    if (!student) {
      return { error: "Student not found" };
    }

    // Get assignment results
    const assignmentResults = await prisma.assignmentresults.findMany({
      where: {
        student: student.id,
      },
      orderBy: {
        dateTaken: "desc",
      },
    });

    // Get all unique assignment IDs
    const assignmentIds = [
      ...new Set(assignmentResults.map((result) => result.assignment)),
    ];

    // Fetch all assignments in one query
    const assignments = await prisma.assignments.findMany({
      where: {
        id: {
          in: assignmentIds,
        },
      },
      select: {
        id: true,
        title: true,
        type: true,
      },
    });

    // Create assignments lookup map
    const assignmentsMap = new Map(
      assignments.map((assignment) => [assignment.id, assignment])
    );

    // Transform results
    const transformedResults = assignmentResults.map((result) => {
      const assignment = assignmentsMap.get(result.assignment);

      return {
        id: result.id,
        dateTaken: result.dateTaken,
        assignmentData: {
          title: assignment?.title || "Unknown Assignment",
          type: assignment?.type || "Unknown Type",
        },
        testScore: result.testScore,
        taskScore: result.taskScore,
        scores: result.scores,
        percent: result.percent,
        status: result.status || "pending",
        feedback: result.feedback || null,
      };
    });

    return {
      results: transformedResults,
      student: {
        id: student.id,
        admissionNumber: student.admissionNumber,
        firstName: student.profile.firstName,
        lastName: student.profile.lastName,
      },
    };
  } catch (error) {
    console.error("Error in getStudentMarks:", error);
    return { error: "Failed to fetch student marks" };
  }
}
