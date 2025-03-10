"use server";

import prisma from "@/lib/db";

interface EventData {
  title: string;
  details: string;
  startDate: Date;
  endDate?: Date | null;
  color: string;
  location: string[];
  assignedTo: string[];
  assignedToModel: string[];
  createdBy: string;
}

export async function getEvents() {
  try {
    const events = await prisma.events.findMany({
      orderBy: {
        startDate: "asc",
      },
    });
    return events;
  } catch (error) {
    console.error("Failed to fetch events");
    return [];
  }
}

export async function createEvent(data: EventData) {
  try {
    const event = await prisma.events.create({
      data: {
        title: data.title,
        details: data.details || "",
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        color: data.color || "other",
        location: data.location || [],
        assignedTo: data.assignedTo || [],
        assignedToModel: data.assignedToModel || [],
        createdBy: "000000000000000000000000", // Default ObjectId
        v: 1,
        allDay: false,
      },
    });
    return event;
  } catch (error) {
    console.error("Failed to create event");
    throw new Error("Failed to create event");
  }
}

export async function updateEvent(id: string, data: Partial<EventData>) {
  try {
    const event = await prisma.events.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.details && { details: data.details }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.color && { color: data.color }),
        ...(data.location && { location: data.location }),
        ...(data.assignedTo && { assignedTo: data.assignedTo }),
        ...(data.assignedToModel && { assignedToModel: data.assignedToModel }),
      },
    });
    return event;
  } catch (error) {
    console.error("Failed to update event");
    throw new Error("Failed to update event");
  }
}

export async function deleteEvent(id: string) {
  try {
    await prisma.events.delete({
      where: { id },
    });
    return { success: true, id };
  } catch (error) {
    console.error("Failed to delete event");
    throw new Error("Failed to delete event");
  }
}
