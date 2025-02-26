"use server";
import prisma from "@/lib/db";

export async function submitScore(
  assignmentId: string,
  scores: Record<string, number>,
  staffId: string
) {
  // Validate inputs
  if (!assignmentId) throw new Error("Missing assignment ID");
  if (!scores || typeof scores !== "object")
    throw new Error("Invalid scores object");
  if (!staffId) throw new Error("Missing staff ID");

  try {
    console.log("Submitting score with params:", {
      assignmentId,
      scores,
      staffId,
    });

    // Calculate total score from the individual scores
    const totalScore = Object.values(scores).reduce(
      (sum, score) => sum + score,
      0
    );

    console.log("Calculated total score:", totalScore);

    // Calculate percentage
    // If you need the total possible score, you could pass it as a parameter
    // For now, we're just storing the raw score

    const result = await prisma.assignmentresults.update({
      where: {
        id: assignmentId,
      },
      data: {
        scores: totalScore,
        status: "marked",
        markedBy: staffId,
        moderatedscores: JSON.stringify(scores),
        // Remove markedAt as it doesn't exist in the schema
      },
    });

    console.log("Update successful, result:", result);
    return { success: true, data: result };
  } catch (error) {
    // Safer error logging that handles null/undefined
    console.error(
      "Error submitting score:",
      error ? error.toString() : "Unknown error"
    );
    return {
      success: false,
      error: error?.toString() || "Unknown error occurred",
    };
  }
}
