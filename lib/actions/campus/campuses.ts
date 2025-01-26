// /lib/actions/campuses.ts
import prisma from '@/lib/db';

/**
 * Fetches all campuses.
 * @returns {Promise<Object[]>} The fetched campuses with their IDs and titles.
 */
export const getAllCampuses = async () => {
  const campuses = await prisma.campus.findMany({
    select: {
      id: true,
      title: true,
    },
  });

  return campuses;
};
