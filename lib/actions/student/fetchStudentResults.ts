"use server";
import prisma from "@/lib/db";
import { getAssignments } from "../assignments/getAssignments";

export async function fetchStudentResults(studentId: string) {
  try {
    if (!studentId) return [];

    // Get all results for the student
    const results = await prisma.assignmentresults.findMany({
      where: {
        student: studentId,
      },
      select: {
        id: true,
        dateTaken: true,
        scores: true,
        moderatedscores: true,
        percent: true,
        status: true,
        assignment: true,
      },
    });

    // Get all assignments to create a title lookup map
    const assignments = await getAssignments();
    const assignmentTitleMap = assignments.reduce((map, assignment) => {
      map[assignment.id] = assignment.title;
      return map;
    }, {} as { [key: string]: string });

    // Map the results and include the assignment title
    const finalResults = results.map((result) => ({
      ...result,
      assignments: {
        title: assignmentTitleMap[result.assignment] || "Unknown Assignment",
      },
    }));

    console.log("Processed results:", finalResults);
    return finalResults;
  } catch (error) {
    console.error("Error fetching student results:", error);
    return [];
  }
}
