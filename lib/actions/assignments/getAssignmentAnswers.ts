import prisma from "@/lib/db";

export async function getAssignmentAnswers(id: string) {
  console.log("🔎 getAssignmentAnswers called with ID:", id);

  try {
    // Find the assignment result directly
    const assignmentResult = await prisma.assignmentresults.findUnique({
      where: { id },
    });

    console.log("📋 Assignment result found:", !!assignmentResult);

    if (!assignmentResult) {
      console.error("❌ No assignment result found with ID:", id);
      return [];
    }

    // Get the student data
    const student = await db.students.findUnique({
      where: { id: assignmentResult.student },
      include: {
        profile: true,
      },
    });

    console.log("👤 Student found:", !!student);

    // Get the assignment
    const assignment = await db.assignments.findUnique({
      where: { id: assignmentResult.assignment },
      include: {
        questions: true,
      },
    });

    console.log("📝 Assignment found:", !!assignment);

    if (!assignment) {
      console.error(
        "❌ No assignment found with ID:",
        assignmentResult.assignment
      );
      return [];
    }

    // Format the response just like your working page does
    const transformedResult = {
      id: assignmentResult.id,
      dateTaken: assignmentResult.dateTaken,
      scores: assignmentResult.scores,
      student: {
        id: student?.id || "",
        firstName: student?.profile?.firstName || "Unknown",
        lastName: student?.profile?.lastName || "Student",
      },
      assignment: {
        id: assignment.id,
        title: assignment.title,
        type: assignment.type,
        duration: assignment.duration,
        password: assignment.password,
        availableFrom: assignment.availableFrom,
        intakeGroups: assignment.intakeGroups,
        outcome: assignment.outcome,
        questions: assignment.questions || [],
      },
      answers: assignmentResult.answers || [],
    };

    console.log(
      "✅ Transformed result built with",
      transformedResult.answers.length,
      "answers"
    );
    return transformedResult;
  } catch (error) {
    console.error("❌ Error in getAssignmentAnswers:", error);
    throw error;
  }
}
