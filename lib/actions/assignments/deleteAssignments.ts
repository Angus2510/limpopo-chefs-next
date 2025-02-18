"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteAssignment(id: string) {
  try {
    // Delete associated questions first
    const assignment = await prisma.assignments.findUnique({
      where: { id },
      select: { questions: true },
    });

    if (assignment?.questions) {
      await prisma.questions.deleteMany({
        where: {
          id: {
            in: assignment.questions,
          },
        },
      });
    }

    // Delete the assignment
    await prisma.assignments.delete({
      where: { id },
    });

    revalidatePath("/admin/assignments");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete assignment:", error);
    throw new Error("Failed to delete assignment");
  }
}
