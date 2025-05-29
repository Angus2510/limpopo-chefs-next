"use server";

import prisma from "@/lib/db";

interface AssignmentResult {
  id: string;
  dateTaken: Date;
  assignmentData: {
    id?: string;
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
}

interface SearchParams {
  studentNumber?: string;
  firstName?: string;
  lastName?: string;
}

export async function getStudentMarks(
  params: SearchParams
): Promise<GetStudentMarksResponse | { error: string }> {
  try {
    // Normalize parameters
    const searchParams = {
      studentNumber: params.studentNumber?.trim() || "",
      firstName: params.firstName?.trim() || "",
      lastName: params.lastName?.trim() || "",
    };

    // Validate input
    if (
      !searchParams.studentNumber &&
      !searchParams.firstName &&
      !searchParams.lastName
    ) {
      return { error: "No search criteria provided" };
    }

    let student = null;

    // STEP 1: Find the student using the appropriate search method
    if (searchParams.studentNumber) {
      // Student number search
      student = await prisma.students.findFirst({
        where: { admissionNumber: searchParams.studentNumber },
        select: {
          id: true,
          profile: true,
          admissionNumber: true,
        },
      });
    } else {
      // Name search - fetch students and filter in memory
      const allStudents = await prisma.students.findMany({
        select: {
          id: true,
          profile: true,
          admissionNumber: true,
        },
        take: 20,
      });

      student = allStudents.find((s) => {
        if (!s?.profile) return false;

        const firstName = String(s.profile.firstName || "").toLowerCase();
        const lastName = String(s.profile.lastName || "").toLowerCase();

        const firstNameMatch =
          !searchParams.firstName ||
          firstName.includes(searchParams.firstName.toLowerCase());

        const lastNameMatch =
          !searchParams.lastName ||
          lastName.includes(searchParams.lastName.toLowerCase());

        return firstNameMatch && lastNameMatch;
      });
    }

    // Handle student not found
    if (!student) {
      return { error: "Student not found" };
    }

    // Validate student data
    if (!student.profile) {
      return { error: "Student profile data is missing" };
    }

    // Prepare student info object
    const studentInfo = {
      id: student.id,
      admissionNumber: student.admissionNumber || "",
      firstName: student.profile.firstName || "",
      lastName: student.profile.lastName || "",
    };

    // STEP 2: Now that we have the student, get their assignment results
    const assignmentResults = await prisma.assignmentresults.findMany({
      where: {
        student: student.id,
      },
      orderBy: {
        dateTaken: "desc",
      },
    });

    // Return early if no results
    if (assignmentResults.length === 0) {
      return {
        results: [],
        student: studentInfo,
      };
    }

    // STEP 3: Get assignment details
    const assignmentIds = [
      ...new Set(
        assignmentResults.map((result) => result.assignment).filter(Boolean)
      ),
    ];

    const assignments =
      assignmentIds.length > 0
        ? await prisma.assignments.findMany({
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
          })
        : [];

    // Create lookup map
    const assignmentsMap = new Map(
      assignments.map((assignment) => [assignment.id, assignment])
    );

    // Transform results with careful null handling
    const transformedResults = assignmentResults.map((result) => {
      const assignment = result.assignment
        ? assignmentsMap.get(result.assignment)
        : null;

      return {
        id: result.id,
        dateTaken: result.dateTaken,
        assignmentData: {
          id: assignment?.id,
          title: assignment?.title || "Unknown Assignment",
          type: assignment?.type || "Unknown Type",
        },
        testScore: result.testScore ?? null,
        taskScore: result.taskScore ?? null,
        scores: result.scores ?? null,
        percent: result.percent ?? null,
        status: result.status || "pending",
        feedback: result.feedback || null,
      };
    });

    // Return final response
    return {
      results: transformedResults,
      student: studentInfo,
    };
  } catch (error) {
    console.error("Error in getStudentMarks:", error);
    return { error: "Failed to fetch student marks" };
  }
}
