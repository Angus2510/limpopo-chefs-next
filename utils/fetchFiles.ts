import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { PassThrough } from 'stream';
import { Readable } from 'stream';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Fetches a file from S3.
 * @param filePath - The file path in the S3 bucket (excluding the bucket name).
 * @returns A Node.js readable stream of the file content and the content type.
 */
export async function fetchFileFromS3(filePath: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: filePath,
    });

    const s3Response = await s3Client.send(command);

    // Convert the S3 response body to a Node.js Readable stream
    const fileStream = s3Response.Body as Readable;
    const passThroughStream = new PassThrough();

    // Pipe the S3 stream into the PassThrough stream to make it compatible with Node.js
    fileStream.pipe(passThroughStream);

    return {
      fileStream: passThroughStream,
      contentType: s3Response.ContentType,
    };
  } catch (error) {
    console.error('Error fetching file from S3:', error);
    throw new Error('Failed to fetch file from S3');
  }
}
