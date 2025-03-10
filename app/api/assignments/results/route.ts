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
      },
      orderBy: {
        dateTaken: "desc",
      },
    });

    if (!results || results.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const enhancedResults = await Promise.all(
      results.map(async (result) => {
        try {
          const [assignment, student] = await Promise.all([
            prisma.assignments.findUnique({
              where: { id: result.assignment },
              select: {
                title: true,
                type: true,
                outcome: true,
              },
            }),
            prisma.students.findUnique({
              where: { id: result.student },
              select: {
                admissionNumber: true,
                profile: true,
              },
            }),
          ]);

          // Ensure we convert dates to ISO strings
          const safeResult = {
            ...result,
            dateTaken: result.dateTaken.toISOString(),
            scores: result.scores || null,
            percent: result.percent || null,
            assignmentData: assignment || {
              title: "Unknown Assignment",
              type: "Unknown",
              outcome: [],
            },
            studentData: student || {
              admissionNumber: "Unknown",
              profile: {
                firstName: "Unknown",
                lastName: "Student",
              },
            },
          };

          return safeResult;
        } catch (error) {
          console.error("Error processing result:", error);
          // Return a safe fallback object
          return {
            ...result,
            dateTaken: result.dateTaken.toISOString(),
            scores: null,
            percent: null,
            assignmentData: {
              title: "Error Loading Assignment",
              type: "Unknown",
              outcome: [],
            },
            studentData: {
              admissionNumber: "Error",
              profile: {
                firstName: "Error",
                lastName: "Loading",
              },
            },
          };
        }
      })
    );

    // Ensure we never return null
    return NextResponse.json({
      results: enhancedResults || [],
    });
  } catch (error) {
    console.error("Error fetching assignment results:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch assignment results",
        results: [],
      },
      { status: 500 }
    );
  }
}
