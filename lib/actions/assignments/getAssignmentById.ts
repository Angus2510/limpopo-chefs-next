"use server";

import prisma from "@/lib/db";
import { ObjectId } from "mongodb";

export async function getAssignmentById(id: string) {
  try {
    console.log(`🔍 Fetching assignment with ID: ${id}`);
    if (!id || !ObjectId.isValid(id)) {
      console.error(`❌ Invalid assignment ID: ${id}`);
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
      console.error(`❌ Assignment not found with ID: ${id}`);
      throw new Error("Assignment not found");
    }

    console.log(
      `✅ Found assignment: ${assignment.title} with ${assignment.questions.length} questions`
    );

    // Get all questions in a single batch query instead of individual queries
    const questions = await prisma.questions.findMany({
      where: {
        id: {
          in: assignment.questions,
        },
      },
      select: {
        id: true,
        text: true,
        type: true,
        mark: true,
        correctAnswer: true,
        options: true,
      },
    });

    console.log(`📝 Retrieved ${questions.length} questions with details`);

    // Verify correctAnswer is present on questions
    const hasCorrectAnswers = questions.some(
      (q) => q.correctAnswer !== undefined && q.correctAnswer !== null
    );
    console.log(
      `${
        hasCorrectAnswers ? "✅" : "⚠️"
      } Correct answers found: ${hasCorrectAnswers}`
    );

    // Calculate total marks with proper string to number conversion
    const totalMarks = questions.reduce((sum, question) => {
      const markValue = parseInt((question.mark as string) || "0", 10);
      return sum + (isNaN(markValue) ? 0 : markValue);
    }, 0);

    console.log(`📊 Total marks for assignment: ${totalMarks}`);

    // Map the questions into the same order as the assignment.questions array
    const orderedQuestions = assignment.questions
      .map((qId) => questions.find((q) => q.id === qId))
      .filter(Boolean); // Remove any null values

    // Return assignment with full question details and total marks
    return {
      ...assignment,
      questions: orderedQuestions,
      totalMarks,
    };
  } catch (error) {
    console.error("Failed to fetch assignment:", error);
    return null;
  }
}
