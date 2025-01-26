'use server';

import prisma from '@/lib/db';
import { uploadFileToS3 } from '@/utils/uploadFiles';
import { Buffer } from 'buffer';
export const uploadLearningMaterial = async (formData: FormData) => {
  // Extract data from the formData object
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const file = formData.get('file') as File;

  const intakeGroup: string[] = [];
  formData.forEach((value, key) => {
    if (key.startsWith('intakeGroup[')) {
      intakeGroup.push(value as string);
    }
  });

  const fileType = file.type;
  const uploadType = 'Study Material';

  // Convert the File object to a Buffer
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  // Upload the file to S3
  const folder = 'dev/uploads/learning-materials';
  const fileName = file.name.split('.').slice(0, -1).join('.');
  const s3FilePath = await uploadFileToS3(
    fileBuffer,
    folder,
    fileType,
    fileName
  );

  const learningMaterialData = {
    title,
    uploadType,
    fileType,
    description,
    intakeGroup,
    filePath: s3FilePath,
  };

  try {
    const learningMaterial = await prisma.learningMaterial.create({
      data: learningMaterialData,
    });

    console.log('Learning Material created:', learningMaterial);
    return { success: true, data: learningMaterial };
  } catch (error) {
    console.error('Error creating learning material:', error);
    throw new Error('Failed to create learning material');
  }
};
