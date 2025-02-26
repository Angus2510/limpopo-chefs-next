"use server";

import prisma from "@/lib/db";

export async function fetchIntakeGroupsWithPendingAssignments() {
  // Get all intake groups
  const intakeGroups = await prisma.intakegroups.findMany({
    select: {
      id: true,
      title: true,
      v: true,
      outcome: true,
      campus: true,
    },
  });

  // Get count of pending assignments for each group
  const results = await Promise.all(
    intakeGroups.map(async (group) => {
      // Count assignment results with SUBMITTED status for this group
      const pendingCount = await prisma.assignmentresults.count({
        where: {
          intakeGroup: group.id,
          status: "SUBMITTED",
          markedBy: null, // Not yet marked
        },
      });

      // Find course information (if available)
      // Note: I don't see a direct course relationship in schema, so using outcome as a substitute
      // You might need to adjust this based on your actual data structure
      let courseTitle = "N/A";
      if (group.outcome && group.outcome.length > 0) {
        const outcome = await prisma.outcomes.findUnique({
          where: { id: group.outcome[0] },
          select: { title: true },
        });
        if (outcome) courseTitle = outcome.title;
      }

      return {
        id: group.id,
        name: group.title, // Using title as name for display
        course: { title: courseTitle },
        pendingAssignmentsCount: pendingCount,
      };
    })
  );

  // Filter to only include groups with pending assignments
  return results.filter((group) => group.pendingAssignmentsCount > 0);
}
