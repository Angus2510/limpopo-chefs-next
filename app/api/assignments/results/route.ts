import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required", results: [] },
        { status: 400 }
      );
    }

    // Get all results first
    const results = await prisma.assignmentresults.findMany({
      where: {
        intakeGroup: groupId,
      },
      select: {
        id: true,
        assignment: true,
        student: true,
        status: true,
        dateTaken: true,
        scores: true,
        percent: true,
        markedBy: true,
        testScore: true,
        taskScore: true,
      },
      orderBy: {
        dateTaken: "desc",
      },
    });

    // Get unique IDs
    const assignmentIds = [...new Set(results.map((r) => r.assignment))];
    const studentIds = [...new Set(results.map((r) => r.student))];

    // Batch fetch related data
    const [assignments, students] = await Promise.all([
      prisma.assignments.findMany({
        where: { id: { in: assignmentIds } },
        select: {
          id: true,
          title: true,
          type: true,
          outcome: true,
        },
      }),
      prisma.students.findMany({
        where: { id: { in: studentIds } },
        select: {
          id: true,
          admissionNumber: true,
          profile: true,
        },
      }),
    ]);

    // Create lookup maps for better performance
    const assignmentMap = new Map(assignments.map((a) => [a.id, a]));
    const studentMap = new Map(students.map((s) => [s.id, s]));

    // Enhance results with related data
    const enhancedResults = results.map((result) => ({
      ...result,
      assignmentData: assignmentMap.get(result.assignment) || null,
      studentData: studentMap.get(result.student) || null,
      dateTaken: result.dateTaken.toISOString(),
    }));

    return NextResponse.json({
      results: enhancedResults,
    });
  } catch (error) {
    console.error("Error fetching assignment results:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment results", results: [] },
      { status: 500 }
    );
  }
}
