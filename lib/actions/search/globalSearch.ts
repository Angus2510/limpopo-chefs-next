"use server";

import prisma from "@/lib/db";
import { z } from "zod";

const searchResultSchema = z.object({
  id: z.string(),
  type: z.enum(["student", "staff", "guardian"]),
  title: z.string(),
  subtitle: z.string(),
  url: z.string(),
});

export type SearchResult = z.infer<typeof searchResultSchema>;

export async function globalSearch(
  searchTerm: string
): Promise<SearchResult[]> {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  try {
    const students = await prisma.students.findMany({
      where: {
        OR: [
          { admissionNumber: searchTerm },
          { email: { contains: searchTerm, mode: "insensitive" } },
          { username: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      include: {
        profile: true,
      },
      take: 5,
    });

    const staff = await prisma.staffs.findMany({
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
    });

    const guardians = await prisma.guardians.findMany({
      where: {
        OR: [
          { firstName: { contains: searchTerm, mode: "insensitive" } },
          { lastName: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      take: 5,
    });

    const results = [
      ...students.map(
        (student): SearchResult => ({
          id: student.id,
          type: "student",
          title: student.profile
            ? `${student.profile.firstName || ""} ${
                student.profile.lastName || ""
              }`.trim()
            : student.admissionNumber || "Unknown Student",
          subtitle: [student.admissionNumber, student.email]
            .filter(Boolean)
            .join(" • "),
          url: `/admin/student/studentView/${student.id}`,
        })
      ),
      ...staff.map(
        (staffMember): SearchResult => ({
          id: staffMember.id,
          type: "staff",
          title: `${staffMember.profile?.firstName || ""} ${
            staffMember.profile?.lastName || ""
          }`.trim(),
          subtitle: staffMember.email || "",
          url: `/admin/settings/staff/edit/${staffMember.id}`,
        })
      ),
      ...guardians.map(
        (guardian): SearchResult => ({
          id: guardian.id,
          type: "guardian",
          title: `${guardian.firstName || ""} ${
            guardian.lastName || ""
          }`.trim(),
          subtitle: guardian.email || "",
          url: `/admin/student/studentView/${guardian.studentId}`,
        })
      ),
    ].filter((result) => result.title !== "");

    return results;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Search error:", error.message);
    }
    return [];
  }
}
