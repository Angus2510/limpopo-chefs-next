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
    // Debug input
    console.log("Incoming results data:", JSON.stringify(results, null, 2));

    // Auth checks with async cookies
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("accessToken");

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

    // Get outcome info for logging
    const outcome = await prisma.outcomes.findUnique({
      where: { id: results[0].outcomeId },
      select: { id: true, title: true },
    });

    if (!outcome) {
      return { success: false, error: "Outcome not found" };
    }

    console.log("📝 Saving results for outcome:", outcome.title);

    // Create assignment result with correct model name
    const assignmentResult = await prisma.assignmentresults.create({
      data: {
        v: 1,
        assignment: results[0].outcomeId, // Using outcomeId as assignment reference
        campus: results[0].campusId,
        dateTaken: new Date(),
        intakeGroup: results[0].intakeGroupId[0],
        markedBy: decoded.id,
        outcome: results[0].outcomeId,
        status: "completed",
        student: results[0].studentId,
        testScore: results[0].testScore,
        taskScore: results[0].taskScore,
        scores: Math.round((results[0].testScore + results[0].taskScore) / 2),
        percent: Math.round((results[0].testScore + results[0].taskScore) / 2),
      },
    });

    console.log(
      "Created assignment result:",
      JSON.stringify(assignmentResult, null, 2)
    );

    // Then prepare individual results records
    const resultRecords = results.map((result) => ({
      studentId: result.studentId,
      outcomeId: result.outcomeId,
      testScore: result.testScore,
      taskScore: result.taskScore,
      mark: Number(((result.testScore + result.taskScore) / 2).toFixed(2)),
      competency: result.competency === "competent",
      average: Number(((result.testScore + result.taskScore) / 2).toFixed(2)),
      source: "manual" as const,
      updatedBy: decoded.id,
      dateCreated: new Date(),
      updatedAt: new Date(),
    }));

    // Use transaction for all upserts
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
            mark: record.mark,
            competency: record.competency,
            average: record.average,
            source: "manual",
            updatedBy: record.updatedBy,
            updatedAt: record.updatedAt,
          },
          create: record,
        })
      )
    );

    // Revalidate paths
    revalidatePath("/admin/results", "page");
    revalidatePath("/admin/results/capture", "page");
    results.forEach((result) => {
      revalidatePath(`/admin/student/${result.studentId}`, "page");
    });
    revalidatePath(`/admin/outcomes/${results[0].outcomeId}`, "page");

    return {
      success: true,
      message: `Successfully saved ${savedResults.length} results for ${outcome.title}`,
      details: {
        outcomeTitle: outcome.title,
        savedCount: savedResults.length,
        assignmentResultId: assignmentResult.id,
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
