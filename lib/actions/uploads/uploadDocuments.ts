"use server";

import prisma from "@/lib/db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3 client configuration
const s3Client = new S3Client({
  region: process.env["AWS_REGION"] || "eu-north-1",
  credentials: {
    accessKeyId: process.env["AWS_ACCESS_KEY_ID"]!,
    secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"]!,
  },
});

// Define the document folder mapping
const documentFolderMap = {
  "Student Application Check List": "application",
  "Application Form": "application",
  "Uniform Order Sheet": "uniform",
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
  "Device Policy": "policy",
  "Re-assessment Policy": "policy",
  "Popi Act Concent Form": "policy",
  "Notice of Assessment (NOA)": "acknowledgements",
  "Notice of Re Assessment (NORA)": "acknowledgements",
} as const;

// Function to generate presigned URL
export const getPresignedUrl = async (
  fileName: string,
  fileType: string,
  folder: string
) => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env["S3_BUCKET_NAME"]!,
      Key: `${folder}/${fileName}`,
      ContentType: fileType,
      StorageClass: "STANDARD",
      ACL: "private",
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 600,
      signableHeaders: new Set(["host"]), // Add this line
    });

    console.log("Generated presigned URL with params:", {
      bucket: process.env["S3_BUCKET_NAME"],
      key: `${folder}/${fileName}`,
      contentType: fileType,
    });

    return {
      success: true,
      presignedUrl,
      filePath: `${folder}/${fileName}`,
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate upload URL",
    };
  }
};

// Function to save document metadata
export const saveDocumentMetadata = async (metadata: {
  title: string;
  description: string;
  category: string;
  studentId: string;
  documentUrl: string;
}) => {
  const { title, description, category, studentId, documentUrl } = metadata;

  console.log("Saving document with category:", category); // Debug log

  try {
    let document;
    if (category === "legal") {
      document = await prisma.legaldocuments.create({
        data: {
          title,
          description: description || "",
          documentUrl,
          student: studentId,
          uploadDate: new Date(),
          v: 0,
        },
      });
    } else if (category === "other") {
      document = await prisma.generaldocuments.create({
        data: {
          title,
          description: description || "",
          documentUrl,
          student: studentId,
          uploadDate: new Date(),
          v: 0,
          category: "other", // Explicitly set category as "other"
        },
      });
      console.log("Created 'other' document:", document); // Debug log
    } else {
      document = await prisma.generaldocuments.create({
        data: {
          title,
          description: description || "",
          documentUrl,
          student: studentId,
          uploadDate: new Date(),
          v: 0,
          category: "general",
        },
      });
    }

    return {
      success: true,
      data: document,
    };
  } catch (error) {
    console.error("Error saving document:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save document",
    };
  }
};

// Main upload document function
export const uploadDocument = async (formData: FormData) => {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const studentId = formData.get("studentId") as string;
    const documentUrl = formData.get("documentUrl") as string;
    const fileType = formData.get("fileType") as string;
    const fileName = formData.get("fileName") as string;

    console.log("Processing upload request with:", {
      title,
      category,
      studentId,
      hasDocumentUrl: !!documentUrl,
      fileType,
      fileName,
    });

    // If documentUrl is provided, this is a metadata-only save
    if (documentUrl) {
      console.log("Saving metadata with category:", category); // Add this debug log
      const result = await saveDocumentMetadata({
        title,
        description,
        category,
        studentId,
        documentUrl,
      });
      console.log("Metadata save result:", result); // Add this debug log
      return result;
    }

    // Validation for presigned URL request
    if (!title || !category || !studentId || !fileType || !fileName) {
      console.error("Missing required fields:", {
        title,
        category,
        studentId,
        fileType,
        fileName,
      });
      return {
        success: false,
        error: "Missing required fields",
      };
    }

    const documentTypeFolder =
      documentFolderMap[title as keyof typeof documentFolderMap];
    if (!documentTypeFolder) {
      return {
        success: false,
        error: "Invalid document type",
      };
    }

    const folder = `documents/${category}/${documentTypeFolder}/${studentId}`;
    const uniqueFileName = `${fileName
      .split(".")
      .slice(0, -1)
      .join(".")}-${Date.now()}${fileName.substring(
      fileName.lastIndexOf(".")
    )}`;

    console.log("Generating presigned URL for:", {
      folder,
      uniqueFileName,
      contentType: fileType,
    });

    // Get presigned URL for upload
    const { success, presignedUrl, filePath, error } = await getPresignedUrl(
      uniqueFileName,
      fileType,
      folder
    );

    if (!success || !presignedUrl || !filePath) {
      return {
        success: false,
        error: error || "Failed to generate upload URL",
      };
    }

    return {
      success: true,
      presignedUrl,
      filePath,
    };
  } catch (error) {
    console.error("Error processing document upload:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to process document upload",
    };
  }
};
