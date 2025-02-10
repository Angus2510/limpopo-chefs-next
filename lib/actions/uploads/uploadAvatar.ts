import prisma from "@/lib/db";
import { uploadFileToS3 } from "@/utils/uploadFiles";
import { Buffer } from "buffer";

export const uploadAvatar = async (formData: FormData) => {
  const file = formData.get("avatar") as File; // Get the avatar file from form data

  if (!file) {
    throw new Error("No file uploaded");
  }
  console.log("Received file:", {
    name: file.name,
    type: file.type,
    size: file.size,
  });
  const userId = formData.get("userId");
  if (!userId) {
    throw new Error("User ID not provided in form data");
  }
  console.log("Uploading avatar for userId:", userId);

  const fileType = file.type;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  // Generate the file name (you could use a unique identifier for the user, e.g., user ID)
  const fileName = `profile-picture/${file.name
    .split(".")
    .slice(0, -1)
    .join(".")}`;

  try {
    // Upload the avatar to S3
    const s3FilePath = await uploadFileToS3(
      fileBuffer,
      "profile-picture", // Make sure this is the correct bucket name
      fileType,
      fileName
    );

    // Log to verify the file path
    console.log("S3 file path:", s3FilePath);

    // Save the avatar URL or path in your database (e.g., to the user's profile)
    const user = await prisma.students.update({
      where: { id: formData.get("userId") }, // Assuming user ID is passed in the form data
      data: {
        avatarUrl: s3FilePath, // Store the S3 file path in the user table
      },
    });

    console.log("User updated:", user);
    return { success: true, data: user };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error uploading avatar:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
    throw new Error("Failed to upload avatar");
  }
};
