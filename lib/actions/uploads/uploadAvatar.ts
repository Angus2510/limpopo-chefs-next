import prisma from "@/lib/db";
import { uploadFileToS3 } from "@/utils/uploadFiles";
import { Buffer } from "buffer";

export const uploadAvatar = async (formData: FormData) => {
  const file = formData.get("avatar") as File;
  const userId = formData.get("userId") as string;

  if (!file || !userId) {
    throw new Error("File and user ID are required");
  }

  console.log("Uploading avatar for:", {
    userId,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  });

  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `profile-pictures/${userId}-${Date.now()}-${file.name}`;

    // Upload to S3
    const s3FilePath = await uploadFileToS3(
      fileBuffer,
      "limpopochefs-media",
      file.type,
      fileName
    );

    // Construct the full URL
    const avatarURL = `https://limpopochefs-media.s3.eu-north-1.amazonaws.com/${s3FilePath}`;

    // Update the user's avatar URL in the database
    const updatedStudent = await prisma.students.update({
      where: { id: userId },
      data: { avatarUrl: avatarURL },
    });

    console.log("Avatar uploaded successfully:", avatarURL);
    return { success: true, avatarUrl: avatarURL, data: updatedStudent };
  } catch (error) {
    console.error("Error uploading avatar:", error);
    throw error;
  }
};
