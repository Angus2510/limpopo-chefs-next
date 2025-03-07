"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";

interface UpdateQuestionAnswerData {
  questionId?: string;
  answerId?: string;
  text?: string;
  mark?: string;
  correctAnswer?: any;
  options?: {
    id: string;
    value?: string;
    columnA?: string;
    columnB?: string;
  }[];
  scores?: number | null;
  moderatedscores?: number | null;
}

export async function updateQuestionAnswer(data: UpdateQuestionAnswerData) {
  console.log("📥 Received question/answer update request:", data);

  try {
    const updates = [];

    // Update question if questionId is provided
    if (data.questionId && ObjectId.isValid(data.questionId)) {
      console.log("📝 Preparing question update...");
      const questionUpdate = prisma.questions.update({
        where: { id: data.questionId },
        data: {
          ...(data.text && { text: data.text }),
          ...(data.mark && { mark: data.mark }),
          ...(data.correctAnswer && { correctAnswer: data.correctAnswer }),
          ...(data.options && {
            options: {
              set: data.options,
            },
          }),
        },
      });
      updates.push(questionUpdate);
    }

    // Update answer if answerId is provided
    if (data.answerId && ObjectId.isValid(data.answerId)) {
      console.log("📝 Preparing answer update...");
      const answerUpdate = prisma.answers.update({
        where: { id: data.answerId },
        data: {
          ...(data.scores !== undefined && { scores: data.scores }),
          ...(data.moderatedscores !== undefined && {
            moderatedscores: data.moderatedscores,
          }),
        },
      });
      updates.push(answerUpdate);
    }

    const results = await prisma.$transaction(updates);
    console.log("✅ Updates successful:", results);

    revalidatePath("/admin/assignment", "page");
    revalidatePath("/admin/assignment/[id]", "page");
    revalidatePath("/admin/assignment/edit/[id]", "page");

    return {
      success: true,
      data: {
        question: results[0],
        answer: results[1],
      },
    };
  } catch (error) {
    console.error("❌ Update failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update",
    };
  }
}
