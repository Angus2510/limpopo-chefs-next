"use server";

import prisma from "@/lib/db";
import { uploadFileToS3 } from "@/utils/uploadFiles";
import { Buffer } from "buffer";

export const uploadLearningMaterial = async (formData: FormData) => {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const file = formData.get("file") as File;

  const intakeGroups: string[] = [];
  formData.forEach((value, key) => {
    if (key.startsWith("intakeGroup[")) {
      intakeGroups.push(value as string);
    }
  });

  const fileType = file.type;
  const uploadType = "Study Material";
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const uploadedFiles = await Promise.all(
    intakeGroups.map(async (group) => {
      const folder = `learning-materials/${group}`;
      const fileName = file.name.split(".").slice(0, -1).join(".");

      const s3FilePath = await uploadFileToS3(
        fileBuffer,
        folder,
        fileType,
        fileName
      );

      // Log to verify the file path
      console.log("S3 file path:", s3FilePath);

      return {
        title,
        uploadType,

        description,
        intakeGroup: [group], // Store as an array
        filePath: s3FilePath,
        v: 1, // Default version number, adjust if needed
        dateUploaded: new Date(), // Add dateUploaded field if required
      };
    })
  );

  // Log uploaded files data before inserting
  console.log("Uploaded files to be inserted:", uploadedFiles);

  try {
    // Insert each uploaded file entry into the database
    const learningMaterials = await prisma.learningmaterials.createMany({
      data: uploadedFiles, // Ensure intakeGroup is stored correctly
    });

    console.log("Learning Materials created:", learningMaterials);
    return { success: true, data: learningMaterials };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating learning material:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
    throw new Error("Failed to create learning material");
  }
};
