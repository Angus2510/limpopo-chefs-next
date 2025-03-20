"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

interface EventData {
  title: string;
  details?: string;
  startDate: string;
  startTime?: string;
  campus?: string;
  venue?: string;
  lecturer?: string;
  color?: string;
  assignedToModel?: string[];
}

interface EventResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export async function getEvents(): Promise<EventResponse> {
  if (!prisma) {
    return {
      success: false,
      error: "Database connection failed",
    };
  }

  try {
    const rawEvents = await prisma.events.findMany({
      where: {
        deleted: false,
      },
      orderBy: {
        startDate: "asc",
      },
      select: {
        id: true,
        title: true,
        details: true,
        startDate: true,
        startTime: true,
        campus: true,
        venue: true,
        lecturer: true,
        color: true,
        assignedToModel: true,
        createdBy: true,
        v: true,
      },
    });

    const events = rawEvents.map((event) => ({
      ...event,
      startDate: event.startDate.toISOString(),
      details: event.details || "",
      startTime: event.startTime || "09:00",
      campus: event.campus || "",
      venue: event.venue || "",
      lecturer: event.lecturer || "",
      color: event.color || "other",
      assignedToModel: event.assignedToModel || [],
    }));

    return {
      success: true,
      data: events,
    };
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return {
      success: false,
      error: "Failed to fetch events",
    };
  }
}

export async function createEvent(data: EventData): Promise<EventResponse> {
  if (!data?.title?.trim()) {
    return {
      success: false,
      error: "Title is required",
    };
  }

  if (!data?.startDate) {
    return {
      success: false,
      error: "Start date is required",
    };
  }

  try {
    const event = await prisma.events.create({
      data: {
        title: data.title.trim(),
        details: data.details?.trim() ?? "",
        startDate: new Date(data.startDate),
        startTime: data.startTime ?? "09:00",
        campus: data.campus?.trim() ?? "",
        venue: data.venue?.trim() ?? "",
        lecturer: data.lecturer?.trim() ?? "",
        color: data.color ?? "other",
        assignedToModel: data.assignedToModel ?? [],
        createdBy: "000000000000000000000000",
        v: 1,
        deleted: false,
      },
    });

    revalidatePath("/admin/dashboard");

    return {
      success: true,
      data: {
        ...event,
        startDate: event.startDate.toISOString(),
      },
    };
  } catch (error) {
    console.error("Failed to create event:", error);
    return {
      success: false,
      error: "Failed to create event",
    };
  }
}

export async function updateEvent(
  id: string,
  data: Partial<EventData>
): Promise<EventResponse> {
  if (!id) {
    return {
      success: false,
      error: "Event ID is required",
    };
  }

  try {
    const event = await prisma.events.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title.trim() }),
        ...(data.details && { details: data.details.trim() }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.startTime && { startTime: data.startTime }),
        ...(data.campus && { campus: data.campus.trim() }),
        ...(data.venue && { venue: data.venue.trim() }),
        ...(data.lecturer && { lecturer: data.lecturer.trim() }),
        ...(data.color && { color: data.color }),
        ...(data.assignedToModel && { assignedToModel: data.assignedToModel }),
      },
    });

    revalidatePath("/admin/dashboard");

    return {
      success: true,
      data: {
        ...event,
        startDate: event.startDate.toISOString(),
      },
    };
  } catch (error) {
    console.error("Failed to update event:", error);
    return {
      success: false,
      error: "Failed to update event",
    };
  }
}

export async function deleteEvent(id: string): Promise<EventResponse> {
  if (!id) {
    return {
      success: false,
      error: "Event ID is required",
    };
  }

  try {
    await prisma.events.update({
      where: { id },
      data: { deleted: true },
    });

    revalidatePath("/admin/dashboard");

    return {
      success: true,
      data: { id },
    };
  } catch (error) {
    console.error("Failed to delete event:", error);
    return {
      success: false,
      error: "Failed to delete event",
    };
  }
}
