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

    // Get assignments
    const assignments = await prisma.assignments.findMany({
      where: {
        intakeGroups: {
          hasSome: student.intakeGroup,
        },
      },
      orderBy: {
        availableFrom: "desc",
      },
    });

    // Check completion status separately
    const completedAssignments = await prisma.assignmentresults.findMany({
      where: {
        student: decoded.id,
        status: "submitted",
      },
      select: {
        assignment: true,
      },
    });

    const completedAssignmentIds = new Set(
      completedAssignments.map((result) => result.assignment)
    );

    // Add completion status to assignments
    return assignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      type: assignment.type,
      duration: assignment.duration,
      availableFrom: assignment.availableFrom,
      completed: completedAssignmentIds.has(assignment.id),
    }));
  } catch (error) {
    console.error("Assignment fetch error:", error);
    return [];
  }
}
