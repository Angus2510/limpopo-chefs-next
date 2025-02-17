"use server";

import prisma from "@/lib/db";
import { Guardian } from "@/types/guardians/guardians";

export async function getStudentGuardians(
  studentId: string | undefined
): Promise<Guardian[]> {
  if (!studentId) {
    console.warn("No student ID provided to getStudentGuardians");
    return [];
  }

  try {
    const guardians = await prisma.guardians.findMany({
      where: {
        students: {
          some: {
            id: studentId,
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        mobileNumber: true,
        relation: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return guardians || [];
  } catch (error) {
    console.error("Error fetching student guardians:", error);
    // Return empty array instead of throwing
    return [];
  }
}
