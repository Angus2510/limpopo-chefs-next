"use server";

import prisma from "@/lib/db";
import { deleteFile } from "@/lib/s3-operations";

export async function deleteDocument(documentId: string): Promise<boolean> {
  try {
    // Try to find the document in general documents first
    let document = await prisma.generaldocuments.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      // If not found in general documents, try legal documents
      document = await prisma.legaldocuments.findUnique({
        where: { id: documentId },
      });
    }

    if (!document) {
      throw new Error("Document not found");
    }

    // Delete the file from S3
    const fileKey = document.documentUrl;
    const s3Success = await deleteFile(fileKey);

    if (!s3Success) {
      throw new Error("Failed to delete file from storage");
    }

    // Delete from the appropriate collection
    if (
      await prisma.generaldocuments.findUnique({ where: { id: documentId } })
    ) {
      await prisma.generaldocuments.delete({
        where: { id: documentId },
      });
    } else {
      await prisma.legaldocuments.delete({
        where: { id: documentId },
      });
    }

    return true;
  } catch (error) {
    console.error("Error deleting document:", error);
    return false;
  }
}
