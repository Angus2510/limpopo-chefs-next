"use server";

import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

interface SubmitAnswer {
  questionId: string;
  answer: string | { [key: string]: string };
}

export async function submitAssignment(
  assignmentId: string,
  answers: { questionId: string; answer: string | { [key: string]: string } }[]
) {
  try {
    console.group("📝 Assignment Submission Debug");
    console.log("Input Data:", {
      assignmentId,
      answers: answers.map((a) => ({
        questionId: a.questionId,
        answerType: typeof a.answer,
        answer: a.answer,
      })),
    });

    // Get student ID from token
    const token = cookies().get("accessToken")?.value;
    if (!token) throw new Error("Authentication required");

    const decoded = jwtDecode<{ id: string }>(token);
    if (!decoded?.id) throw new Error("Invalid token");

    console.log("Authentication:", {
      studentId: decoded.id,
      tokenPresent: !!token,
    });

    // Get assignment details for campus and intake group
    const assignment = await prisma.assignments.findUnique({
      where: { id: assignmentId },
      select: {
        campus: true,
        intakeGroups: true,
        outcome: true,
      },
    });

    console.log("Assignment Details:", assignment);

    if (!assignment) throw new Error("Assignment not found");

    // Get student details for campus
    const student = await prisma.students.findUnique({
      where: { id: decoded.id },
      select: { campus: true },
    });

    console.log("Student Details:", student);

    if (!student) throw new Error("Student not found");

    // Transform answers for storage
    const transformedAnswers = answers.map((ans) =>
      JSON.stringify({
        question: ans.questionId,
        answer: ans.answer,
      })
    );

    console.log("Transformed Answers:", transformedAnswers);

    // Prepare data object for creation
    const submissionData = {
      assignment: assignmentId,
      student: decoded.id,
      answers: transformedAnswers,
      campus: student.campus[0],
      intakeGroup: assignment.intakeGroups[0],
      outcome: assignment.outcome[0],
      dateTaken: new Date(),
      status: "submitted",
      scores: null,
      moderatedscores: null,
      v: 0,
    };

    console.log("Data to be saved:", submissionData);

    // Create assignment result
    const result = await prisma.assignmentresults.create({
      data: submissionData,
    });

    console.log("💾 Saved Result:", {
      resultId: result.id,
      savedData: result,
      answersCount: answers.length,
    });

    console.groupEnd();
    return result;
  } catch (error) {
    console.group("❌ Submission Error");
    console.error("Error details:", error);
    console.error("Failed submission data:", {
      assignmentId,
      answers,
      timestamp: new Date().toISOString(),
    });
    console.groupEnd();
    throw error;
  }
}
