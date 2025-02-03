// utils/generateSignedUrl.js
"use server";
import AWS from "aws-sdk";

const s3 = new AWS.S3();

export const generateSignedUrl = async (fileKey, fileName) => {
  const bucketName = process.env["S3_BUCKET_NAME"]; // Ensure this is in your .env file

  if (!bucketName) {
    throw new Error("Bucket name is not defined.");
  }

  try {
    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: bucketName,
      Key: fileKey,
      Expires: 60 * 5, // URL expiry time (5 minutes)
      ResponseContentDisposition: `attachment; filename="${fileName}"`,
    });
    return signedUrl;
  } catch (error) {
    console.error("AWS Error:", error);
    throw new Error("Error generating signed URL: " + error.message);
  }
};
