"use server";

import prisma from "@/lib/db";
import { ObjectId } from "mongodb";

export async function getAssignmentById(id: string) {
  try {
    if (!id || !ObjectId.isValid(id)) {
      throw new Error("Invalid assignment ID");
    }

    const assignment = await prisma.assignments.findFirst({
      where: {
        id,
      },
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
      throw new Error("Assignment not found");
    }

    return assignment;
  } catch (error) {
    console.error("Failed to fetch assignment:", error);
    return null;
  }
}
