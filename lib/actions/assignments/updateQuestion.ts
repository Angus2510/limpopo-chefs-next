"use server";

import prisma from "@/lib/db";

export async function updateQuestion(
  questionId: string,
  data: {
    text: string;
    mark: string;
    correctAnswer: any;
    options?: any[];
  }
) {
  try {
    const updated = await prisma.questions.update({
      where: { id: questionId },
      data: {
        text: data.text,
        mark: data.mark,
        correctAnswer: data.correctAnswer,
        options: data.options || [],
      },
    });
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: "Failed to update question" };
  }
}
