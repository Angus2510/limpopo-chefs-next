"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";

export async function updateAssignment(id: string, data: any) {
  if (!id || !ObjectId.isValid(id)) {
    throw new Error("Invalid assignment ID");
  }

  try {
    // First update the assignment
    const updated = await prisma.assignments.update({
      where: { id },
      data: {
        title: data.title,
        type: data.type,
        duration: parseInt(data.duration),
        availableFrom: new Date(data.availableFrom),
        campus: Array.isArray(data.campus) ? data.campus : [],
        intakeGroups: Array.isArray(data.intakeGroups) ? data.intakeGroups : [],
        outcome: Array.isArray(data.outcomes) ? data.outcomes : [],
        questions: Array.isArray(data.questions)
          ? data.questions.map((q: any) => q.id)
          : [],
        updatedAt: new Date(),
      },
    });

    // Then update each question
    if (Array.isArray(data.questions)) {
      await Promise.all(
        data.questions.map((question: any) =>
          prisma.questions.update({
            where: { id: question.id },
            data: {
              text: question.text || "",
              type: question.type || "short-answer",
              mark: question.mark ? String(question.mark) : "1",
              correctAnswer: question.correctAnswer || "",
              options: Array.isArray(question.options) ? question.options : [],
            },
          })
        )
      );
    }

    revalidatePath("/admin/assignment");
    return updated;
  } catch (error) {
    console.error("Failed to update assignment:", error);
    throw error;
  }
}
