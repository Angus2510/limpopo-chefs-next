import prisma from "@/lib/db";

export async function getAssignmentAnswers(id: string) {
  console.log("🔎 getAssignmentAnswers called with ID:", id);

  try {
    // First try to find as assignment result
    const assignmentResult = await prisma.assignmentresults.findUnique({
      where: { id },
    });

    console.log("📋 Assignment result found:", !!assignmentResult);

    // If it's an assignment result, process it for marking
    if (assignmentResult) {
      // Get the student data
      const student = await prisma.students.findUnique({
        where: { id: assignmentResult.student },
        include: {
          profile: true,
        },
      });

      console.log("👤 Student found:", !!student);

      // Try to get the assignment
      const assignment = await prisma.assignments
        .findUnique({
          where: { id: assignmentResult.assignment },
        })
        .catch(() => null);

      // If assignment not found, we'll use the questions from the result
      let questions = [];

      if (assignment) {
        console.log("📝 Assignment found in database");
        questions = await prisma.questions.findMany({
          where: { id: { in: assignment.questions } },
        });
      } else {
        console.log("⚠️ Assignment not found, using questions from result");
        // Extract question IDs from answers and try to get them
        const answerObjects = assignmentResult.answers
          .map((ans) => {
            try {
              return JSON.parse(ans);
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean);

        const questionIds = [...new Set(answerObjects.map((a) => a.question))];

        questions = await prisma.questions.findMany({
          where: { id: { in: questionIds } },
        });
      }

      // Build a result object that includes necessary data even if assignment is missing
      const transformedResult = {
        id: assignmentResult.id,
        dateTaken: assignmentResult.dateTaken,
        scores: assignmentResult.scores,
        student: {
          id: student?.id || "",
          firstName: student?.profile?.firstName || "Unknown",
          lastName: student?.profile?.lastName || "Student",
        },
        assignment: assignment
          ? {
              id: assignment.id,
              title: assignment.title,
              type: assignment.type,
              duration: assignment.duration,
              password: assignment.password,
              availableFrom: assignment.availableFrom,
              intakeGroups: assignment.intakeGroups,
              outcome: assignment.outcome,
              questions: questions || [],
            }
          : {
              id: assignmentResult.assignment,
              title: "Assignment (Details Not Available)",
              type: "unknown",
              duration: 0,
              password: "",
              availableFrom: new Date(),
              intakeGroups: [],
              outcome: [],
              questions: questions || [],
            },
        answers: assignmentResult.answers || [],
      };

      return transformedResult;
    }
    // Otherwise, handle it as viewing all answers for an assignment
    else {
      // This is for the assignment view page - get all answers for this assignment
      console.log("📚 Getting all student answers for assignment:", id);

      // First get all assignment results for this assignment
      const assignmentResults = await prisma.assignmentresults.findMany({
        where: {
          assignment: id,
        },
        include: {
          student: {
            include: {
              profile: true,
            },
          },
        },
      });

      console.log(`📊 Found ${assignmentResults.length} assignment results`);

      // Process the answers from each result
      const processedAnswers = [];

      for (const result of assignmentResults) {
        // Get student name from profile
        const studentName = `${result.student?.profile?.firstName || ""} ${
          result.student?.profile?.lastName || "Unknown"
        }`;

        // Parse each answer in the result
        if (Array.isArray(result.answers)) {
          for (const answerStr of result.answers) {
            try {
              const parsed = JSON.parse(answerStr);

              // Get the score for this question if available
              let score = null;
              if (result.scores) {
                try {
                  const scoresObj = JSON.parse(result.scores);
                  score = scoresObj[parsed.question] || null;
                } catch (e) {
                  console.error("❌ Error parsing scores:", e);
                }
              }

              // Build a processed answer
              processedAnswers.push({
                id: `${result.id}_${parsed.question}`, // Create a synthetic ID
                question: parsed.question,
                answer: parsed.answer,
                answeredAt: result.dateTaken,
                scores: score,
                moderatedscores: null,
                student: result.student.id,
                studentName,
              });
            } catch (e) {
              console.error("❌ Failed to parse answer:", e);
            }
          }
        }
      }

      console.log(`✅ Processed ${processedAnswers.length} individual answers`);
      return processedAnswers;
    }
  } catch (error) {
    console.error("❌ Error in getAssignmentAnswers:", error);
    return null;
  }
}
