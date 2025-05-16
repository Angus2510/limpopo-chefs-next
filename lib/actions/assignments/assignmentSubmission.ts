"use server";

import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

interface SubmitAnswer {
  questionId: string;
  answer: string | { [key: string]: string };
  timeSpent?: number;
}

export async function submitAssignment(
  assignmentId: string,
  answers: SubmitAnswer[]
) {
  try {
    console.group("📝 Assignment Submission Debug");
    console.log("Input Data:", {
      assignmentId,
      answers: answers.map((a) => ({
        questionId: a.questionId,
        answerType: typeof a.answer,
        answer: a.answer,
        timeSpent: a.timeSpent,
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

    // Get student details FIRST to ensure we have valid data
    const student = await prisma.students.findUnique({
      where: { id: decoded.id },
      select: {
        campus: true,
        intakeGroup: true,
        email: true,
        profile: true,
        username: true,
      },
    });

    console.log("Student Details:", student);

    if (!student) throw new Error("Student not found");
    if (!student.campus.length)
      throw new Error("Student has no campus assigned");
    if (!student.intakeGroup.length)
      throw new Error("Student has no intake group assigned");

    // Get assignment details with complete information
    const assignment = await prisma.assignments.findUnique({
      where: { id: assignmentId },
      select: {
        campus: true,
        intakeGroups: true,
        outcome: true,
        title: true,
        type: true,
      },
    });

    console.log("Assignment Details:", assignment);

    if (!assignment) throw new Error("Assignment not found");
    if (!assignment.outcome.length) console.warn("Assignment has no outcomes");

    // Transform answers for storage - include timeSpent in the JSON
    const transformedAnswers = answers.map((ans) =>
      JSON.stringify({
        question: ans.questionId,
        answer: ans.answer,
        timeSpent: ans.timeSpent || 0,
      })
    );

    console.log("Transformed Answers:", transformedAnswers);

    // Find matching campus between student and assignment
    const matchingCampus =
      student.campus.find((campusId) => assignment.campus.includes(campusId)) ||
      student.campus[0];

    // Find matching intake group between student and assignment
    const matchingIntakeGroup =
      student.intakeGroup.find((groupId) =>
        assignment.intakeGroups.includes(groupId)
      ) || student.intakeGroup[0];

    // Prepare data object for creation with all required fields
    const submissionData = {
      assignment: assignmentId,
      student: decoded.id,
      answers: transformedAnswers,
      campus: matchingCampus,
      intakeGroup: matchingIntakeGroup,
      outcome: assignment.outcome.length ? assignment.outcome[0] : null,
      dateTaken: new Date(),
      status: "submitted",
      scores: null,
      testScore: null,
      taskScore: null,
      moderatedscores: null,
      v: 0,
      // Additional data that might be useful
      feedback: JSON.stringify({
        submissionDetails: {
          studentEmail: student.email,
          studentUsername: student.username,
          assignmentTitle: assignment.title,
          assignmentType: assignment.type,
          submissionTime: new Date().toISOString(),
        },
      }),
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
