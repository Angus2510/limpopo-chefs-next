"use server";

import prisma from "@/lib/db";

export async function submitScore(
  assignmentId: string,
  score: number,
  staffId: string
) {
  const result = await prisma.assignmentresults.update({
    where: { id: assignmentId },
    data: {
      scores: score,
      status: "marked",
      markedAt: new Date(),
      markedBy: staffId,
    },
  });

  return result;
}
