import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { getFileExtension } from "@/utils/fileTypes";

const s3Client = new S3Client({
  region: process.env["AWS_REGION"] || "eu-north-1",
  credentials: {
    accessKeyId: process.env["AWS_ACCESS_KEY_ID"]!,
    secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"]!,
  },
});

export async function POST(request: Request) {
  const { fileName, fileType, folder } = await request.json();

  const uniqueId = uuidv4().slice(0, 4);
  const generatedFileName = `${fileName}-${uniqueId}.${getFileExtension(
    fileType
  )}`;
  const filePath = `${folder}/${generatedFileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env["S3_BUCKET_NAME"],
    Key: filePath,
    ContentType: fileType,
    StorageClass: "STANDARD",
    ServerSideEncryption: "AES256",
  });

  try {
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 600,
    });
    return Response.json({
      success: true,
      presignedUrl,
      filePath,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Failed to generate presigned URL",
      },
      { status: 500 }
    );
  }
}
