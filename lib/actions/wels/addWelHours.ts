"use server";

import { ObjectId } from "mongodb";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

interface WelHoursData {
  studentId: string;
  establishmentName: string;
  startDate: string;
  endDate: string;
  totalHours: string;
  establishmentContact: string;
  evaluated: boolean;
}

export async function addWelHours(data: WelHoursData) {
  try {
    const record = await prisma.studentwelrecords.create({
      data: {
        id: new ObjectId().toString(),
        student: data.studentId,
        welRecords: [
          {
            id: new ObjectId().toString(),
            welId: new ObjectId().toString(), // Added missing welId field
            establishmentName: data.establishmentName,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            totalHours: parseInt(data.totalHours),
            establishmentContact: data.establishmentContact,
            evaluated: data.evaluated,
            dateAdded: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        v: 0,
      },
    });

    revalidatePath("/admin/wel/students");
    return { success: true, data: record };
  } catch (error: any) {
    console.error("Error details:", error.message);
    return {
      success: false,
      error: error.message || "Failed to add WEL hours",
    };
  }
}
