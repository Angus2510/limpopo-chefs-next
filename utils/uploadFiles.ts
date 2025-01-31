import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
  ServerSideEncryption,
  StorageClass,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { getFileExtension } from "./fileTypes";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env["AWS_REGION"] || "eu-north-1",
  credentials: {
    accessKeyId: process.env["AWS_ACCESS_KEY_ID"]!,
    secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"]!,
  },
});

/**
 * Uploads a file to AWS S3.
 * @param file - The file to upload.
 * @param folder - The folder path where the file will be stored.
 * @param fileName - Optional custom file name. If not provided, a UUID will be used.
 * @param contentType - The MIME type of the file.
 * @returns The full S3 file path.
 */
export async function uploadFileToS3(
  file: Buffer | Uint8Array | Blob | string, // The file content
  folder: string, // The folder in the bucket
  contentType: string, // The MIME type of the file
  fileName?: string // Optional custom file name
) {
  // Generate a unique identifier and append it to the file name
  const uniqueId = uuidv4().slice(0, 4); // Generate a 4-digit UUID
  const generatedFileName = fileName
    ? `${fileName}-${uniqueId}.${getFileExtension(contentType)}`
    : `${uuidv4()}-${uniqueId}.${getFileExtension(contentType)}`;

  // Construct the full S3 key (file path)
  const filePath = `${folder}/${generatedFileName}`;

  // Define the parameters for the S3 upload
  const params = {
    Bucket: process.env["S3_BUCKET_NAME"]!,
    Key: filePath,
    Body: file,
    ContentType: contentType,
    ACL: "private" as ObjectCannedACL, // Ensure this is correctly typed
    StorageClass: "STANDARD" as StorageClass, // Ensure this is correctly typed
    ServerSideEncryption: "AES256" as ServerSideEncryption, // Ensure this is correctly typed
  };

  try {
    // Execute the upload command
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    console.log(`File uploaded successfully to: ${filePath}`);
    return filePath; // Return the file path for later use
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error; // Rethrow the error to be handled by the calling function
  }
}
