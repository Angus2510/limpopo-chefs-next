"use server";
import prisma from "@/lib/db";

export async function fetchStudentResults(studentId: string) {
  try {
    if (!studentId) {
      console.log("No student ID provided");
      return [];
    }

    // Get all results for the student
    const results = await prisma.assignmentresults.findMany({
      where: {
        student: studentId,
      },
      select: {
        id: true,
        dateTaken: true,
        scores: true,
        percent: true,
        testScore: true,
        taskScore: true,
        status: true,
        assignment: true,
        outcome: true,
      },
      orderBy: {
        dateTaken: "desc",
      },
    });

    // Get outcomes for titles
    const outcomes = await prisma.outcomes.findMany({
      where: {
        id: {
          in: results.map((r) => r.outcome),
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    const outcomeTitles = Object.fromEntries(
      outcomes.map((o) => [o.id, o.title])
    );

    // Map the results to match the interface
    const finalResults = results.map((result) => ({
      id: result.id,
      dateTaken: result.dateTaken,
      assignments: {
        title: outcomeTitles[result.outcome] || "Unknown Assessment",
        type: "assessment",
      },
      outcome: {
        title: outcomeTitles[result.outcome] || "Unknown Outcome",
      },
      scores: result.scores || 0,
      percent: result.percent || 0,
      testScore: result.testScore || 0,
      taskScore: result.taskScore || 0,
      status: result.status || "pending",
    }));

    return finalResults;
  } catch (error) {
    console.error("Error fetching student results:", error);
    return [];
  }
}
