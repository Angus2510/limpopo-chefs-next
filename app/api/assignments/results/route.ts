import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const outcomeId = searchParams.get("outcomeId");
    const campusId = searchParams.get("campusId");

    if (!groupId || !outcomeId || !campusId) {
      return NextResponse.json(
        { error: "Missing required parameters", results: [] },
        { status: 400 }
      );
    }

    console.log("Searching with params:", { groupId, outcomeId, campusId });

    // Get assignment results with related data
    const results = await prisma.assignmentresults.findMany({
      where: {
        AND: [
          { intakeGroup: groupId },
          { outcome: outcomeId },
          { campus: campusId },
        ],
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

    console.log(`Found ${results.length} results`);

    if (results.length === 0) {
      return NextResponse.json({
        results: [],
        debug: {
          message: "No results found",
          query: { groupId, outcomeId, campusId },
        },
      });
    }

    // Get unique IDs for related data
    const assignmentIds = [...new Set(results.map((r) => r.assignment))];
    const studentIds = [...new Set(results.map((r) => r.student))];

    // Fetch related data in parallel
    const [assignments, students] = await Promise.all([
      // Get assignments with title and type
      prisma.assignments.findMany({
        where: {
          id: { in: assignmentIds },
        },
        select: {
          id: true,
          title: true,
          type: true,
          outcome: true,
          campus: true,
          intakeGroups: true,
        },
      }),
      // Get students with profile info
      prisma.students.findMany({
        where: {
          id: { in: studentIds },
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
      }),
    ]);

    // Create lookup maps for efficient joining
    const assignmentMap = new Map(assignments.map((a) => [a.id, a]));
    const studentMap = new Map(students.map((s) => [s.id, s]));

    // Combine all data into final format
    const enhancedResults = results.map((result) => ({
      id: result.id,
      assignment: result.assignment,
      assignmentData: assignmentMap.get(result.assignment) || null,
      studentData: studentMap.get(result.student) || null,
      status: result.status,
      dateTaken: result.dateTaken.toISOString(),
      scores: result.scores,
      percent: result.percent,
      markedBy: result.markedBy,
      testScore: result.testScore,
      taskScore: result.taskScore,
    }));

    // Return enhanced results with debug info
    return NextResponse.json({
      results: enhancedResults,
      debug: {
        resultsFound: results.length,
        assignmentsFound: assignments.length,
        studentsFound: students.length,
        query: { groupId, outcomeId, campusId },
      },
    });
  } catch (error) {
    console.error("Error fetching assignment results:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch assignment results",
        errorDetails: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
