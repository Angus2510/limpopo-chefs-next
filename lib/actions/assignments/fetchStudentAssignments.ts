"use server";

import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

export async function fetchStudentAssignments() {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken");

    if (!accessToken?.value) {
      throw new Error("No authentication token found");
    }

    const decoded = jwtDecode<{ id: string }>(accessToken.value);

    if (!decoded?.id) {
      throw new Error("Invalid token");
    }

    const student = await prisma.students.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        intakeGroup: true,
      },
    });

    if (!student?.intakeGroup) {
      throw new Error("Student not found");
    }

    // Get assignments with retake information
    const assignments = await prisma.assignments.findMany({
      where: {
        intakeGroups: {
          hasSome: student.intakeGroup,
        },
      },
      orderBy: {
        availableFrom: "desc",
      },
      select: {
        id: true,
        title: true,
        type: true,
        duration: true,
        availableFrom: true,
        retake: true,
        maxAttempts: true,
      },
    });

    // Get attempt counts for each assignment
    const assignmentResults = await prisma.assignmentresults.findMany({
      where: {
        student: decoded.id,
        assignment: {
          in: assignments.map((a) => a.id),
        },
        status: "submitted",
      },
      select: {
        assignment: true,
      },
    });

    // Count attempts per assignment
    const attemptCounts = assignmentResults.reduce((acc, result) => {
      acc[result.assignment] = (acc[result.assignment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Add completion status and attempt information to assignments
    return assignments.map((assignment) => ({
      ...assignment,
      completed: attemptCounts[assignment.id] > 0,
      attempts: attemptCounts[assignment.id] || 0,
      maxAttempts: assignment.maxAttempts || 3,
      retake: assignment.retake || false,
    }));
  } catch (error) {
    console.error("Assignment fetch error:", error);
    return [];
  }
}
