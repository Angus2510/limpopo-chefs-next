"use server";

import prisma from "@/lib/db";

export interface StudentWithResults {
  id: string;
  name: string;
  surname: string;
  admissionNumber: string;
  alumni: boolean;
  active: boolean;
  inactiveReason?: string;
  existingMark?: number;
  existingTestScore?: number;
  existingTaskScore?: number;
  existingCompetency?: "competent" | "not_competent";
}

export async function getStudentsByIntakeAndCampus(
  intakeGroupId: string | string[],
  campusId: string,
  outcomeId?: string
): Promise<StudentWithResults[]> {
  const intakeIds = Array.isArray(intakeGroupId)
    ? intakeGroupId
    : [intakeGroupId];

  if (
    !intakeIds.length ||
    !intakeIds.every((id) => typeof id === "string" && id.length > 0)
  ) {
    throw new Error("Valid intake group IDs are required");
  }

  if (typeof campusId !== "string" || !campusId.length) {
    throw new Error("Valid campus ID is required");
  }

  try {
    console.log(
      `Fetching students for intake groups [${intakeIds.join(
        ", "
      )}] and campus ${campusId}`
    );

    // First fetch the students
    const students = await prisma.students.findMany({
      where: {
        intakeGroup: {
          hasSome: intakeIds,
        },
        campus: {
          hasSome: [campusId],
        },
      },
      select: {
        id: true,
        admissionNumber: true,
        alumni: true,
        active: true,
        inactiveReason: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { profile: { lastName: "asc" } },
        { profile: { firstName: "asc" } },
      ],
    });

    if (!students || !students.length) {
      console.log("No students found for the given criteria");
      return [];
    }

    console.log(
      `Found ${students.length} students (${
        students.filter((s) => !s.active).length
      } inactive)`
    );

    let studentResults: Record<
      string,
      {
        mark?: number;
        testScore?: number;
        taskScore?: number;
        competency?: "competent" | "not_competent";
      }
    > = {};

    // Only fetch results if we have an outcomeId and students
    if (outcomeId && students.length > 0) {
      try {
        console.log(`Fetching existing results for outcome ${outcomeId}`);

        const existingResults = await prisma.results.findMany({
          where: {
            outcomeId: outcomeId,
            studentId: {
              in: students.map((s) => s.id),
            },
          },
          select: {
            studentId: true,
            testScore: true,
            taskScore: true,
            competency: true,
          },
        });

        if (existingResults.length > 0) {
          console.log(`Found ${existingResults.length} existing results`);

          existingResults.forEach((result) => {
            studentResults[result.studentId] = {
              testScore: result.testScore,
              taskScore: result.taskScore,
              mark: (result.testScore + result.taskScore) / 2,
              competency: result.competency ? "competent" : "not_competent",
            };
          });
        }
      } catch (resultError) {
        console.error(`Error fetching results: ${resultError}`);
        // Continue with empty results
      }
    }

    // Map students with their results
    const mappedStudents = students.map((student) => ({
      id: student.id,
      name: student.profile?.firstName ?? "",
      surname: student.profile?.lastName ?? "",
      admissionNumber: student.admissionNumber ?? "",
      alumni: student.alumni ?? false,
      active: student.active ?? true,
      inactiveReason: student.inactiveReason ?? "",
      existingMark: studentResults[student.id]?.mark,
      existingTestScore: studentResults[student.id]?.testScore,
      existingTaskScore: studentResults[student.id]?.taskScore,
      existingCompetency: studentResults[student.id]?.competency,
    }));

    return mappedStudents;
  } catch (error) {
    console.error("Error fetching students:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown database error";
    throw new Error(`Failed to fetch students: ${errorMessage}`);
  }
}
