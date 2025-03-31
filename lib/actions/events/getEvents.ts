"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getEvents() {
  console.log("🔍 Getting all events...");
  try {
    const events = await prisma.events.findMany({
      orderBy: [{ startDate: "asc" }, { startTime: "asc" }],
    });
    console.log("✅ Found events:", events.length);
    return events;
  } catch (error) {
    console.error("❌ Failed to fetch events:", error);
    return [];
  }
}

export async function createEvent(data: any) {
  console.log("📝 Creating event with data:", data);
  try {
    const event = await prisma.events.create({
      data: {
        title: data.title,
        details: data.details || "",
        startDate: new Date(data.startDate), // Use the provided date
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
    console.log("✅ Event created:", event);
    revalidatePath("/admin/dashboard");
    return event;
  } catch (error) {
    console.error("❌ Failed to create event:", error);
    throw error;
  }
}

export async function updateEvent(id: string, data: any) {
  console.log("📝 Updating event:", id, "with data:", data);
  try {
    // Remove startDate from the update if it's the same as the existing event
    const { startDate, ...updateData } = data;

    const event = await prisma.events.update({
      where: { id },
      data: updateData, // Only update the non-date fields
    });

    console.log("✅ Event updated:", event);
    revalidatePath("/admin/dashboard");
    return event;
  } catch (error) {
    console.error("❌ Failed to update event:", error);
    throw error;
  }
}
export async function deleteEvent(id: string) {
  console.log("🗑️ Attempting to delete event:", id);
  try {
    const event = await prisma.events.delete({
      where: { id },
    });
    console.log("✅ Event deleted:", event);
    revalidatePath("/admin/dashboard");
    return { success: true, data: event };
  } catch (error) {
    console.error("❌ Delete failed:", error);
    return { success: false, error: "Failed to delete event" };
  }
}
