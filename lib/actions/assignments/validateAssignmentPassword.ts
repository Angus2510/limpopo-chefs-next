"use server";

import prisma from "@/lib/db";
import { ObjectId } from "mongodb";

const isPasswordValid = (generatedAt: Date | null): boolean => {
  if (!generatedAt) return false;
  const now = new Date();
  const diffInMinutes = (now.getTime() - generatedAt.getTime()) / (1000 * 60);
  return diffInMinutes <= 20;
};

export async function validateAssignmentPassword(
  assignmentId: string,
  password: string
) {
  if (!assignmentId || !ObjectId.isValid(assignmentId)) {
    return { valid: false, message: "Invalid assignment ID" };
  }

  try {
    const assignment = await prisma.assignments.findUnique({
      where: { id: assignmentId },
      select: {
        password: true,
        passwordGeneratedAt: true,
        availableFrom: true,
        duration: true,
      },
    });

    if (!assignment) {
      return { valid: false, message: "Assignment not found" };
    }

    // Check if password matches
    const passwordMatches = assignment.password === password;

    // Check if password is within time limit
    const isValid =
      passwordMatches && isPasswordValid(assignment.passwordGeneratedAt);

    return {
      valid: isValid,
      message: isValid ? "Password valid" : "Password invalid or expired",
      assignment: isValid
        ? {
            duration: assignment.duration,
            availableFrom: assignment.availableFrom,
          }
        : null,
    };
  } catch (error) {
    console.error("Error validating password:", error);
    return { valid: false, message: "Error validating password" };
  }
}
