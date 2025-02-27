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

    return NextResponse.json({
      total: totalCount,
      pending: countsByStatus["pending"] || 0,
      marked: countsByStatus["marked"] || 0,
      submitted: countsByStatus["submitted"] || 0,
      // Add any other statuses you have
      byStatus: countsByStatus,
    });
  } catch (error) {
    console.error("Error counting assignments:", error);
    return NextResponse.json(
      { error: "Failed to count assignments" },
      { status: 500 }
    );
  }
}
