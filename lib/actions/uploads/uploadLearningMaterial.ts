"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import prisma from "@/lib/db";

// S3 client configuration
const s3Client = new S3Client({
  region: process.env["AWS_REGION"] || "eu-north-1",
  credentials: {
    accessKeyId: process.env["AWS_ACCESS_KEY_ID"]!,
    secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"]!,
  },
});

export const uploadLearningMaterial = async (formData: FormData) => {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const isMetadataOnly = formData.get("isMetadataOnly") as string;
  const fileType = formData.get("fileType") as string;
  const fileName = formData.get("fileName") as string;

  // Collect intake groups from form data
  const intakeGroups: string[] = [];
  formData.forEach((value, key) => {
    if (key.startsWith("intakeGroup[")) {
      intakeGroups.push(value as string);
    }
  });

  // Validate intake groups
  if (intakeGroups.length === 0 && !isMetadataOnly) {
    return {
      success: false,
      error: "At least one intake group must be selected",
    };
  }

  // Handle presigned URL request
  if (!isMetadataOnly) {
    try {
      const folder = `learning-materials/${intakeGroups[0]}`;
      const uniqueFileName = `${fileName
        .split(".")
        .slice(0, -1)
        .join(".")}-${Date.now()}${fileName.substring(
        fileName.lastIndexOf(".")
      )}`;

      console.log("Generating presigned URL with params:", {
        bucket: process.env["S3_BUCKET_NAME"],
        key: `${folder}/${uniqueFileName}`,
        contentType: fileType,
      });

      const command = new PutObjectCommand({
        Bucket: process.env["S3_BUCKET_NAME"]!,
        Key: `${folder}/${uniqueFileName}`,
        ContentType: fileType,
        StorageClass: "STANDARD",
        ACL: "private",
      });

      const presignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 600,
        signableHeaders: new Set(["host", "content-type"]),
      });

      console.log("Successfully generated presigned URL");

      return {
        success: true,
        presignedUrl,
        filePath: `${folder}/${uniqueFileName}`,
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
  }

  // Handle metadata save
  try {
    const filePath = formData.get("filePath") as string;

    if (!filePath) {
      throw new Error("File path is required for metadata save");
    }

    const learningMaterial = await prisma.learningmaterials.create({
      data: {
        title,
        uploadType: "Study Material",
        description,
        intakeGroup: intakeGroups,
        filePath,
        v: 1,
        dateUploaded: new Date(),
      },
    });

    return { success: true, data: learningMaterial };
  } catch (error) {
    console.error("Error saving metadata:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save metadata",
    };
  }
};
