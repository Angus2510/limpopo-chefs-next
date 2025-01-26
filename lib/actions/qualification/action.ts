// /lib/actions/campuses.ts
import prisma from "@/lib/db";

/**
 * Fetches all Qualifications.
 * @returns {Promise<Object[]>} The fetched campuses with their IDs and titles.
 */
export const getAllQualifications = async () => {
  const qualifications = await prisma.qualifications.findMany({
    select: {
      id: true,
      title: true,
    },
  });

  return qualifications;
};
