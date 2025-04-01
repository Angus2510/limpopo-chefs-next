"use server";

import { uploadFileToS3 } from "@/utils/uploadFiles";
import { Buffer } from "buffer";

export const uploadWelImage = async (formData: FormData) => {
  const file = formData.get("image") as File;
  const welId = formData.get("welId") as string;

  if (!file || !welId) {
    throw new Error("File and WEL ID are required");
  }

  console.log("Starting WEL image upload:", {
    welId,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  });

  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${welId}-${Date.now()}-${file.name}`;

    const s3FilePath = await uploadFileToS3(
      fileBuffer,
      "W.E.L",
      file.type,
      fileName
    );

    const imageURL = `https://limpopochefs-media.s3.eu-north-1.amazonaws.com/${s3FilePath}`;
    console.log("WEL image uploaded successfully:", imageURL);

    return { success: true, imageUrl: imageURL };
  } catch (error) {
    console.error("Error uploading WEL image:", error);
    throw error;
  }
};
