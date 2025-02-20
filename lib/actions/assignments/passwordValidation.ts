"use server";

import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

export async function validateAssignmentPassword(
  assignmentId: string,
  password: string
) {
  try {
    const cookieStore = cookies();
    const token = await cookieStore.get("accessToken")?.value;

    if (!token) {
      throw new Error("No authentication token found");
    }

    const decoded = jwtDecode(token) as {
      id?: string;
      userType?: string;
    } | null;

    if (!decoded || !decoded.id || decoded.userType !== "Student") {
      throw new Error("Invalid token or unauthorized access");
    }

    const assignment = await prisma.assignments.findUnique({
      where: { id: assignmentId },
      select: { password: true },
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    if (assignment.password !== password) {
      throw new Error("Invalid password");
    }

    return { success: true };
  } catch (error) {
    console.error("Error validating password:", error);
    throw error;
  }
}
