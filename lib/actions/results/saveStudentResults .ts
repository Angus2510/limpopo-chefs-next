"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";

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
  if (!results?.length) {
    return { success: false, error: "No results provided" };
  }

  try {
    // First get the outcome details
    const outcome = await prisma.outcomes.findUnique({
      where: { id: results[0].outcomeId },
      select: {
        id: true,
        title: true,
      },
    });

    if (!outcome) {
      return { success: false, error: "Outcome not found" };
    }

    console.log("Saving results for outcome:", outcome.title);

    // Save each result individually
    let savedCount = 0;
    const errors = [];

    for (const result of results) {
      try {
        await prisma.assignmentresults.create({
          data: {
            v: 1,
            student: result.studentId,
            outcome: result.outcomeId,
            campus: result.campusId,
            intakeGroup: result.intakeGroupId,
            percent: Math.round(result.mark),
            testScore: Math.round(result.testScore),
            taskScore: Math.round(result.taskScore),
            scores: Math.round((result.testScore + result.taskScore) / 2),
            status: result.competency,
            dateTaken: new Date(),
            answers: [],
            assignment: result.outcomeId, // Using outcomeId instead of title
            markedBy: null,
            moderatedscores: null,
            feedback: null,
          },
        });
        savedCount++;
      } catch (err) {
        errors.push({
          studentId: result.studentId,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    // Log results
    console.log(`Saved ${savedCount} of ${results.length} results`);
    if (errors.length > 0) {
      console.log("Errors:", errors);
    }

    // Return appropriate response
    if (savedCount === 0) {
      return {
        success: false,
        error: "Failed to save any results",
        details: errors,
      };
    }

    if (savedCount < results.length) {
      return {
        success: true,
        warning: `Saved ${savedCount} of ${results.length} results`,
        details: errors,
      };
    }

    revalidatePath("/admin/results");
    return {
      success: true,
      message: `Successfully saved all ${savedCount} results`,
    };
  } catch (error) {
    console.error("Save error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save results",
    };
  }
}
