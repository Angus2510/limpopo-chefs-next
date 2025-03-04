"use server";

import prisma from "@/lib/db";

export async function deleteDocument(documentId: string) {
  try {
    // First get the document to get the file path
    const document = await prisma.documents.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error("Document not found");
    }

    // Delete the file from S3
    await deleteFileFromS3(document.filePath);

    // Delete the document record from the database
    await prisma.documents.delete({
      where: { id: documentId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    throw new Error("Failed to delete document");
  }
}
