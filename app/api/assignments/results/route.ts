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

    // Debug log
    console.log("Fetching results for group:", groupId);

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

    // Debug log
    console.log("Found results:", results.length);

    const enhancedResults = await Promise.all(
      results.map(async (result) => {
        try {
          // Get assignment with outcomes
          const assignment = await prisma.assignments.findUnique({
            where: {
              id: result.assignment,
            },
            select: {
              id: true,
              title: true,
              type: true,
              outcome: true,
            },
          });

          // Get student details
          const student = await prisma.students.findUnique({
            where: {
              id: result.student,
            },
            select: {
              admissionNumber: true,
              profile: true,
            },
          });

          // Get outcomes
          let outcomes = [];
          if (assignment?.outcome?.length) {
            outcomes = await prisma.outcomes.findMany({
              where: {
                id: {
                  in: assignment.outcome,
                },
              },
              select: {
                id: true,
                title: true,
                type: true,
                hidden: true,
                campus: true,
              },
            });
          }

          // Debug log
          console.log("Processing assignment:", assignment?.title);
          console.log("Found outcomes:", outcomes.length);

          return {
            id: result.id,
            assignment: result.assignment,
            student: result.student,
            status: result.status,
            dateTaken: result.dateTaken.toISOString(),
            scores: result.scores || null,
            percent: result.percent || null,
            testScore: result.testScore || null,
            taskScore: result.taskScore || null,
            markedBy: result.markedBy || null,
            assignmentData: assignment
              ? {
                  id: assignment.id,
                  title: assignment.title,
                  type: assignment.type,
                  outcome: assignment.outcome,
                  outcomes: outcomes,
                }
              : null,
            studentData: student
              ? {
                  admissionNumber: student.admissionNumber,
                  profile: student.profile,
                }
              : null,
          };
        } catch (error) {
          console.error("Error processing result:", error);
          return null;
        }
      })
    );

    // Filter out any null results from errors
    const validResults = enhancedResults.filter(Boolean);

    // Debug log
    console.log("Sending enhanced results:", validResults.length);

    return NextResponse.json({
      results: validResults,
    });
  } catch (error) {
    console.error("Error fetching assignment results:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment results", results: [] },
      { status: 500 }
    );
  }
}
