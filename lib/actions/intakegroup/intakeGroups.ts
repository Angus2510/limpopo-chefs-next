// /lib/actions/intakeGroups.ts
import prisma from "@/lib/db";

/**
 * Fetches all intake groups.
 * @returns {Promise<Object[]>} The fetched intake groups with their IDs and titles.
 */
export const getAllIntakeGroups = async () => {
  const intakeGroups = await prisma.intakegroups.findMany({
    select: {
      id: true,
      title: true,
    },
  });

  return intakeGroups;
};
