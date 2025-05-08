import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    // Add pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const skip = (page - 1) * pageSize;

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required", results: [] },
        { status: 400 }
      );
    }

    // Debug log
    console.log(
      `Fetching results for group: ${groupId}, page: ${page}, pageSize: ${pageSize}`
    );

    // Get total count for pagination info
    const totalCount = await prisma.assignmentresults.count({
      where: {
        intakeGroup: groupId,
      },
    });

    // Fetch paginated results
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
      skip,
      take: pageSize,
    });

    console.log(
      `Found ${results.length} results (page ${page} of ${Math.ceil(
        totalCount / pageSize
      )})`
    );

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

          // Get outcomes - but limit the query for performance
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

    return NextResponse.json({
      results: validResults,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching assignment results:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment results", results: [] },
      { status: 500 }
    );
  }
}
