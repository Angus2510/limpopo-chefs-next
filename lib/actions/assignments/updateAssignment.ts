"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";

interface UpdateAssignmentData {
  id: string;
  duration: number;
  availableFrom: string | Date;
  campus: string[];
  intakeGroups: string[];
  password: string;
}

export async function updateAssignment(id: string, data: UpdateAssignmentData) {
  if (!id || !ObjectId.isValid(id)) {
    throw new Error("Invalid assignment ID");
  }

  try {
    const availableFromDate = new Date(data.availableFrom);
    availableFromDate.setUTCHours(12, 0, 0, 0);

    if (isNaN(availableFromDate.getTime())) {
      throw new Error("Invalid date format");
    }

    const updated = await prisma.assignments.update({
      where: { id },
      data: {
        duration: parseInt(String(data.duration)),
        availableFrom: availableFromDate,
        campus: Array.isArray(data.campus) ? data.campus : [],
        intakeGroups: Array.isArray(data.intakeGroups) ? data.intakeGroups : [],
        password: data.password,
        passwordGeneratedAt: new Date(), // Add this line
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/assignment");
    revalidatePath("/admin/assignment/[id]");
    revalidatePath("/admin/assignment/edit/[id]");

    return updated;
  } catch (error) {
    console.error("Failed to update assignment:", error);
    throw error;
  }
}
