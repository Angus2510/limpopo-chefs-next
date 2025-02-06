"use server";
import prisma from "@/lib/db"; // ✅ Use the existing Prisma client

// Define our types for better type safety
interface Question {
  questionText: string;
  questionType: string;
  correctAnswer: any;
}

interface AssignmentInput {
  title: string;
  type: string;
  duration: number;
  availableFrom: Date;
  availableUntil: Date | null;
  password: string;
  campus: string[];
  intakeGroups: string[];
  individualStudents: string[];
  outcome: string;
  lecturer: string;
  questions: Question[];
}

export class AssignmentService {
  /**
   * Converts a question object into a string format for storage
   * Each question is serialized with its metadata and answers
   */
  private serializeQuestion(question: Question): string {
    const questionData = {
      ...question,
      timestamp: new Date().toISOString(), // Add timestamp for tracking
    };
    console.log("Serializing question:", questionData);
    return Buffer.from(JSON.stringify(questionData)).toString("base64");
  }

  /**
   * Creates a new assignment with all its questions
   * Handles the conversion of question objects to strings
   */
  async createAssignment(assignmentData: AssignmentInput) {
    try {
      console.log("Received assignment data:", assignmentData);

      // Convert all questions to the string format
      const serializedQuestions = assignmentData.questions.map((question) => {
        console.log("Processing question:", question);
        return this.serializeQuestion(question);
      });

      console.log("Serialized questions:", serializedQuestions);

      // Create the assignment with all its data
      const newAssignment = await prisma.assignments.create({
        data: {
          title: assignmentData.title,
          type: assignmentData.type,
          duration: assignmentData.duration,
          availableFrom: assignmentData.availableFrom,
          availableUntil: assignmentData.availableUntil,
          password: assignmentData.password,
          campus: assignmentData.campus,
          intakeGroups: assignmentData.intakeGroups,
          individualStudents: assignmentData.individualStudents,
          outcome: Array.isArray(assignmentData.outcome)
            ? assignmentData.outcome
            : [assignmentData.outcome],
          lecturer: assignmentData.lecturer,
          questions: serializedQuestions, // Save the serialized questions array
          v: 1, // Version number as required by schema
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      console.log("Created assignment:", newAssignment);
      return newAssignment;
    } catch (error) {
      console.error("Error creating assignment:", error);
      throw error;
    }
  }

  /**
   * Retrieves an assignment and deserializes its questions
   */
  async getAssignment(assignmentId: string) {
    try {
      console.log("Fetching assignment with ID:", assignmentId);

      const assignment = await prisma.assignments.findUnique({
        where: { id: assignmentId },
      });

      if (!assignment) {
        console.error("Assignment not found:", assignmentId);
        throw new Error("Assignment not found");
      }

      console.log("Fetched assignment:", assignment);

      // Deserialize the questions back to their original format
      const questions = assignment.questions
        .map((questionStr) => {
          try {
            const parsedQuestion = JSON.parse(
              Buffer.from(questionStr, "base64").toString()
            );
            console.log("Deserialized question:", parsedQuestion);
            return parsedQuestion;
          } catch (error) {
            console.error("Error parsing question:", questionStr, error);
            return null;
          }
        })
        .filter((q) => q !== null); // Remove any questions that failed to parse

      return {
        ...assignment,
        questions,
      };
    } catch (error) {
      console.error("Error getting assignment:", error);
      throw error;
    }
  }

  /**
   * Updates an existing assignment, including its questions
   */
  async updateAssignment(
    assignmentId: string,
    assignmentData: Partial<AssignmentInput>
  ) {
    try {
      console.log("Updating assignment with ID:", assignmentId);
      console.log("Update data:", assignmentData);

      const updateData: any = {
        ...assignmentData,
        updatedAt: new Date(),
      };

      // If questions are being updated, serialize them
      if (assignmentData.questions) {
        updateData.questions = assignmentData.questions.map((question) => {
          console.log("Serializing updated question:", question);
          return this.serializeQuestion(question);
        });
      }

      const updatedAssignment = await prisma.assignments.update({
        where: { id: assignmentId },
        data: updateData,
      });

      console.log("Updated assignment:", updatedAssignment);
      return updatedAssignment;
    } catch (error) {
      console.error("Error updating assignment:", error);
      throw error;
    }
  }
}
