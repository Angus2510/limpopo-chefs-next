// app/api/admin/learning-materials/view/route.ts

import { NextRequest, NextResponse } from "next/server";
import { S3 } from "@aws-sdk/client-s3";
import mime from "mime";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  // Get document ID from URL parameters
  const documentId = req.nextUrl.searchParams.get("documentId");

  if (!documentId || typeof documentId !== "string") {
    return NextResponse.json(
      { message: "Document id is required" },
      { status: 400 }
    );
  }

  try {
    // Retrieve the document record from the database
    const documentRecord = await prisma.learningmaterials.findUnique({
      where: { id: documentId },
    });

    if (!documentRecord || !documentRecord.filePath) {
      return NextResponse.json(
        { message: "Document not found or missing file path" },
        { status: 404 }
      );
    }

    const s3Key = documentRecord.filePath;
    const contentType = mime.getType(s3Key) || "application/octet-stream";

    // Initialize S3 client
    const s3 = new S3({
      region: process.env["AWS_REGION"] || "eu-north-1", // AWS region
    });

    const bucketName = process.env["S3_BUCKET_NAME"];
    if (!bucketName) {
      return NextResponse.json(
        { message: "S3 bucket name is not configured" },
        { status: 500 }
      );
    }

    // Get the file from S3
    const s3Params = { Bucket: bucketName, Key: s3Key };
    const s3Object = await s3.getObject(s3Params);

    // Prepare response headers for viewing in the browser (inline)
    const headers = new Headers();
    headers.set("Content-Type", contentType); // This ensures the browser knows how to handle the file
    headers.set("Content-Disposition", "inline"); // Display the file in the browser

    const body = s3Object.Body as ReadableStream;

    // Return file to the client
    return new NextResponse(body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error viewing document from S3:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
