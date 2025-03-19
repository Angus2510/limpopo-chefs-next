"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface StudentResultInput {
  studentId: string;
  outcomeId: string;
  mark: number;
  competency: "competent" | "not_competent";
}

export async function saveStudentResults(results: StudentResultInput[]) {
  if (!results || results.length === 0) {
    throw new Error("No results provided");
  }

  try {
    // Create a unique ID for this batch of results
    const timestamp = new Date();

    // Process each result individually using upsert
    const operations = results.map(async (result) => {
      // Get student details to access campus and intake group
      const student = await prisma.students.findUnique({
        where: { id: result.studentId },
        select: {
          campus: true,
          intakeGroup: true,
        },
      });

      if (!student) {
        throw new Error(`Student with ID ${result.studentId} not found`);
      }

      // Check if a result already exists for this student and outcome
      const existingResult = await prisma.results.findFirst({
        where: {
          outcome: result.outcomeId,
          results: {
            some: {
              student: result.studentId,
            },
          },
        },
      });

      if (existingResult) {
        // Update the existing result
        return prisma.results.update({
          where: { id: existingResult.id },
          data: {
            conductedOn: timestamp,
            results: {
              updateMany: {
                where: { student: result.studentId },
                data: {
                  score: result.mark,
                  overallOutcome: result.competency,
                },
              },
            },
          },
        });
      } else {
        // Create a new result entry
        return prisma.results.create({
          data: {
            campus: student.campus[0] || "",
            conductedOn: timestamp,
            details: "Assessment result",
            intakeGroups: student.intakeGroup[0] || "",
            observer: "System",
            outcome: result.outcomeId,
            participants: [result.studentId],
            resultType: "assessment",
            title: `Assessment Result - ${timestamp.toLocaleDateString()}`,
            results: {
              create: [
                {
                  student: result.studentId,
                  score: result.mark,
                  overallOutcome: result.competency,
                  average: result.mark,
                  taskScore: result.mark,
                  testScore: result.mark,
                },
              ],
            },
          },
        });
      }
    });

    await Promise.all(operations);

    // Revalidate related paths
    revalidatePath("/admin/results");
    revalidatePath("/admin/results/capture");

    return {
      success: true,
      count: results.length,
      message: `Successfully saved ${results.length} student results`,
    };
  } catch (error) {
    console.error("Error saving results:", error);
    throw new Error(
      `Failed to save student results: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
