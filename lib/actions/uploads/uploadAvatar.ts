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

  // Generate the file name (using the userId and file name for uniqueness)
  const fileName = `profile-picture/${userId}-${file.name}`;

  try {
    // Upload the avatar to S3
    const s3FilePath = await uploadFileToS3(
      fileBuffer,
      "limpopochefs-media", // Make sure this is the correct bucket name
      fileType,
      fileName
    );

    // Construct the full URL to access the uploaded file
    const avatarURL = `https://limpopochefs-media.s3.eu-north-1.amazonaws.com/${s3FilePath}`;

    // Save the avatar URL in the user's profile in the database
    const user = await prisma.students.update({
      where: { id: userId }, // Assuming user ID is passed in the form data
      data: {
        avatarUrl: avatarURL, // Store the full S3 URL in the user table
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
