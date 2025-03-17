import prisma from "@/lib/db";

export async function submitScore(
  assignmentId: string,
  scores: Record<string, number>,
  staffId: string,
  assignmentType: "test" | "task"
) {
  try {
    // Calculate total score
    const totalScore = Object.values(scores).reduce(
      (sum, score) => sum + score,
      0
    );

    // Calculate percentage
    const maxPossibleScore = 100; // Adjust this based on your scoring system
    const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);

    // Determine overall outcome
    const overallOutcome =
      percentageScore >= 40 ? "Competent" : "Not Yet Competent";

    const result = await prisma.assignmentresults.update({
      where: {
        id: assignmentId,
      },
      data: {
        scores: totalScore,
        percent: percentageScore,
        [assignmentType === "test" ? "testScore" : "taskScore"]: totalScore,
        status: "marked",
        markedBy: staffId,
        moderatedscores: JSON.stringify(scores),
        overallOutcome,
      },
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error submitting score:", error);
    return {
      success: false,
      error: error?.toString() || "Unknown error occurred",
    };
  }
}
