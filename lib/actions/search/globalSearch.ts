"use server";

import prisma from "@/lib/db";

export type SearchResult = {
  id: string;
  type: "student" | "staff" | "guardian";
  title: string;
  subtitle: string;
  url: string;
};

export async function globalSearch(
  searchTerm: string
): Promise<SearchResult[]> {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  try {
    const [students, staff, guardians] = await Promise.all([
      // Students search
      prisma.students.findMany({
        where: {
          OR: [
            { admissionNumber: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } },
            { username: { contains: searchTerm, mode: "insensitive" } },
            {
              importantInformation: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          ],
        },
        include: {
          profile: true,
        },
        take: 5,
      }),

      // Staff search
      prisma.staffs.findMany({
        where: {
          OR: [
            { email: { contains: searchTerm, mode: "insensitive" } },
            { username: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        include: {
          profile: true,
        },
        take: 5,
      }),

      // Guardians search
      prisma.guardians.findMany({
        where: {
          OR: [
            { firstName: { contains: searchTerm, mode: "insensitive" } },
            { lastName: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } },
            { mobileNumber: { contains: searchTerm, mode: "insensitive" } },
            { relation: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
    ]);

    const results: SearchResult[] = [];

    // Format student results
    for (const student of students) {
      if (student.profile) {
        results.push({
          id: student.id,
          type: "student",
          title: `${student.profile.firstName} ${student.profile.lastName}`,
          subtitle: `${student.admissionNumber} • ${student.email}`,
          url: `/admin/student/studentView/${student.id}`,
        });
      }
    }

    // Format staff results
    for (const staffMember of staff) {
      if (staffMember.profile) {
        results.push({
          id: staffMember.id,
          type: "staff",
          title: `${staffMember.profile.firstName} ${staffMember.profile.lastName}`,
          subtitle: staffMember.email,
          url: `/admin/settings/staff/edit/${staffMember.id}`,
        });
      }
    }

    // Format guardian results
    for (const guardian of guardians) {
      results.push({
        id: guardian.id,
        type: "guardian",
        title: `${guardian.firstName || ""} ${guardian.lastName || ""}`,
        subtitle: `${guardian.relation || "Guardian"} • ${
          guardian.email || guardian.mobileNumber || ""
        }`,
        url: `/admin/student/edit/${guardian.studentId}#guardians`,
      });
    }

    return results.filter((result) => result.title.trim() !== "");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Search error:", error.message);
    }
    return [];
  }
}
