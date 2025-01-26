'use server';

import prisma from '@/lib/db';

export async function createCampus(formData: FormData) {
  await prisma.campus.create({
    data: {
      title: formData.get('title') as string,
    },
  });
}
