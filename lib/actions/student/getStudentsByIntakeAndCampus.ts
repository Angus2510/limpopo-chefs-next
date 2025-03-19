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

        // Get assignment results
        const assignmentResults = await prisma.assignmentresults.findMany({
          where: {
            outcome: outcomeId,
            student: {
              in: students.map((s) => s.id),
            },
          },
          select: {
            student: true,
            scores: true,
            percent: true,
            testScore: true,
            taskScore: true,
            status: true,
          },
        });

        console.log(
          `Found ${assignmentResults.length} existing assignment results`
        );

        // Create a map of studentId -> results
        assignmentResults.forEach((result) => {
          if (result.student) {
            studentResults[result.student] = {
              mark: result.percent || result.scores || undefined,
              testScore: result.testScore || undefined,
              taskScore: result.taskScore || undefined,
              competency:
                result.status === "competent" ||
                result.status === "not_competent"
                  ? result.status
                  : undefined,
            };
          }
        });
      } catch (resultError) {
        // Handle error fetching results separately
        console.log(
          `Error fetching results for outcome ${outcomeId}: ${
            resultError instanceof Error ? resultError.message : "Unknown error"
          }`
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
    // Safely log error
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.log(`Error fetching students: ${errorMessage}`);

    throw new Error(`Failed to fetch students: ${errorMessage}`);
  }
}
