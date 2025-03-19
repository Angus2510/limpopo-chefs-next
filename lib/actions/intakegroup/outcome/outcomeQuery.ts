"use server";
import prisma from "@/lib/db";

export const getAllOutcomes = async () => {
  const outcomes = await prisma.outcomes.findMany({
    select: {
      id: true,
      title: true,
      type: true,
      hidden: true,
    },
  });

  return outcomes;
};
