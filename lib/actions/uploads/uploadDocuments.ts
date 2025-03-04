"use server";

import prisma from "@/lib/db";
import { uploadFileToS3 } from "@/utils/uploadFiles";
import { Buffer } from "buffer";

// Define the document folder mapping
const documentFolderMap = {
  "Student Application Check List": "application",
  "Application Form": "application",
  "Uniform Order Sheet": "uniform",
  "Accommodation Application": "accommodation",
  "Student Study Agreement": "agreements",
  "Accommodation Agreement": "accommodation",
  "Accommodation Inspection": "accommodation",
  "Health Questionnaire": "health",
  "Learner Code of Conduct": "conduct",
  "Proof of Address": "verification",
  "Matric Certificate": "education",
  "Plagiarism Policy": "policy",
  "Substance Abuse Policy": "policy",
  "Acknowledgement of Receipt": "acknowledgements",
  "LCA POPI Act": "policy",
  "LCA Chefs Oath": "policy",
  "Other Qualification": "education",
  "Certified ID Copy: Parent/Guardian": "identification",
  "Certified ID Copy: Student": "identification",
} as const;

export const uploadDocument = async (formData: FormData) => {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const studentId = formData.get("studentId") as string;
    const file = formData.get("file") as File;

    if (!title || !category || !studentId || !file) {
      return {
        success: false,
        error: "Missing required fields",
      };
    }

    const fileType = file.type;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const documentTypeFolder =
      documentFolderMap[title as keyof typeof documentFolderMap];
    if (!documentTypeFolder) {
      return {
        success: false,
        error: "Invalid document type",
      };
    }

    // Upload to S3
    const folder = `documents/${category}/${documentTypeFolder}/${studentId}`;
    const fileName = file.name.split(".").slice(0, -1).join(".");

    const s3FilePath = await uploadFileToS3(
      fileBuffer,
      folder,
      fileType,
      fileName
    );

    // Create document based on category
    const documentData = {
      title,
      description: description || "",
      documentUrl: s3FilePath,
      student: studentId,
      uploadDate: new Date(),
      v: 0, // Note: in Prisma schema it's "v", not "__v"
    };

    let document;
    if (category === "legal") {
      console.log("Creating document with data:", documentData);
      document = await prisma.legaldocuments.create({
        data: documentData,
      });
    } else {
      document = await prisma.generaldocuments.create({
        data: documentData,
      });
    }

    return {
      success: true,
      data: document,
    };
  } catch (error) {
    console.error("Error uploading document:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload document",
    };
  }
};
