import prisma from "@/lib/db";
import type { GetStudentsSchema } from "@/types/student/students";

export async function getAlumniData(params: GetStudentsSchema) {
  try {
    const {
      page = 1,
      per_page = 10,
      sort = "createdAt",
      campus,
      intakeGroup,
      search,
    } = params;

    // Calculate pagination
    const skip = (page - 1) * per_page;

    // Base query conditions
    const where = {
      alumni: true,
      ...(campus ? { campus: { hasSome: [campus] } } : {}),
      ...(intakeGroup ? { intakeGroup: { hasSome: [intakeGroup] } } : {}),
      ...(search
        ? {
            OR: [
              { admissionNumber: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              {
                "profile.firstName": { contains: search, mode: "insensitive" },
              },
              { "profile.lastName": { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    // Fetch students with pagination
    const students = await prisma.students.findMany({
      where,
      skip,
      take: per_page,
      orderBy: {
        // Fix: Use correct field name without .asc/.desc
        [sort]: "desc",
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
