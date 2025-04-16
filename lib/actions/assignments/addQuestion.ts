"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";

interface AddQuestionData {
  text: string;
  type: string;
  mark: string;
  options: {
    id: string;
    value: string;
  }[];
  correctAnswer: any;
  assignmentId: string;
}

export async function addQuestion(data: AddQuestionData) {
  try {
    console.log("📝 Adding new question...", data);

    if (!ObjectId.isValid(data.assignmentId)) {
      throw new Error("Invalid assignment ID");
    }

    // Format options based on question type
    let formattedOptions = [];
    let formattedCorrectAnswer = data.correctAnswer;

    switch (data.type) {
      case "multiple-choice":
        formattedOptions = data.options.map((opt) => ({
          id: new ObjectId().toString(),
          value: opt.value,
          columnA: null,
          columnB: null,
        }));
        break;

      case "true-false":
        formattedOptions = [
          {
            id: new ObjectId().toString(),
            value: "true",
            columnA: null,
            columnB: null,
          },
          {
            id: new ObjectId().toString(),
            value: "false",
            columnA: null,
            columnB: null,
          },
        ];
        formattedCorrectAnswer = data.correctAnswer.toLowerCase();
        break;

      case "short-answer":
      case "long-answer":
        formattedOptions = [];
        break;

      default:
        throw new Error(`Unsupported question type: ${data.type}`);
    }

    // Create the question with formatted data
    const questionData = {
      text: data.text,
      type: data.type,
      mark: data.mark,
      correctAnswer: formattedCorrectAnswer,
      options: formattedOptions,
      v: 0, // Version field as seen in createAssignment
    };

    // Create the question
    const question = await prisma.questions.create({
      data: questionData,
      select: {
        id: true,
        text: true,
        type: true,
        mark: true,
        correctAnswer: true,
        options: true,
      },
    });

    // Update the assignment with the new question ID
    await prisma.assignments.update({
      where: {
        id: data.assignmentId,
      },
      data: {
        questions: {
          push: question.id,
        },
        updatedAt: new Date(),
      },
    });

    revalidatePath(`/admin/assignment/${data.assignmentId}`);
    console.log("✅ Question added successfully:", question);

    return {
      success: true,
      data: question,
    };
  } catch (error) {
    console.error("❌ Failed to add question:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add question",
    };
  }
}
