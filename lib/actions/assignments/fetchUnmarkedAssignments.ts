"use server";

import prisma from "@/lib/db";

export async function fetchUnmarkedAssignments() {
  try {
    const results = await prisma.assignmentresults.findMany({
      where: {
        scores: null,
      },
      select: {
        id: true,
        dateTaken: true,
        scores: true,
        student: true,
        assignment: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        dateTaken: "desc",
      },
    });

    return results;
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
}
