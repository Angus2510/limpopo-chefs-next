"use server";

import prisma from "@/lib/db";
import { ObjectId } from "mongodb";

export async function getAssignmentAnswers(assignmentId: string) {
  if (!ObjectId.isValid(assignmentId)) {
    return null;
  }

  try {
    const answers = await prisma.answers.findMany({
      where: {
        assignment: assignmentId,
      },
      select: {
        id: true,
        answer: true,
        answeredAt: true,
        scores: true,
        moderatedscores: true,
        question: true,
        student: true,
      },
    });

    return answers;
  } catch (error) {
    console.error("Failed to fetch answers:", error);
    return null;
  }
}
