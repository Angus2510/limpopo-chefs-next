import { NextResponse } from "next/server";
import AWS from "aws-sdk";
import { generateSignedUrl } from "@/lib/actions/download/generateSignedUrl"; // adjust the path as needed

const s3 = new AWS.S3();

export async function POST(req: Request) {
  try {
    // Parse the request body to get fileKey and fileName
    const { fileKey, fileName } = await req.json();

    console.log("Received fileKey:", fileKey, "fileName:", fileName);

    if (!fileKey || !fileName) {
      return NextResponse.json(
        { error: "Missing fileKey or fileName" },
        { status: 400 }
      );
    }

    // Optionally, you can either use your utility function or do it inline.
    // Using the utility function:
    const signedUrl = await generateSignedUrl(fileKey, fileName);

    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { error: "Error generating signed URL" },
      { status: 500 }
    );
  }
}
