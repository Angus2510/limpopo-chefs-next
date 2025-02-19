"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { ObjectId } from "mongodb";

interface TokenPayload {
  id: string;
  userType: string;
  exp: number;
}

interface QuestionOption {
  value?: string;
  columnA?: string;
  columnB?: string;
}

export async function createAssignment(data: AssignmentDataPayload) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken");

    if (!token?.value) {
      throw new Error("No authentication token found");
    }

    const decoded = jwtDecode<TokenPayload>(token.value);

    if (!decoded?.id || decoded.exp < Date.now() / 1000) {
      throw new Error("Invalid or expired token");
    }

    // Create questions first
    const questions = await Promise.all(
      data.questions.map(async (question) => {
        let formattedCorrectAnswer: any = question.correctAnswer;
        let formattedOptions: QuestionsOptions[] = [];

        switch (question.type) {
          case "multiple-choice":
            formattedOptions = question.options
              .filter((opt) => opt.value)
              .map((opt) => ({
                id: new ObjectId().toString(),
                value: opt.value,
                columnA: null,
                columnB: null,
              }));
            break;

          case "matching":
            formattedOptions = question.options
              .filter((opt) => opt.columnA && opt.columnB)
              .map((opt) => ({
                id: new ObjectId().toString(),
                value: null,
                columnA: opt.columnA,
                columnB: opt.columnB,
              }));
            formattedCorrectAnswer = JSON.stringify(formattedOptions);
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
            formattedCorrectAnswer = question.correctAnswer.toLowerCase();
            break;

          case "short-answer":
          case "long-answer":
            formattedOptions = [];
            break;

          default:
            throw new Error(`Unsupported question type: ${question.type}`);
        }

        // Create the question
        const createdQuestion = await prisma.questions.create({
          data: {
            text: question.text,
            type: question.type,
            mark: question.mark,
            correctAnswer: formattedCorrectAnswer,
            options: formattedOptions,
            v: 0,
          },
        });

        return createdQuestion;
      })
    );

    // Rest of the code remains the same...
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
        lecturer: decoded.id,
        questions: questions.map((q) => q.id),
        password: Math.random().toString(36).slice(-8).toUpperCase(),
        createdAt: new Date(),
        updatedAt: new Date(),
        v: 0,
      },
    });

    revalidatePath("/admin/assignment");

    return {
      success: true,
      data: {
        id: assignment.id,
        testPassword: assignment.password,
      },
    };
  } catch (error) {
    console.error("Assignment creation failed:", {
      message: error instanceof Error ? error.message : "Unknown error",
      type: error instanceof Error ? error.constructor.name : "Unknown",
    });

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create assignment",
    };
  }
}

// Add this interface to match your Prisma schema
interface QuestionsOptions {
  id: string;
  value?: string | null;
  columnA?: string | null;
  columnB?: string | null;
}
