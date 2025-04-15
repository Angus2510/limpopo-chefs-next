"use server";

import prisma from "@/lib/db";
import { getAllCampuses } from "../campus/campuses";
import { getAllIntakeGroups } from "../intakegroup/intakeGroups";

export async function getArrearsReport(
  campusFilter?: string[],
  intakeFilter?: string[]
) {
  try {
    const [finances, campuses, intakeGroups] = await Promise.all([
      prisma.finances.findMany({
        select: {
          student: true,
          collectedFees: true,
        },
        where: {
          collectedFees: {
            some: {
              debit: {
                not: null,
              },
            },
          },
        },
      }),
      getAllCampuses(),
      getAllIntakeGroups(),
    ]);

    // Get unique student IDs
    const studentIds = [...new Set(finances.map((finance) => finance.student))];

    // Get students with these IDs and apply filters
    const students = await prisma.students.findMany({
      where: {
        id: { in: studentIds },
        ...(campusFilter?.length ? { campus: { hasSome: campusFilter } } : {}),
        ...(intakeFilter?.length
          ? { intakeGroup: { hasSome: intakeFilter } }
          : {}),
      },
      include: {
        profile: true,
      },
    });

    // Create lookup maps
    const campusMap = new Map(campuses.map((c) => [c.id, c.title]));
    const intakeGroupMap = new Map(intakeGroups.map((g) => [g.id, g.title]));

    const studentsWithDetails = students.map((student) => ({
      id: student.id,
      admissionNumber: student.admissionNumber,
      firstName: student.profile?.firstName,
      lastName: student.profile?.lastName,
      campus: Array.isArray(student.campus)
        ? student.campus.map((id) => campusMap.get(id) || id).join(", ")
        : campusMap.get(student.campus as string) || student.campus || "N/A",
      intakeGroup: Array.isArray(student.intakeGroup)
        ? student.intakeGroup
            .map((id) => intakeGroupMap.get(id) || id)
            .join(", ")
        : intakeGroupMap.get(student.intakeGroup as string) ||
          student.intakeGroup ||
          "N/A",
    }));

    return {
      students: studentsWithDetails,
      campuses,
      intakeGroups,
    };
  } catch (error) {
    console.error("Error in getArrearsReport:", error);
    throw error;
  }
}
