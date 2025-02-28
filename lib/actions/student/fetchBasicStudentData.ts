"use server";
import prisma from "@/lib/db";

export async function fetchBasicStudentData(studentId: string) {
  try {
    if (!studentId) {
      throw new Error("Student ID is required");
    }

    const student = await prisma.students.findUnique({
      where: { id: studentId },
      include: {
        profile: {
          include: {
            address: true,
          },
        },
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    // Handle guardians
    let guardians = [];
    if (
      student.guardians &&
      Array.isArray(student.guardians) &&
      student.guardians.length > 0
    ) {
      guardians = await prisma.guardians.findMany({
        where: { id: { in: student.guardians } },
      });
    }

    // Process titles
    const campusArray = Array.isArray(student.campus)
      ? student.campus
      : typeof student.campus === "string"
      ? [student.campus]
      : [];

    const intakeGroupArray = Array.isArray(student.intakeGroup)
      ? student.intakeGroup
      : typeof student.intakeGroup === "string"
      ? [student.intakeGroup]
      : [];

    const qualificationArray = Array.isArray(student.qualification)
      ? student.qualification
      : typeof student.qualification === "string"
      ? [student.qualification]
      : [];

    // Get titles
    const [campuses, intakeGroups, qualifications] = await Promise.all([
      prisma.campus.findMany({
        where: campusArray.length ? { id: { in: campusArray } } : undefined,
      }),
      prisma.intakegroups.findMany({
        where: intakeGroupArray.length
          ? { id: { in: intakeGroupArray } }
          : undefined,
      }),
      prisma.qualifications.findMany({
        where: qualificationArray.length
          ? { id: { in: qualificationArray } }
          : undefined,
      }),
    ]);

    // Create lookup maps
    const campusMap = Object.fromEntries(campuses.map((c) => [c.id, c.title]));
    const intakeGroupMap = Object.fromEntries(
      intakeGroups.map((g) => [g.id, g.title])
    );
    const qualificationMap = Object.fromEntries(
      qualifications.map((q) => [q.id, q.title])
    );

    // Add titles to student object
    const enhancedStudent = {
      ...student,
      campusTitle: campusArray.map((id) => campusMap[id] || id).join(", "),
      intakeGroupTitle: intakeGroupArray
        .map((id) => intakeGroupMap[id] || id)
        .join(", "),
      qualificationTitle: qualificationArray
        .map((id) => qualificationMap[id] || id)
        .join(", "),
    };

    return { student: enhancedStudent, guardians };
  } catch (error) {
    console.error("Error fetching basic student data:", error);
    throw error;
  }
}
