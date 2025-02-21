"use server";

import prisma from "@/lib/db";

export async function validatePassword(assignmentId: string, password: string) {
  try {
    console.log("🔐 Starting password validation...");
    console.log("📝 Validating password for assignment:", {
      assignmentId,
      passwordProvided: !!password,
    });

    if (!assignmentId || !password) {
      console.log("❌ Missing required fields");
      throw new Error("Missing required fields");
    }

    const assignment = await prisma.assignments.findUnique({
      where: { id: assignmentId },
      select: { password: true },
    });

    if (!assignment) {
      console.log("❌ Assignment not found:", assignmentId);
      throw new Error("Assignment not found");
    }

    const isValidPassword = assignment.password === password;
    console.log("🔑 Password validation result:", {
      isValid: isValidPassword,
      assignmentId,
    });

    if (!isValidPassword) {
      throw new Error("Invalid password");
    }

    console.log("✅ Password validated successfully");
    return true;
  } catch (error) {
    console.error("🔥 Password validation error:", error);
    throw error;
  }
}
