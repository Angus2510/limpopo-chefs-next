import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");

  if (!groupId) {
    return NextResponse.json(
      { error: "Group ID is required" },
      { status: 400 }
    );
  }

  try {
    // Get assignment results for this group
    const results = await prisma.assignmentresults.findMany({
      where: {
        intakeGroup: groupId,
      },
      orderBy: {
        dateTaken: "desc",
      },
    });

    // Fetch related assignment data
    const enhancedResults = await Promise.all(
      results.map(async (result) => {
        // Get assignment details
        const assignment = await prisma.assignments.findUnique({
          where: { id: result.assignment },
          select: {
            title: true,
            type: true,
            outcome: true,
          },
        });

        // Get student details
        const student = await prisma.students.findUnique({
          where: { id: result.student },
          select: {
            admissionNumber: true,
            profile: true,
          },
        });

        return {
          ...result,
          assignmentData: assignment,
          studentData: student,
        };
      })
    );

    return NextResponse.json(enhancedResults);
  } catch (error) {
    console.error("Error fetching assignment results:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment results" },
      { status: 500 }
    );
  }
}
