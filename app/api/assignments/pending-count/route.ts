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
    // Get total count of all assignments for this group
    const totalCount = await prisma.assignmentresults.count({
      where: {
        intakeGroup: groupId,
      },
    });

    // Get grouped counts by status
    const statusCounts = await prisma.assignmentresults.groupBy({
      by: ["status"],
      where: {
        intakeGroup: groupId,
      },
      _count: {
        status: true,
      },
    });

    // Convert to a more usable format
    const countsByStatus = statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    // Get the most recent assignment for the group
    let newestDate = null;

    if (totalCount > 0) {
      const newestAssignment = await prisma.assignmentresults.findFirst({
        where: {
          intakeGroup: groupId,
        },
        orderBy: {
          dateTaken: "desc", // Use dateTaken since it exists in your schema
        },
        select: {
          dateTaken: true, // Use dateTaken since it exists in your schema
        },
      });

      newestDate = newestAssignment?.dateTaken;
    }

    // Get intake group info
    const intakeGroup = await prisma.intakegroups.findUnique({
      where: { id: groupId },
      select: { title: true },
    });

    // Create a safe response object with correct data types
    const response = {
      total: totalCount,
      pending: countsByStatus["pending"] || 0,
      marked: countsByStatus["marked"] || 0,
      submitted: countsByStatus["submitted"] || 0,
      byStatus: countsByStatus,
      newestDate: newestDate,
      groupTitle: intakeGroup?.title || "Unknown Group",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error counting assignments:", error);

    // Safe error response
    return NextResponse.json(
      {
        error: "Failed to count assignments",
        total: 0,
        pending: 0,
        marked: 0,
        submitted: 0,
        byStatus: {},
      },
      { status: 200 }
    ); // Return 200 to avoid client errors
  }
}
