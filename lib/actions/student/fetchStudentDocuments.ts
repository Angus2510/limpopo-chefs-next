"use server";
import prisma from "@/lib/db";

interface Document {
  id: string;
  title: string;
  description: string;
  documentUrl: string;
  uploadDate?: Date | null;
  category: "general" | "legal";
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

    // Add category to each document
    const formattedGeneralDocs = generalDocs.map((doc) => ({
      ...doc,
      category: "general" as const,
    }));
    const formattedLegalDocs = legalDocs.map((doc) => ({
      ...doc,
      category: "legal" as const,
    }));

    return [...formattedGeneralDocs, ...formattedLegalDocs];
  } catch (error) {
    console.error("Error fetching student documents:", error);
    return [];
  }
}
