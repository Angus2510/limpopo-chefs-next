"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

interface QuestionData {
  text: string;
  type: string;
  mark: string;
  correctAnswer: string;
  options: any[];
}

interface AssignmentDataPayload {
  title: string;
  type: string;
  duration: number;
  availableFrom: string;
  availableUntil: null;
  campus: string[];
  intakeGroups: string[];
  individualStudents: string[];
  outcomes: string[];
  lecturer: string;
  questions: QuestionData[];
}

export async function createAssignment(data: AssignmentDataPayload) {
  try {
    console.log("Starting assignment creation with data:", {
      title: data.title,
      type: data.type,
      questionCount: data.questions.length,
    });

    // Create questions first
    const questions = await Promise.all(
      data.questions.map(async (question, index) => {
        console.log(`Creating question ${index + 1}:`, {
          text: question.text,
          type: question.type,
        });

        return await prisma.questions.create({
          data: {
            text: question.text,
            type: question.type,
            mark: question.mark,
            correctAnswer: question.correctAnswer,
            options: question.options || [],
            v: 0,
          },
        });
      })
    );

    console.log("Successfully created questions:", questions.length);

    // Generate password
    const testPassword = Math.random().toString(36).slice(-8).toUpperCase();

    console.log(
      "Creating assignment with questions:",
      questions.map((q) => q.id)
    );

    // Create assignment
    const assignment = await prisma.assignments.create({
      data: {
        title: data.title,
        type: data.type,
        duration: data.duration,
        availableFrom: new Date(data.availableFrom),
        availableUntil: null,
        campus: data.campus,
        intakeGroups: data.intakeGroups,
        individualStudents: [],
        outcome: data.outcomes,
        lecturer: "65c384f1c44def84952eb3d7", // System user ID
        questions: questions.map((q) => q.id),
        password: testPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        v: 0,
      },
    });

    console.log("Successfully created assignment:", assignment.id);

    revalidatePath("/admin/assignments");

    return {
      success: true,
      data: {
        id: assignment.id,
        testPassword,
        questionCount: questions.length,
      },
    };
  } catch (error) {
    console.error("Assignment creation error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create assignment",
    };
  }
}
