import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    // First get a lightweight count
    const count = await prisma.assignmentresults.count({
      where: { intakeGroup: groupId },
    });

    console.log(`Found ${count} results for group ${groupId}`);

    // Then fetch the actual data with specific select fields
    const results = await prisma.assignmentresults.findMany({
      where: { intakeGroup: groupId },
      select: {
        id: true,
        assignment: true,
        student: true,
        status: true,
        dateTaken: true,
        testScore: true,
        taskScore: true,
        scores: true,
        percent: true,
        markedBy: true,
      },
    });

    // Batch fetch related data
    const uniqueAssignmentIds = [...new Set(results.map((r) => r.assignment))];
    const uniqueStudentIds = [...new Set(results.map((r) => r.student))];

    const [assignments, students] = await Promise.all([
      prisma.assignments.findMany({
        where: { id: { in: uniqueAssignmentIds } },
        select: {
          id: true,
          title: true,
          type: true,
          outcome: true,
        },
      }),
      prisma.students.findMany({
        where: { id: { in: uniqueStudentIds } },
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
      }),
    ]);

    // Create lookup maps
    const assignmentMap = new Map(assignments.map((a) => [a.id, a]));
    const studentMap = new Map(students.map((s) => [s.id, s]));

    // Combine data efficiently
    const enhancedResults = results.map((result) => ({
      ...result,
      assignmentData: assignmentMap.get(result.assignment) || null,
      studentData: studentMap.get(result.student) || null,
      dateTaken: result.dateTaken.toISOString(),
    }));

    console.log(`Successfully processed ${enhancedResults.length} results`);

    return NextResponse.json({
      results: enhancedResults,
      total: count,
    });
  } catch (error) {
    console.error("Error in assignment results:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch assignment results",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
