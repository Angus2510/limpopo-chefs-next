"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Define types based on your schema
interface Question {
  text: string;
  type: string;
  mark: string;
  correctAnswer: string | string[] | { columnA: string; columnB: string }[];
  options?: { value?: string; columnA?: string; columnB?: string }[];
}

interface AssignmentInput {
  title: string;
  type: "test" | "task";
  duration: number;
  availableFrom: Date;
  availableUntil?: Date | null;
  campus: string[];
  intakeGroups: string[];
  individualStudents: string[];
  outcomes: string[];
  lecturer: string;
  questions: Question[];
}

// Validation schema for questions
const questionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  type: z.string(),
  mark: z.string(),
  correctAnswer: z.union([
    z.string(),
    z.array(z.string()),
    z.array(
      z.object({
        columnA: z.string(),
        columnB: z.string(),
      })
    ),
  ]),
  options: z
    .array(
      z.object({
        value: z.string().optional(),
        columnA: z.string().optional(),
        columnB: z.string().optional(),
      })
    )
    .optional(),
});

export async function createAssignment(data: AssignmentInput) {
  try {
    // First, create all questions
    const questionPromises = data.questions.map(async (question) => {
      // Validate question
      const validatedQuestion = questionSchema.parse(question);

      return await prisma.questions.create({
        data: {
          text: validatedQuestion.text,
          type: validatedQuestion.type,
          mark: validatedQuestion.mark,
          correctAnswer: validatedQuestion.correctAnswer,
          options: validatedQuestion.options || [],
        },
        select: {
          id: true,
        },
      });
    });

    const createdQuestions = await Promise.all(questionPromises);
    const questionIds = createdQuestions.map((q) => q.id);

    // Generate a random password for the test
    const testPassword = Math.random().toString(36).slice(-8);

    // Create the assignment
    const assignment = await prisma.assignments.create({
      data: {
        title: data.title,
        type: data.type,
        duration: data.duration,
        availableFrom: data.availableFrom,
        availableUntil: data.availableUntil,
        campus: data.campus,
        intakeGroups: data.intakeGroups,
        individualStudents: data.individualStudents,
        outcome: data.outcomes,
        lecturer: data.lecturer,
        questions: questionIds,
        password: testPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/assignments");

    return {
      success: true,
      data: {
        ...assignment,
        testPassword, // Return the password so it can be shown to the lecturer
      },
    };
  } catch (error) {
    console.error("Error creating assignment:", error);
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation error: ${error.errors.map((e) => e.message).join(", ")}`
      );
    }
    throw new Error("Failed to create assignment");
  }
}
