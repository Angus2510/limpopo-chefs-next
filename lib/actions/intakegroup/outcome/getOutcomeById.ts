"use server";

import prisma from "@/lib/db";

export async function getOutcomeById(id: string) {
  try {
    const outcome = await prisma.outcomes.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        title: true,
        type: true,
        hidden: true,
        campus: true,
      },
    });

    if (!outcome) {
      throw new Error(`Outcome with ID ${id} not found`);
    }

    return outcome;
  } catch (error) {
    console.error("Error fetching outcome:", error);
    throw error;
  }
}
