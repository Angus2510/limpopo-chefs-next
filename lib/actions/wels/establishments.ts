"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

interface WelData {
  title: string;
  location: string;
  description?: string;
  accommodation: boolean;
  // 'available' field removed
  note?: string;
  photoPath: string[];
}

export async function createWel(data: WelData) {
  try {
    const newWel = await prisma.wels.create({
      data: {
        ...data,
        // If your Prisma schema for 'wels' has an 'available' field
        // that is non-nullable and has no default, you might need to
        // explicitly set a default value here, e.g., available: true,
        // or modify your schema.
        dateUploaded: new Date(),
        v: 0,
      },
    });
    revalidatePath("/admin/wel");
    return newWel;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to create WEL:", error.message);
    }
    throw new Error("Failed to create WEL");
  }
}

export async function getWels() {
  try {
    const wels = await prisma.wels.findMany({
      select: {
        id: true,
        title: true,
        location: true,
        description: true,
        accommodation: true,
        // 'available' field removed from select
        note: true,
        photoPath: true,
        dateUploaded: true,
        v: true,
      },
      orderBy: {
        dateUploaded: "desc",
      },
    });

    // If no wels found, return empty array
    if (!wels || wels.length === 0) return [];

    // Transform and validate the data
    return wels.map((wel) => ({
      id: wel.id,
      title: wel.title,
      location: wel.location,
      description: wel.description ?? "",
      accommodation: Boolean(wel.accommodation),
      // 'available' field removed from returned object
      note: wel.note ?? "",
      photoPath: Array.isArray(wel.photoPath) ? wel.photoPath : [],
      dateUploaded: wel.dateUploaded,
      v: wel.v ?? 0,
    }));
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to fetch WELs:", error.message);
    }
    return [];
  }
}

export async function updateWel(id: string, data: Partial<WelData>) {
  if (!id) throw new Error("WEL ID is required");

  try {
    // 'data' (Partial<WelData>) will no longer contain 'available'
    const updatedWel = await prisma.wels.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    revalidatePath("/admin/wel");
    return updatedWel;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error("WEL not found");
      }
    }
    console.error("Failed to update WEL:", error);
    throw new Error("Failed to update WEL");
  }
}

export async function deleteWel(id: string) {
  try {
    const deleted = await prisma.wels.delete({
      where: { id },
    });
    revalidatePath("/admin/wel");
    return { success: true, data: deleted };
  } catch (error) {
    console.error("Failed to delete WEL:", error); // Added console.error for better debugging
    return { success: false, error: "Failed to delete WEL" };
  }
}
