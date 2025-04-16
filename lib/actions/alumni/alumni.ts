import prisma from "@/lib/db";
import type { GetStudentsSchema } from "@/types/student/students";
import { Prisma } from "@prisma/client";

export async function getAlumniData(params: GetStudentsSchema) {
  try {
    const {
      page = 1,
      per_page = 10,
      sort = "createdAt",
      campusTitles,
      intakeGroupTitles,
      search,
    } = params;

    // Calculate pagination
    const skip = (page - 1) * per_page;

    // Base query conditions
    const where: Prisma.studentsWhereInput = {
      alumni: true,
      ...(campusTitles?.length ? { campus: { hasSome: campusTitles } } : {}),
      ...(intakeGroupTitles?.length
        ? { intakeGroup: { hasSome: intakeGroupTitles } }
        : {}),
      ...(search
        ? {
            OR: [
              {
                admissionNumber: {
                  contains: search,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
              {
                profile: {
                  firstName: {
                    contains: search,
                    mode: "insensitive" as Prisma.QueryMode,
                  },
                },
              },
              {
                profile: {
                  lastName: {
                    contains: search,
                    mode: "insensitive" as Prisma.QueryMode,
                  },
                },
              },
            ],
          }
        : {}),
    };

    // Define orderBy based on sort field
    let orderBy: Prisma.studentsOrderByWithRelationInput;

    // Handle different sort fields
    switch (sort) {
      case "profile.firstName":
        orderBy = {
          profile: {
            firstName: "desc",
          },
        };
        break;
      case "profile.lastName":
        orderBy = {
          profile: {
            lastName: "desc",
          },
        };
        break;
      case "admissionNumber":
        orderBy = {
          admissionNumber: "desc",
        };
        break;
      case "email":
        orderBy = {
          email: "desc",
        };
        break;
      default:
        orderBy = {
          createdAt: "desc",
        };
    }

    // Fetch students with pagination
    const students = await prisma.students.findMany({
      where,
      skip,
      take: per_page,
      orderBy,
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
    const pageCount = Math.ceil(total / per_page);

    return {
      students,
      pageCount,
    };
  } catch (error) {
    console.error("Error fetching alumni data:", error);
    throw new Error("Failed to fetch alumni data");
  }
}
