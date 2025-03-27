"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string;
  userType: string;
}

interface StudentResultInput {
  studentId: string;
  outcomeId: string;
  campusId: string;
  intakeGroupId: string;
  mark: number;
  testScore: number;
  taskScore: number;
  competency: "competent" | "not_competent";
}

export async function saveStudentResults(results: StudentResultInput[]) {
  if (!results?.length) {
    return { success: false, error: "No results provided" };
  }

  try {
    // Get the current user from the token
    const token = (await cookies()).get("accessToken")?.value;
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const decoded = jwtDecode<DecodedToken>(token);
    if (decoded.userType !== "staff") {
      return { success: false, error: "Only staff members can save results" };
    }

    const outcome = await prisma.outcomes.findUnique({
      where: { id: results[0].outcomeId },
      select: { id: true, title: true },
    });

    if (!outcome) {
      return { success: false, error: "Outcome not found" };
    }

    console.log("📝 Saving results for outcome:", outcome.title);

    let savedCount = 0;
    const errors = [];

    // Process in smaller batches
    const batchSize = 3;
    for (let i = 0; i < results.length; i += batchSize) {
      const batch = results.slice(i, i + batchSize);

      for (const result of batch) {
        try {
          await prisma.assignmentresults.create({
            data: {
              v: 1,
              student: result.studentId,
              outcome: result.outcomeId,
              campus: result.campusId,
              intakeGroup: result.intakeGroupId,
              percent: Math.round(result.mark),
              testScore: Math.round(result.testScore),
              taskScore: Math.round(result.taskScore),
              scores: Math.round((result.testScore + result.taskScore) / 2),
              status: result.competency,
              dateTaken: new Date(),
              answers: [],
              assignment: result.outcomeId,
              markedBy: decoded.id, // Include staff ID who marked
              moderatedscores: null,
              feedback: null,
            },
          });
          savedCount++;
          console.log(`✅ Saved result ${savedCount} of ${results.length}`);
        } catch (err) {
          console.error(
            `❌ Error saving result for student ${result.studentId}:`,
            err
          );
          errors.push({
            studentId: result.studentId,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }

        // Add delay between saves to prevent timeouts
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    // Revalidate the results page
    revalidatePath("/admin/results");

    if (savedCount === 0) {
      return {
        success: false,
        error: "Failed to save any results",
        details: errors,
      };
    }

    return {
      success: true,
      message: `Successfully saved ${savedCount} of ${results.length} results`,
      details: errors.length ? errors : undefined,
    };
  } catch (error) {
    console.error("❌ Save error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save results",
    };
  }
}
