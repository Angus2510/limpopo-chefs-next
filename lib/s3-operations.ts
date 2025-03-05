"use server";

import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { cookies } from "next/headers";
import { TokenPayload } from "@/store/authStore";
import { jwtDecode } from "jwt-decode";

// Initialize S3 client with environment variables
const s3Client = new S3Client({
  region: process.env["AWS_REGION"] as string,
  credentials: {
    accessKeyId: process.env["AWS_ACCESS_KEY_ID"]!,
    secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"]!,
  },
});

// Validate environment variables
async function validateConfig() {
  const requiredEnvVars = [
    "AWS_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "S3_BUCKET_NAME",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
}

// Verify authentication
async function verifyAuth() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken");

  if (!accessToken?.value) {
    throw new Error("No access token found");
  }

  try {
    const decoded = jwtDecode<TokenPayload>(accessToken.value);
    const currentTime = Date.now() / 1000;

    if (decoded.exp <= currentTime) {
      throw new Error("Token has expired");
    }

    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

export interface S3FileOperations {
  fileKey: string;
  fileName?: string;
}

export async function getViewUrl(fileKey: string): Promise<string> {
  if (!fileKey) {
    throw new Error("File key is required");
  }

  try {
    await validateConfig();
    await verifyAuth();

    const command = new GetObjectCommand({
      Bucket: process.env["S3_BUCKET_NAME"],
      Key: fileKey,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return signedUrl;
  } catch (error) {
    console.error("Error generating view URL:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate view URL"
    );
  }
}

export async function getDownloadUrl({
  fileKey,
  fileName,
}: S3FileOperations): Promise<string> {
  if (!fileKey) {
    throw new Error("File key is required");
  }

  try {
    await validateConfig();
    await verifyAuth();

    // Get the default filename from the fileKey if it's a string
    const defaultFileName =
      typeof fileKey === "string" ? fileKey.split("/").pop() : "download";

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
      ResponseContentDisposition: `attachment; filename="${
        fileName || defaultFileName || "download"
      }"`,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return signedUrl;
  } catch (error) {
    console.error("Error generating download URL:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate download URL"
    );
  }
}

export async function deleteFile(fileKey: string): Promise<boolean> {
  if (!fileKey) {
    throw new Error("File key is required");
  }

  try {
    await validateConfig();
    await verifyAuth();

    const command = new DeleteObjectCommand({
      Bucket: process.env["S3_BUCKET_NAME"],
      Key: fileKey,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete file"
    );
  }
}
