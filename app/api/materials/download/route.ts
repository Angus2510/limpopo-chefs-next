import { NextResponse } from "next/server";
import AWS from "aws-sdk";

const s3 = new AWS.S3();

export async function POST(req: Request) {
  try {
    // Parse the request body to get fileKey and fileName
    const { fileKey, fileName } = await req.json();

    // Log the received data
    console.log("Received fileKey:", fileKey, "fileName:", fileName);

    // Check if fileKey or fileName is missing
    if (!fileKey || !fileName) {
      return NextResponse.json(
        { error: "Missing fileKey or fileName" },
        { status: 400 }
      );
    }

    // Your S3 Bucket Name
    const bucketName = process.env["S3_BUCKET_NAME"];
    if (!bucketName) {
      throw new Error("Bucket name is not defined.");
    }

    // Generate signed URL for the file
    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: bucketName,
      Key: fileKey, // Use the received fileKey
      Expires: 60 * 5, // URL expiry time in seconds (5 minutes)
    });

    // Return the signed URL
    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { error: "Error generating signed URL" },
      { status: 500 }
    );
  }
}
