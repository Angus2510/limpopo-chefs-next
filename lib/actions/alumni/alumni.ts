"use server";

import prisma from "@/lib/db";
import { GetStudentsSchema } from "@/types/student/students";

export async function getAlumniData(params: GetStudentsSchema) {
  try {
    const page = params.page ?? 1;
    const perPage = params.per_page ?? 10;
    const search = params.search;
    const skip = (page - 1) * perPage;

    // Build the where clause
    let where: any = {
      alumni: true, // Only get alumni students
    };

    // Add search condition if search parameter exists
    if (search) {
      where.OR = [
        {
          admissionNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          profile: {
            is: {
              OR: [
                {
                  firstName: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  lastName: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            },
          },
        },
      ];
    }

    // Add campus filter if provided
    if (params.campusTitles?.length) {
      where.campus = {
        hasSome: params.campusTitles,
      };
    }

    // Add intake group filter if provided
    if (params.intakeGroupTitles?.length) {
      where.intakeGroup = {
        hasSome: params.intakeGroupTitles,
      };
    }

    // Fetch students with pagination
    const students = await prisma.students.findMany({
      where,
      skip,
      take: perPage,
      orderBy: params.sort
        ? {
            [params.sort.split(".")[0]]: params.sort.split(".")[1],
          }
        : {
            createdAt: "desc",
          },
      select: {
        id: true,
        admissionNumber: true,
        email: true,
        profile: true,
        campus: true,
        intakeGroup: true,
        active: true,
        alumni: true,
        createdAt: true,
      },
    });

    // Get total count for pagination
    const total = await prisma.students.count({ where });
    const pageCount = Math.ceil(total / perPage);

    return {
      students,
      pageCount,
    };
  } catch (error) {
    console.error("Error fetching alumni data:", error);
    throw error;
  }
}
