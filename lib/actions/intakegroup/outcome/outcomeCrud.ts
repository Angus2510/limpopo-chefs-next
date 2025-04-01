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

export const createOutcome = async (data: {
  title: string;
  type: string;
  hidden: boolean;
}) => {
  const outcome = await prisma.outcomes.create({
    data: {
      title: data.title,
      type: data.type,
      hidden: data.hidden,
    },
  });
  return outcome;
};

export const updateOutcome = async (
  id: string,
  data: {
    title: string;
    type: string;
    hidden: boolean;
  }
) => {
  const outcome = await prisma.outcomes.update({
    where: { id },
    data: {
      title: data.title,
      type: data.type,
      hidden: data.hidden,
    },
  });
  return outcome;
};

export const deleteOutcome = async (id: string) => {
  await prisma.outcomes.delete({
    where: { id },
  });
};
