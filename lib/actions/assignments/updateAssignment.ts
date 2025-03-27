"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";

interface UpdateAssignmentData {
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

  if (!data || typeof data !== "object") {
    throw new Error("Invalid update data provided");
  }

  try {
    // Ensure all required fields exist
    if (
      !data.duration ||
      !data.availableFrom ||
      !data.campus ||
      !data.intakeGroups ||
      !data.password
    ) {
      throw new Error("Missing required fields");
    }

    // Format date
    const availableFromDate = new Date(data.availableFrom);
    availableFromDate.setUTCHours(12, 0, 0, 0);

    if (isNaN(availableFromDate.getTime())) {
      throw new Error("Invalid date format");
    }

    // Prepare update data matching schema fields
    const updateData = {
      duration: Number(data.duration),
      availableFrom: availableFromDate,
      campus: Array.isArray(data.campus) ? data.campus : [],
      intakeGroups: Array.isArray(data.intakeGroups) ? data.intakeGroups : [],
      password: String(data.password),
      passwordGeneratedAt: new Date(), // This field exists in schema
      updatedAt: new Date(),
    };

    // Log update attempt
    console.log("Attempting to update assignment:", {
      id,
      updateData: JSON.stringify(updateData, null, 2),
    });

    // Perform update with schema-valid fields
    const updated = await prisma.assignments.update({
      where: {
        id: id,
      },
      data: updateData,
      select: {
        id: true,
        title: true,
        type: true,
        duration: true,
        availableFrom: true,
        campus: true,
        intakeGroups: true,
        password: true,
        passwordGeneratedAt: true,
        updatedAt: true,
        lecturer: true,
        outcome: true,
        questions: true,
      },
    });

    if (!updated) {
      throw new Error("Failed to update assignment");
    }

    // Log success
    console.log("Assignment updated successfully:", updated.id);

    // Revalidate paths
    revalidatePath("/admin/assignment");
    revalidatePath("/admin/assignment/[id]");
    revalidatePath("/admin/assignment/edit/[id]");

    return updated;
  } catch (error) {
    console.error("Failed to update assignment:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      data: JSON.stringify(data, null, 2),
    });

    throw new Error(
      error instanceof Error ? error.message : "Failed to update assignment"
    );
  }
}
