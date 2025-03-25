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

    // Use transaction for atomic operations
    const { savedCount, errors } = await prisma.$transaction(
      async (tx) => {
        let savedCount = 0;
        const errors = [];

        // Process results in chunks of 10 for better performance
        for (let i = 0; i < results.length; i += 10) {
          const chunk = results.slice(i, i + 10);

          await Promise.all(
            chunk.map(async (result) => {
              try {
                await tx.assignmentresults.create({
                  data: {
                    v: 1,
                    student: result.studentId,
                    outcome: result.outcomeId,
                    campus: result.campusId,
                    intakeGroup: result.intakeGroupId,
                    percent: Math.round(result.mark),
                    testScore: Math.round(result.testScore),
                    taskScore: Math.round(result.taskScore),
                    scores: Math.round(
                      (result.testScore + result.taskScore) / 2
                    ),
                    status: result.competency,
                    dateTaken: new Date(),
                    answers: [],
                    assignment: result.outcomeId,
                    markedBy: null,
                    moderatedscores: null,
                    feedback: null,
                  },
                });
                savedCount++;
                console.log(`✅ Saved result for student ${result.studentId}`);
              } catch (err) {
                console.error(
                  `❌ Error saving result for student ${result.studentId}:`,
                  err
                );
                errors.push({
                  studentId: result.studentId,
                  error: err instanceof Error ? err.message : "Unknown error",
                });
              }
            })
          );
        }

        return { savedCount, errors };
      },
      {
        timeout: 30000, // 30 second timeout
        maxWait: 10000, // 10 second max wait time
      }
    );

    // Log results
    console.log(`📊 Saved ${savedCount} of ${results.length} results`);
    if (errors.length > 0) {
      console.log("⚠️ Errors:", errors);
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

    // Revalidate the results page
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
