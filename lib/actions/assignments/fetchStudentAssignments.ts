"use server";

import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

export async function fetchStudentAssignments() {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken");

    if (!accessToken?.value) {
      throw new Error("No authentication token found");
    }

    // Decode token to get student ID
    const decoded = jwtDecode<{ id: string }>(accessToken.value);

    if (!decoded?.id) {
      throw new Error("Invalid token");
    }

    // Find the student to get their intake groups
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

    // Fetch assignments for student's intake groups
    const assignments = await prisma.assignments.findMany({
      where: {
        intakeGroups: {
          hasSome: student.intakeGroup,
        },
      },
      select: {
        id: true,
        title: true,
        type: true,
        duration: true,
        availableFrom: true,
      },
      orderBy: {
        availableFrom: "desc",
      },
    });

    return assignments;
  } catch (error) {
    console.error("Assignment fetch error:", error);
    return [];
  }
}
