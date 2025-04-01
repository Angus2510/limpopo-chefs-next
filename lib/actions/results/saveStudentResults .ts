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
  intakeGroupId: string[]; // Changed to array
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
    const cookieStore = cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    let decoded: DecodedToken;
    try {
      decoded = jwtDecode(token);
    } catch (error) {
      console.error("Token decode error:", error);
      return { success: false, error: "Invalid authentication token" };
    }

    // Allow any staff member to save results
    if (!decoded.userType || !decoded.userType.includes("Staff")) {
      return { success: false, error: "Only staff members can save results" };
    }

    // Verify the outcome exists
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
    const batchSize = 5;
    for (let i = 0; i < results.length; i += batchSize) {
      const batch = results.slice(i, i + batchSize);

      for (const result of batch) {
        try {
          // Create the assignment result
          await prisma.assignmentresults.create({
            data: {
              v: 1,
              student: result.studentId,
              outcome: result.outcomeId,
              campus: result.campusId,
              intakeGroup: result.intakeGroupId[0], // Take first intake group for now
              percent: Math.round(result.mark),
              testScore: Math.round(result.testScore),
              taskScore: Math.round(result.taskScore),
              scores: Math.round((result.testScore + result.taskScore) / 2),
              status: result.competency,
              dateTaken: new Date(),
              answers: [],
              assignment: result.outcomeId,
              markedBy: decoded.id,
              moderatedscores: null,
              feedback: null,
            },
          });

          // Also create a result record
          await prisma.results.create({
            data: {
              v: 1,
              title: `${outcome.title} Result`,
              campus: result.campusId,
              intakeGroups: result.intakeGroupId[0],
              outcome: result.outcomeId,
              conductedOn: new Date(),
              details: "Individual Assessment Result",
              observer: decoded.id,
              participants: [result.studentId],
              resultType: "assessment",
              results: [
                {
                  id: result.studentId,
                  student: result.studentId,
                  score: result.mark,
                  testScore: result.testScore,
                  taskScore: result.taskScore,
                  average: (result.testScore + result.taskScore) / 2,
                  overallOutcome: result.competency,
                },
              ],
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

        // Small delay between saves to prevent timeouts
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    // Revalidate the results pages
    revalidatePath("/admin/results");
    revalidatePath("/admin/results/capture");

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
