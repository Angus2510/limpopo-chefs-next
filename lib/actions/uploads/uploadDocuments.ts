"use server";

import prisma from "@/lib/db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3 client configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

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

// Function to generate presigned URL
export const getPresignedUrl = async (
  fileName: string,
  fileType: string,
  folder: string
) => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `${folder}/${fileName}`,
      ContentType: fileType,
      StorageClass: "STANDARD",
      ServerSideEncryption: "AES256",
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 600,
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

  const documentData = {
    title,
    description: description || "",
    documentUrl,
    student: studentId,
    uploadDate: new Date(),
    v: 0,
  };

  try {
    let document;
    if (category === "legal") {
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
    console.error("Error saving document metadata:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save document metadata",
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
    const file = formData.get("file") as File;
    const documentUrl = formData.get("documentUrl") as string;

    // Check if this is a direct S3 upload (documentUrl provided)
    if (documentUrl) {
      return await saveDocumentMetadata({
        title,
        description,
        category,
        studentId,
        documentUrl,
      });
    }

    // Validation
    if (!title || !category || !studentId || !file) {
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
    const fileName = `${file.name
      .split(".")
      .slice(0, -1)
      .join(".")}-${Date.now()}${file.name.substring(
      file.name.lastIndexOf(".")
    )}`;

    // Get presigned URL for upload
    const { success, presignedUrl, filePath, error } = await getPresignedUrl(
      fileName,
      file.type,
      folder
    );

    if (!success || !presignedUrl || !filePath) {
      return {
        success: false,
        error: error || "Failed to generate upload URL",
      };
    }

    // Return the presigned URL and file path for frontend upload
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
