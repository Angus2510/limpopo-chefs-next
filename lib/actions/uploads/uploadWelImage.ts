import { uploadFileToS3 } from "@/utils/uploadFiles";
import { Buffer } from "buffer";

export const uploadWelImage = async (formData: FormData) => {
  const file = formData.get("image") as File;
  const welId = formData.get("welId") as string;

  if (!file) {
    throw new Error("File is required");
  }

  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `W.E.L/${welId}-${Date.now()}-${file.name}`;

    // Upload to S3
    const s3FilePath = await uploadFileToS3(
      fileBuffer,
      "limpopochefs-media",
      file.type,
      fileName
    );

    // Construct the full URL
    const imageURL = `https://limpopochefs-media.s3.eu-north-1.amazonaws.com/${s3FilePath}`;

    return { success: true, imageUrl: imageURL };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
