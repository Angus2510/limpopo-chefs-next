"use server";

import prisma from "@/lib/db";

export async function verifyTestStatus(
  assignmentId: string,
  studentId: string
) {
  try {
    // Check if there's a completed submission
    const completedSubmission = await prisma.assignmentresults.findFirst({
      where: {
        assignment: assignmentId,
        student: studentId,
        status: "COMPLETED",
      },
    });

    // Check if there's an in-progress submission
    const incompleteSubmission = await prisma.assignmentresults.findFirst({
      where: {
        assignment: assignmentId,
        student: studentId,
        status: "IN_PROGRESS",
      },
    });

    // Get the assignment to check if password was recently regenerated
    const assignment = await prisma.assignments.findUnique({
      where: {
        id: assignmentId,
      },
      select: {
        passwordGeneratedAt: true,
      },
    });

    // If password was regenerated after the incomplete submission, allow retake
    let hasIncompleteAttempt = false;
    if (incompleteSubmission && assignment?.passwordGeneratedAt) {
      hasIncompleteAttempt =
        new Date(assignment.passwordGeneratedAt) >
        new Date(incompleteSubmission.dateTaken);
    }

    return {
      isCompleted: !!completedSubmission,
      hasIncompleteAttempt,
      error: null,
    };
  } catch (error) {
    console.error("Error verifying test status:", error);
    return {
      isCompleted: false,
      hasIncompleteAttempt: false,
      error: "Failed to verify test status",
    };
  }
}
