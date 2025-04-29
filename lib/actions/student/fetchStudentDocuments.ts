"use server";
import prisma from "@/lib/db";

interface Document {
  id: string;
  title: string;
  description: string;
  documentUrl: string;
  uploadDate?: Date | null;
  category: "general" | "legal" | "other"; // Update interface to include "other"
}

export async function fetchStudentDocuments(
  studentId: string
): Promise<Document[]> {
  try {
    if (!studentId) return [];

    const [generalDocs, legalDocs] = await Promise.all([
      prisma.generaldocuments.findMany({
        where: { student: studentId },
        select: {
          id: true,
          title: true,
          description: true,
          documentUrl: true,
          uploadDate: true,
          category: true, // Add this line to select the category field
        },
      }),
      prisma.legaldocuments.findMany({
        where: { student: studentId },
        select: {
          id: true,
          title: true,
          description: true,
          documentUrl: true,
          uploadDate: true,
        },
      }),
    ]);

    // Keep the original category for general documents
    const formattedGeneralDocs = generalDocs.map((doc) => ({
      ...doc,
      category: doc.category || ("general" as const), // Use the stored category or default to "general"
    }));

    const formattedLegalDocs = legalDocs.map((doc) => ({
      ...doc,
      category: "legal" as const,
    }));

    console.log("Fetched documents:", {
      generalDocs: formattedGeneralDocs,
      legalDocs: formattedLegalDocs,
    });

    return [...formattedGeneralDocs, ...formattedLegalDocs];
  } catch (error) {
    console.error("Error fetching student documents:", error);
    return [];
  }
}
