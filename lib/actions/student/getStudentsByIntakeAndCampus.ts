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
  intakeGroupId: string,
  campusId: string,
  outcomeId?: string
): Promise<StudentWithResults[]> {
  if (!intakeGroupId || !campusId) {
    throw new Error("Intake group ID and campus ID are required");
  }

  try {
    console.log(
      `Fetching students for intake group ${intakeGroupId} and campus ${campusId}`
    );

    // Find students who belong to the specified intake group and campus
    const students = await prisma.students.findMany({
      where: {
        intakeGroup: {
          hasSome: [intakeGroupId],
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

    // If we need to get existing results for these students
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

        // Get results instead of assignment results
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

        // Flatten and process all results
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
        // Continue with empty results rather than failing the whole request
      }
    }

    // Map the database results to the expected interface
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
