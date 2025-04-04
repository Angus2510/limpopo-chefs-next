"use server";

import prisma from "@/lib/db";

export interface StudentWithResults {
  id: string;
  name: string;
  surname: string;
  admissionNumber: string;
  existingMark?: number;
  existingTestScore?: number;
  existingTaskScore?: number;
  existingCompetency?: "competent" | "not_competent";
}

export async function getStudentsByIntakeAndCampus(
  intakeGroupId: string[], // Changed to string[]
  campusId: string,
  outcomeId?: string
): Promise<StudentWithResults[]> {
  if (!intakeGroupId?.length || !campusId) {
    throw new Error("At least one intake group ID and campus ID are required");
  }

  try {
    console.log(
      `Fetching students for intake groups ${intakeGroupId.join(
        ", "
      )} and campus ${campusId}`
    );

    const students = await prisma.students.findMany({
      where: {
        intakeGroup: {
          hasSome: intakeGroupId, // Pass the array directly
        },
        campus: {
          hasSome: [campusId],
        },
        active: true,
      },
      select: {
        id: true,
        admissionNumber: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        {
          profile: {
            lastName: "asc",
          },
        },
        {
          profile: {
            firstName: "asc",
          },
        },
      ],
    });

    console.log(`Found ${students.length} students`);

    let studentResults: Record<
      string,
      {
        mark?: number;
        testScore?: number;
        taskScore?: number;
        competency?: string;
      }
    > = {};

    if (outcomeId && students.length > 0) {
      try {
        console.log(`Fetching existing results for outcome ${outcomeId}`);

        const existingResults = await prisma.results.findMany({
          where: {
            outcome: outcomeId,
            participants: {
              hasSome: students.map((s) => s.id),
            },
          },
          select: {
            results: true,
          },
        });

        console.log(`Found ${existingResults.length} existing results`);

        existingResults.forEach((result) => {
          if (result.results) {
            result.results.forEach((studentResult) => {
              if (studentResult.student) {
                studentResults[studentResult.student] = {
                  mark: studentResult.score,
                  testScore: studentResult.testScore,
                  taskScore: studentResult.taskScore,
                  competency: studentResult.overallOutcome,
                };
              }
            });
          }
        });
      } catch (resultError) {
        console.error(
          `Error fetching results for outcome ${outcomeId}:`,
          resultError
        );
      }
    }

    return students.map((student) => ({
      id: student.id,
      name: student.profile?.firstName || "",
      surname: student.profile?.lastName || "",
      admissionNumber: student.admissionNumber || "",
      existingMark: studentResults[student.id]?.mark,
      existingTestScore: studentResults[student.id]?.testScore,
      existingTaskScore: studentResults[student.id]?.taskScore,
      existingCompetency: studentResults[student.id]?.competency as
        | "competent"
        | "not_competent"
        | undefined,
    }));
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`Error fetching students: ${errorMessage}`);
    throw new Error(`Failed to fetch students: ${errorMessage}`);
  }
}
