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
  intakeGroupId: string[];
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
    // Properly handle async cookies
    const cookieStore = cookies();
    const tokenCookie = await cookieStore.get("accessToken");

    if (!tokenCookie?.value) {
      return { success: false, error: "Not authenticated" };
    }

    let decoded: DecodedToken;
    try {
      decoded = jwtDecode(tokenCookie.value);
    } catch (error) {
      console.error("Token decode error:", error);
      return { success: false, error: "Invalid authentication token" };
    }

    if (!decoded.userType || !decoded.userType.includes("Staff")) {
      return { success: false, error: "Only staff members can save results" };
    }

    // Get outcome info
    const outcome = await prisma.outcomes.findUnique({
      where: { id: results[0].outcomeId },
      select: { id: true, title: true },
    });

    if (!outcome) {
      return { success: false, error: "Outcome not found" };
    }

    console.log("📝 Saving results for outcome:", outcome.title);

    // Create results based on new schema
    const resultRecords = results.map((result) => ({
      studentId: result.studentId,
      outcomeId: result.outcomeId,
      testScore: result.testScore,
      taskScore: result.taskScore,
      competency: result.competency === "competent",
      average: Number(((result.testScore + result.taskScore) / 2).toFixed(2)),
      source: "manual" as const,
      updatedBy: decoded.id,
      dateCreated: new Date(),
      updatedAt: new Date(),
    }));

    // Execute operations in a transaction using the compound unique constraint
    const savedResults = await prisma.$transaction(
      resultRecords.map((record) =>
        prisma.results.upsert({
          where: {
            studentId_outcomeId: {
              studentId: record.studentId,
              outcomeId: record.outcomeId,
            },
          },
          update: {
            testScore: record.testScore,
            taskScore: record.taskScore,
            competency: record.competency,
            average: record.average,
            updatedBy: record.updatedBy,
            updatedAt: record.updatedAt,
          },
          create: {
            studentId: record.studentId,
            outcomeId: record.outcomeId,
            testScore: record.testScore,
            taskScore: record.taskScore,
            competency: record.competency,
            average: record.average,
            source: record.source,
            updatedBy: record.updatedBy,
            dateCreated: record.dateCreated,
            updatedAt: record.updatedAt,
          },
        })
      )
    );

    console.log(`✅ Saved ${savedResults.length} results`);

    // Revalidate paths
    revalidatePath("/admin/results");
    revalidatePath("/admin/results/capture");

    return {
      success: true,
      message: `Successfully saved ${results.length} results for ${outcome.title}`,
      details: {
        outcomeTitle: outcome.title,
        savedCount: savedResults.length,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? `${error.message}\n${error.stack}`
        : "Unknown error";
    console.error("❌ Save error:", errorMessage);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save results",
      details: error instanceof Error ? error.stack : undefined,
    };
  }
}
