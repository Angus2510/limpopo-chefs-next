"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

interface StudentResultInput {
  studentId: string;
  outcomeId: string;
  mark: number;
  testScore: number;
  taskScore: number;
  competency: "competent" | "not_competent";
  campusId: string;
  intakeGroupId: string;
}

export async function saveStudentResults(results: StudentResultInput[]) {
  try {
    if (!results?.length) {
      return { success: false, error: "No results provided" };
    }

    const createdResults = await Promise.all(
      results.map(async (result) => {
        const averageScore = Math.round(
          (result.testScore + result.taskScore) / 2
        );

        return prisma.assignmentresults.create({
          data: {
            v: 1,
            student: result.studentId,
            outcome: result.outcomeId,
            campus: result.campusId,
            intakeGroup: result.intakeGroupId,
            percent: Math.round(result.mark),
            testScore: Math.round(result.testScore), // Save test score
            taskScore: Math.round(result.taskScore), // Save task score
            scores: averageScore, // Save average
            status: result.competency,
            dateTaken: new Date(),
            answers: [],
            assignment: result.outcomeId,
            markedBy: null,
            moderatedscores: null,
            feedback: null,
          },
        });
      })
    );

    return { success: true, data: createdResults };
  } catch (error) {
    console.error("Save error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save results",
    };
  }
}
