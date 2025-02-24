"use server";

import prisma from "@/lib/db";

export async function fetchUnmarkedAssignments() {
  try {
    // First get the assignment results
    const results = await prisma.assignmentresults.findMany({
      where: {
        status: "submitted",
        scores: null,
      },
    });

    if (!results.length) {
      return [];
    }

    // Get unique IDs for batch fetching
    const studentIds = [...new Set(results.map((r) => r.student))];
    const assignmentIds = [...new Set(results.map((r) => r.assignment))];

    // Fetch related data in parallel
    const [students, assignments] = await Promise.all([
      prisma.students.findMany({
        where: { id: { in: studentIds } },
        select: {
          id: true,
          profile: true,
        },
      }),
      prisma.assignments.findMany({
        where: { id: { in: assignmentIds } },
        select: {
          id: true,
          title: true,
          questions: true,
        },
      }),
    ]);

    // Create lookup maps for efficient access
    const studentMap = new Map(students.map((s) => [s.id, s]));
    const assignmentMap = new Map(assignments.map((a) => [a.id, a]));

    // Transform the results
    const transformedResults = results.map((result) => {
      const student = studentMap.get(result.student);
      const assignment = assignmentMap.get(result.assignment);

      return {
        id: result.id,
        dateTaken: result.dateTaken,
        scores: result.scores,
        student: {
          id: student?.id || result.student,
          firstName: student?.profile?.firstName || "Unknown",
          lastName: student?.profile?.lastName || "Unknown",
        },
        assignment: {
          id: assignment?.id || result.assignment,
          title: assignment?.title || "Unknown Assignment",
          questions: assignment?.questions || [],
        },
        answers: result.answers || [],
      };
    });

    console.log("Transformed results:", {
      count: transformedResults.length,
      sample: transformedResults[0],
    });

    return transformedResults;
  } catch (error) {
    console.log("Error in fetchUnmarkedAssignments:", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return [];
  }
}
