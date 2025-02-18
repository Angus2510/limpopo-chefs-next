"use server";

import prisma from "@/lib/db";
import { Assignment } from "@/types/assignments";

export async function getAssignments(): Promise<Assignment[]> {
  try {
    const assignments = await prisma.assignments.findMany({
      orderBy: {
        createdAt: "desc",
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
        individualStudents: true,
        outcome: true,
        lecturer: true,
        questions: true,
        password: true,
        createdAt: true,
        updatedAt: true,
        v: true,
      },
    });

    return assignments;
  } catch (error) {
    console.error("Failed to fetch assignments:", error);
    return []; // Return empty array instead of throwing
  }
}
