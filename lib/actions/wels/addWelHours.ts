"use server";

import { ObjectId } from "mongodb";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

interface WelHoursData {
  studentId: string;
  welId: string;
  startDate: string;
  endDate: string;
  totalHours: string;
  establishmentContact: string;
  evaluated: boolean;
}

export async function addWelHours(data: WelHoursData) {
  try {
    // Get WEL establishment name
    const wel = await prisma.wels.findUnique({
      where: { id: data.welId },
      select: { title: true },
    });

    if (!wel) {
      return { success: false, error: "WEL location not found" };
    }

    const welRecord = {
      id: new ObjectId().toString(),
      welId: data.welId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      totalHours: parseInt(data.totalHours),
      establishmentContact: data.establishmentContact,
      establishmentName: wel.title,
      evaluated: data.evaluated,
      dateAdded: new Date(),
    };

    // Find or create student WEL record
    const record = await prisma.studentwelrecords.upsert({
      where: {
        id: new ObjectId().toString(), // Generate new ID if not found
        student: data.studentId,
      },
      create: {
        id: new ObjectId().toString(),
        student: data.studentId,
        welRecords: [welRecord],
        createdAt: new Date(),
        updatedAt: new Date(),
        v: 0,
      },
      update: {
        welRecords: {
          push: welRecord,
        },
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/wel/students");
    return { success: true, data: record };
  } catch (error) {
    console.error("Error adding WEL hours:", error);
    return {
      success: false,
      error: "Failed to add WEL hours",
    };
  }
}
