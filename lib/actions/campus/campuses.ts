"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface Campus {
  id: string;
  title: string;
}

export interface CampusInput {
  title: string;
}

export async function getAllCampuses(): Promise<Campus[]> {
  try {
    const campuses = await prisma.campus.findMany({
      select: {
        id: true,
        title: true,
      },
    });
    return campuses;
  } catch (error) {
    console.error("Error fetching campuses:", error);
    throw new Error("Failed to fetch campuses");
  }
}

export async function createCampus(data: CampusInput): Promise<Campus> {
  if (!data?.title) {
    throw new Error("Campus title is required");
  }

  try {
    const campus = await prisma.campus.create({
      data: {
        title: data.title,
      },
      select: {
        id: true,
        title: true,
      },
    });
    revalidatePath("/admin/settings/campus");
    return campus;
  } catch (error) {
    console.error("Error creating campus:", error);
    throw new Error("Failed to create campus");
  }
}

export async function updateCampus(
  id: string,
  data: CampusInput
): Promise<Campus> {
  if (!id || !data?.title) {
    throw new Error("Campus ID and title are required");
  }

  try {
    const campus = await prisma.campus.update({
      where: { id },
      data: {
        title: data.title,
      },
      select: {
        id: true,
        title: true,
      },
    });
    revalidatePath("/admin/settings/campus");
    return campus;
  } catch (error) {
    console.error("Error updating campus:", error);
    throw new Error("Failed to update campus");
  }
}

export async function deleteCampus(id: string): Promise<void> {
  if (!id) {
    throw new Error("Campus ID is required");
  }

  try {
    await prisma.campus.delete({
      where: { id },
    });
    revalidatePath("/admin/settings/campus");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting campus:", error.message);
      throw new Error(`Failed to delete campus: ${error.message}`);
    }
    throw new Error("Failed to delete campus");
  }
}
