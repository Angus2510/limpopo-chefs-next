"use server";
import prisma from "@/lib/db";

export async function submitScore(
  resultId: string,
  scores: Record<string, number>,
  staffId: string,
  assignmentType: "test" | "task",
  totalScore: number,
  percentage: number,
  moderatedScores: string
) {
  try {
    // Update the assignment result directly
    const result = await prisma.assignmentresults.update({
      where: {
        id: resultId, // Use the result ID directly
      },
      data: {
        scores: totalScore,
        percent: percentage,
        status: "marked",
        markedBy: staffId,
        moderatedscores: moderatedScores,
      },
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error submitting score:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
