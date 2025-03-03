"use server";
import prisma from "@/lib/db";

export async function fetchStudentResults(studentId: string) {
  try {
    if (!studentId) return [];

    console.log("Fetching results for student:", studentId);

    // First fetch the assignment results
    const results = await prisma.assignmentresults.findMany({
      where: { student: studentId },
      select: {
        id: true,
        assignment: true,
        dateTaken: true,
        scores: true,
        moderatedscores: true,
        percent: true,
        status: true,
      },
    });

    console.log("Raw results found:", results.length);

    // Log the raw results to see exactly what we're working with
    console.log(
      "First 3 raw results:",
      JSON.stringify(results.slice(0, 3), null, 2)
    );

    // Get all unique assignment IDs
    const assignmentIds = [
      ...new Set(results.map((result) => result.assignment)),
    ];
    console.log("Unique assignment IDs:", assignmentIds);

    // Fetch all related assignments in a single query
    const assignments = await prisma.assignments.findMany({
      where: {
        id: { in: assignmentIds },
      },
      select: {
        id: true,
        title: true,
      },
    });

    console.log("Assignments fetched:", assignments.length);
    console.log(
      "Assignment titles:",
      assignments.map((a) => ({ id: a.id, title: a.title }))
    );

    // Create a lookup map for quick access to assignment titles
    const assignmentMap = new Map();
    assignments.forEach((assignment) => {
      assignmentMap.set(assignment.id, assignment.title);
      console.log(`Added to map: ${assignment.id} → ${assignment.title}`);
    });

    // Calculate percent if it doesn't exist in database
    const resultsWithTitles = results.map((result) => {
      const assignmentId = result.assignment;
      const title = assignmentMap.get(assignmentId);

      console.log(`Processing result for assignment ${assignmentId}:`);
      console.log(`- Found title: ${title || "NOT FOUND"}`);
      console.log(`- Original percent: ${result.percent}`);
      console.log(`- Original scores: ${result.scores}`);

      // If percent is null but scores exists, try to calculate it
      let percentValue = result.percent;
      if (percentValue === null || percentValue === undefined) {
        if (typeof result.scores === "number") {
          percentValue = result.scores;
          console.log(`- Calculated percent from scores: ${percentValue}`);
        } else if (
          result.moderatedscores &&
          !isNaN(Number(result.moderatedscores))
        ) {
          percentValue = Number(result.moderatedscores);
          console.log(
            `- Calculated percent from moderated scores: ${percentValue}`
          );
        } else {
          percentValue = 0;
          console.log(
            `- No valid scores found, using default: ${percentValue}`
          );
        }
      }

      // Ensure all data is serialization-safe
      const processed = {
        id: result.id,
        assignment: result.assignment,
        assignmentTitle: title || "Unknown Assignment",
        dateTaken: result.dateTaken
          ? new Date(result.dateTaken).toISOString()
          : null,
        scores: typeof result.scores === "number" ? result.scores : null,
        moderatedscores: result.moderatedscores,
        percent: percentValue,
        status: result.status || "Pending",
      };

      console.log(
        `- Final processed result:`,
        JSON.stringify({
          id: processed.id,
          assignmentTitle: processed.assignmentTitle,
          percent: processed.percent,
        })
      );

      return processed;
    });

    console.log("Final results count:", resultsWithTitles.length);
    if (resultsWithTitles.length > 0) {
      console.log(
        "Sample result being returned:",
        JSON.stringify(resultsWithTitles[0], null, 2)
      );
    }

    return resultsWithTitles; // Make sure we're explicitly returning the processed results
  } catch (error) {
    console.error("Error fetching student results:", error);
    return [];
  }
}
