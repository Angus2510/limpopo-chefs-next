"use server";

import prisma from "@/lib/db";
import { Assignment } from "@/types/assignments/assignments";

export async function getAssignments(): Promise<Assignment[]> {
  try {
    const assignments = await prisma.assignments.findMany({
      orderBy: [
        {
          availableFrom: "desc",
        },
      ],
      select: {
        id: true,
        title: true,
        type: true,
        duration: true,
        availableFrom: true,
        createdAt: true,
        questions: true,
        lecturer: true,
        v: true,
        password: true,
        campus: true,
        intakeGroups: true,
        individualStudents: true,
        outcome: true,
        updatedAt: true,
        availableUntil: true,
      },
    });

    return assignments;
  } catch (error) {
    console.error("Failed to fetch assignments:", error);
    return [];
  }
}
