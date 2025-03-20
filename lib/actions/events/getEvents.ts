"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getEvents() {
  try {
    const events = await prisma.events.findMany({
      where: { deleted: false },
      orderBy: { startDate: "asc" },
    });
    return events; // Return just the events array
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
}

export async function createEvent(data: any) {
  try {
    const event = await prisma.events.create({
      data: {
        title: data.title,
        details: data.details || "",
        startDate: new Date(data.startDate || new Date()),
        startTime: data.startTime || "09:00",
        campus: data.campus || "",
        venue: data.venue || "",
        lecturer: data.lecturer || "",
        color: data.color || "other",
        assignedToModel: data.assignedToModel || [],
        createdBy: "000000000000000000000000",
        v: 1,
        deleted: false,
      },
    });
    revalidatePath("/admin/dashboard");
    return event;
  } catch (error) {
    console.error("Failed to create event:", error);
    throw error;
  }
}

export async function updateEvent(id: string, data: any) {
  try {
    const event = await prisma.events.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
      },
    });
    revalidatePath("/admin/dashboard");
    return event;
  } catch (error) {
    console.error("Failed to update event:", error);
    throw error;
  }
}

export async function deleteEvent(id: string) {
  try {
    const event = await prisma.events.update({
      where: { id },
      data: { deleted: true },
    });
    revalidatePath("/admin/dashboard");
    return event;
  } catch (error) {
    console.error("Failed to delete event:", error);
    throw error;
  }
}
