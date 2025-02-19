"use server";

import prisma from "@/lib/db";
import { ObjectId } from "mongodb";

export async function getAssignmentById(id: string) {
  try {
    if (!id || !ObjectId.isValid(id)) {
      throw new Error("Invalid assignment ID");
    }

    // First get the assignment with its question IDs
    const assignment = await prisma.assignments.findFirst({
      where: { id },
      select: {
        id: true,
        title: true,
        type: true,
        duration: true,
        availableFrom: true,
        availableUntil: true,
        campus: true,
        intakeGroups: true,
        outcome: true,
        password: true,
        questions: true,
        lecturer: true,
      },
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    // Get the full question details
    const questionDetails = await Promise.all(
      assignment.questions.map(async (questionId) => {
        const question = await prisma.questions.findUnique({
          where: { id: questionId },
          select: {
            id: true,
            text: true,
            type: true,
            mark: true,
            correctAnswer: true,
            options: true,
          },
        });
        return question;
      })
    );

    // Return assignment with full question details
    return {
      ...assignment,
      questions: questionDetails.filter(Boolean), // Remove any null values
    };
  } catch (error) {
    console.error("Failed to fetch assignment:", error);
    return null;
  }
}
