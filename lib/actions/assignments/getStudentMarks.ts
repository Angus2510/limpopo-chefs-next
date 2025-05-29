"use server";

import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

interface AssignmentResult {
  id: string;
  dateTaken: Date;
  assignmentData: {
    id?: string;
    title: string;
    type: string;
    outcome?: string[];
  };
  testScore: number | null;
  taskScore: number | null;
  scores: number | null;
  percent: number | null;
  status: string;
  feedback: any;
}

interface StudentInfo {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
}

interface GetStudentMarksResponse {
  results: AssignmentResult[];
  student: StudentInfo;
}

interface SearchParams {
  studentNumber?: string;
  firstName?: string;
  lastName?: string;
}

// Fixed helper function to properly convert MongoDB ObjectId to string
function safeToString(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    // If it's an Extended JSON format with $oid
    if (value.$oid) {
      return value.$oid; // Return the actual ID string
    }
    // If it has a toString method that's a function
    else if (typeof value.toString === "function") {
      return value.toString();
    }
  }

  // Fallback to String constructor
  return String(value);
}

export async function getStudentMarks(
  params: SearchParams = {}
): Promise<GetStudentMarksResponse | { error: string }> {
  try {
    if (!params || typeof params !== "object") {
      console.error("Invalid params object received:", params);
      return { error: "Invalid search parameters provided." };
    }

    const searchParams = {
      studentNumber: params.studentNumber
        ? String(params.studentNumber).trim()
        : "",
      firstName: params.firstName ? String(params.firstName).trim() : "",
      lastName: params.lastName ? String(params.lastName).trim() : "",
    };

    console.log(
      "Normalized search params in getStudentMarks:",
      JSON.stringify(searchParams)
    );

    if (
      !searchParams.studentNumber &&
      !searchParams.firstName &&
      !searchParams.lastName
    ) {
      return {
        error:
          "No search criteria provided. Please enter a student number or name.",
      };
    }

    let student;
    let rawStudentId; // Store raw MongoDB _id for name search path

    if (searchParams.studentNumber) {
      // Use standard Prisma query for student number search
      console.log(
        `Searching by student number: "${searchParams.studentNumber}"`
      );

      student = await prisma.students.findFirst({
        where: { admissionNumber: searchParams.studentNumber },
        select: {
          id: true,
          profile: true,
          admissionNumber: true,
        },
      });
    } else {
      // For name search, use raw MongoDB query to handle nested fields
      if (!searchParams.firstName && !searchParams.lastName) {
        return {
          error: "First name or last name must be provided for name search.",
        };
      }

      console.log(
        `Searching by name: First Name - "${searchParams.firstName}", Last Name - "${searchParams.lastName}"`
      );

      // Build MongoDB filter conditions
      const filterConditions: any[] = [];

      if (searchParams.firstName) {
        filterConditions.push({
          // MongoDB regex for case-insensitive contains
          "profile.firstName": {
            $regex: searchParams.firstName,
            $options: "i",
          },
        });
      }

      if (searchParams.lastName) {
        filterConditions.push({
          "profile.lastName": {
            $regex: searchParams.lastName,
            $options: "i",
          },
        });
      }

      // MongoDB $and operator to combine conditions
      const filter =
        filterConditions.length > 1
          ? { $and: filterConditions }
          : filterConditions[0];

      console.log("MongoDB query filter:", JSON.stringify(filter));

      // Execute raw MongoDB query
      const result = await prisma.$runCommandRaw({
        find: "students", // MongoDB collection name
        filter: filter,
        limit: 1,
        projection: {
          _id: 1,
          profile: 1,
          admissionNumber: 1,
        },
      });

      // Process the raw MongoDB result
      if (
        result &&
        result.cursor &&
        result.cursor.firstBatch &&
        result.cursor.firstBatch.length > 0
      ) {
        const rawStudent = result.cursor.firstBatch[0];

        // Debug the raw _id from MongoDB
        console.log("Raw student _id type:", typeof rawStudent._id);
        console.log("Raw student _id value:", rawStudent._id);

        // Store the raw _id for later use
        rawStudentId = rawStudent._id;

        const studentId = safeToString(rawStudent._id);
        console.log("Processed student ID:", studentId);

        // Map MongoDB result to expected Prisma format
        student = {
          id: studentId,
          admissionNumber: rawStudent.admissionNumber || "N/A",
          profile: rawStudent.profile,
        };
      } else {
        student = null; // No student found
      }
    }

    if (!student) {
      return { error: "Student not found." };
    }

    if (
      !student.profile ||
      !student.profile.firstName ||
      !student.profile.lastName
    ) {
      console.error(
        "Student found, but profile data is missing or incomplete:",
        student
      );
      return { error: "Student profile data is missing or incomplete." };
    }

    const studentInfo: StudentInfo = {
      id: student.id,
      admissionNumber: student.admissionNumber || "N/A",
      firstName: student.profile.firstName || "N/A",
      lastName: student.profile.lastName || "N/A",
    };

    // Debug the student ID we're about to use for the next query
    console.log("Student ID for assignmentResults query:", student.id);
    console.log("Student ID type:", typeof student.id);

    try {
      // For student number search, we can use the standard Prisma query
      // For name search, we'll use raw MongoDB query
      let assignmentResults = [];

      if (searchParams.studentNumber) {
        // Use standard Prisma query when we have student from standard query
        assignmentResults = await prisma.assignmentresults.findMany({
          where: { student: student.id },
          orderBy: { dateTaken: "desc" },
        });
        console.log("Standard Prisma query for assignments succeeded");
      } else {
        // Use raw MongoDB query for assignment results for name search path
        // KEY CHANGE: Convert string ID to MongoDB ObjectID format
        const objectIdForQuery = { $oid: student.id };

        console.log(
          "Using ObjectID for query:",
          JSON.stringify(objectIdForQuery)
        );

        const assignmentResultsRaw = await prisma.$runCommandRaw({
          find: "assignmentresults",
          filter: {
            student: objectIdForQuery, // Use the formatted ObjectID, not the string
          },
          sort: { dateTaken: -1 }, // -1 for descending order
        });

        console.log("Raw MongoDB query for assignments executed");

        if (
          assignmentResultsRaw &&
          assignmentResultsRaw.cursor &&
          assignmentResultsRaw.cursor.firstBatch
        ) {
          assignmentResults = assignmentResultsRaw.cursor.firstBatch;
          console.log(
            `Found ${assignmentResultsRaw.cursor.firstBatch.length} results from raw query`
          );
        }
      }

      // Add debug logging
      console.log(`Found ${assignmentResults.length} assignment results`);
      if (assignmentResults.length > 0) {
        console.log(
          "First assignment result sample:",
          JSON.stringify(assignmentResults[0], null, 2).substring(0, 200) +
            "..."
        );
      }

      if (assignmentResults.length === 0) {
        return { results: [], student: studentInfo };
      }

      // Extract assignment IDs
      const assignmentIds = [
        ...new Set(
          assignmentResults
            .map((result) => {
              // Handle both raw MongoDB results and Prisma results
              const assignId = result.assignment || result.assignmentId;
              return assignId ? safeToString(assignId) : null;
            })
            .filter(Boolean)
        ),
      ];

      console.log(`Found ${assignmentIds.length} unique assignment IDs`);

      let assignmentsMap = new Map();

      if (assignmentIds.length > 0) {
        let assignmentsData = [];

        if (searchParams.studentNumber) {
          // Use standard Prisma query for assignments
          assignmentsData = await prisma.assignments.findMany({
            where: { id: { in: assignmentIds } },
            select: { id: true, title: true, type: true, outcome: true },
          });
        } else {
          // Use raw MongoDB query for assignments
          const assignmentsRaw = await prisma.$runCommandRaw({
            find: "assignments",
            filter: {
              _id: {
                $in: assignmentIds.map((id) => {
                  try {
                    // Convert each string ID to ObjectId format
                    return { $oid: id };
                  } catch (e) {
                    return id;
                  }
                }),
              },
            },
            projection: {
              _id: 1,
              title: 1,
              type: 1,
              outcome: 1,
            },
          });

          if (assignmentsRaw?.cursor?.firstBatch) {
            assignmentsData = assignmentsRaw.cursor.firstBatch;
          }
        }

        // Create a map with string keys
        assignmentsMap = new Map(
          assignmentsData.map((assignment) => {
            // Get ID based on source (raw MongoDB or Prisma)
            const rawId = assignment._id || assignment.id;
            const assignmentId = safeToString(rawId);

            return [
              assignmentId,
              {
                id: assignmentId,
                title: assignment.title || "Unknown",
                type: assignment.type || "Unknown",
                outcome: assignment.outcome || [],
              },
            ];
          })
        );
      }

      const transformedResults: AssignmentResult[] = assignmentResults.map(
        (result) => {
          // Get assignment ID based on source (raw MongoDB or Prisma)
          const rawAssignId = result.assignment || result.assignmentId;
          const assignmentId = safeToString(rawAssignId);

          // Get result ID based on source
          const rawResultId = result._id || result.id;
          const resultId = safeToString(rawResultId);

          const assignmentDetails = assignmentId
            ? assignmentsMap.get(assignmentId)
            : null;

          // Determine date format based on source
          let dateTaken;
          if (result.dateTaken instanceof Date) {
            dateTaken = result.dateTaken;
          } else if (typeof result.dateTaken === "string") {
            dateTaken = new Date(result.dateTaken);
          } else {
            dateTaken = new Date(); // Fallback
          }

          return {
            id: resultId,
            dateTaken,
            assignmentData: {
              id: assignmentDetails?.id,
              title: assignmentDetails?.title || "Unknown Assignment",
              type: assignmentDetails?.type || "Unknown Type",
              outcome: assignmentDetails?.outcome,
            },
            testScore: result.testScore ?? null,
            taskScore: result.taskScore ?? null,
            scores: result.scores ?? null,
            percent: result.percent ?? null,
            status: result.status || "pending",
            feedback: result.feedback || null,
          };
        }
      );

      // Verify the transformed data structure
      console.log(`Transformed ${transformedResults.length} results`);
      if (transformedResults.length > 0) {
        console.log(
          "Sample transformed result:",
          JSON.stringify(transformedResults[0], null, 2).substring(0, 200) +
            "..."
        );
      }

      return {
        results: transformedResults,
        student: studentInfo,
      };
    } catch (queryError) {
      console.error("Error in assignment query:", queryError);
      if (queryError instanceof Error) {
        console.error("Query error details:", queryError.message);
      }
      return {
        error: "Error fetching assignments. Please try again.",
      };
    }
  } catch (e: unknown) {
    console.error(
      "A SEVERE ERROR OCCURRED IN getStudentMarks (catch block entry)"
    );
    if (e instanceof Error) {
      console.error("Error Name:", e.name);
      console.error("Error Message:", e.message);
      console.error("Error Stack:", e.stack);
    } else {
      try {
        console.error("Caught non-Error value:", JSON.stringify(e));
      } catch (stringifyError) {
        console.error("Could not stringify the caught value:", stringifyError);
      }
    }
    return {
      error: "An unexpected server error occurred. Please check server logs.",
    };
  }
}
