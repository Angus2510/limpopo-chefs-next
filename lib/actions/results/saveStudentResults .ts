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
    // Auth checks
    const cookieStore = cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    let decoded: DecodedToken;
    try {
      decoded = jwtDecode(token);
    } catch (error) {
      return { success: false, error: "Invalid authentication token" };
    }

    if (!decoded.userType || !decoded.userType.includes("Staff")) {
      return { success: false, error: "Only staff members can save results" };
    }

    // Get outcome info with title
    const outcome = await prisma.outcomes.findUnique({
      where: { id: results[0].outcomeId },
      select: {
        id: true,
        title: true,
        type: true,
        hidden: true,
        campus: true,
      },
    });

    if (!outcome) {
      return { success: false, error: "Outcome not found" };
    }

    console.log("📝 Saving results for outcome:", outcome.title);

    // Prepare batch operations matching exact schema
    const assignmentResults = results.map((result) => ({
      v: 1,
      student: result.studentId,
      outcome: result.outcomeId,
      campus: result.campusId,
      intakeGroup: result.intakeGroupId[0],
      percent: Math.round(result.mark),
      testScore: Math.round(result.testScore),
      taskScore: Math.round(result.taskScore),
      scores: Math.round((result.testScore + result.taskScore) / 2),
      status: result.competency,
      dateTaken: new Date(),
      answers: [], // Empty array as per schema
      assignment: result.outcomeId,
      markedBy: decoded.id,
      moderatedscores: null,
      feedback: null,
    }));

    const resultRecords = results.map((result) => ({
      v: 1,
      title: `${outcome.title} Result`,
      campus: result.campusId,
      intakeGroups: result.intakeGroupId[0],
      outcome: result.outcomeId,
      conductedOn: new Date(),
      details: `Individual Assessment Result for ${outcome.title}`,
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
          average: Number(
            ((result.testScore + result.taskScore) / 2).toFixed(2)
          ),
          overallOutcome: result.competency,
        },
      ],
    }));

    // Execute all operations in a transaction
    const [assignmentSaves, resultSaves] = await prisma.$transaction([
      prisma.assignmentresults.createMany({
        data: assignmentResults,
      }),
      prisma.results.createMany({
        data: resultRecords,
      }),
    ]);

    console.log(`✅ Saved ${assignmentSaves.count} assignment results`);
    console.log(`✅ Saved ${resultSaves.count} result records`);

    // Revalidate paths
    revalidatePath("/admin/results");
    revalidatePath("/admin/results/capture");

    return {
      success: true,
      message: `Successfully saved ${results.length} results for ${outcome.title}`,
      details: {
        outcomeTitle: outcome.title,
        savedCount: results.length,
        assignmentSaves: assignmentSaves.count,
        resultSaves: resultSaves.count,
      },
    };
  } catch (error) {
    console.error("❌ Save error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save results",
    };
  }
}
