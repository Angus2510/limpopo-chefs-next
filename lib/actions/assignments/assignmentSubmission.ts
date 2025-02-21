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
  answers: SubmitAnswer[]
) {
  try {
    console.log("📝 Starting assignment submission process...");

    // Get student ID from token
    const token = cookies().get("accessToken")?.value;
    if (!token) throw new Error("Authentication required");

    const decoded = jwtDecode<{ id: string }>(token);
    if (!decoded?.id) throw new Error("Invalid token");

    console.log("👤 Student ID:", decoded.id);

    // Get assignment details for campus and intake group
    const assignment = await prisma.assignments.findUnique({
      where: { id: assignmentId },
      select: {
        campus: true,
        intakeGroups: true,
        outcome: true,
      },
    });

    if (!assignment) throw new Error("Assignment not found");

    // Get student details for campus
    const student = await prisma.students.findUnique({
      where: { id: decoded.id },
      select: { campus: true },
    });

    if (!student) throw new Error("Student not found");

    // Create assignment result according to schema
    const result = await prisma.assignmentresults.create({
      data: {
        assignment: assignmentId,
        student: decoded.id,
        answers: answers.map((ans) =>
          JSON.stringify({
            question: ans.questionId,
            answer: ans.answer,
          })
        ),
        campus: student.campus[0], // Using first campus if multiple
        intakeGroup: assignment.intakeGroups[0], // Using first intake group if multiple
        outcome: assignment.outcome[0], // Using first outcome if multiple
        dateTaken: new Date(),
        status: "submitted",
        scores: null, // Will be scored later
        moderatedscores: null,
        v: 0, // Schema requires this field
      },
    });

    console.log("✅ Assignment submission successful:", {
      resultId: result.id,
      answersCount: answers.length,
    });

    return result;
  } catch (error) {
    console.error("❌ Assignment submission failed:", error);
    throw error;
  }
}
