"use server";

import prisma from "@/lib/db";

interface EventData {
  title: string;
  details?: string;
  startDate: string;
  endDate?: string | null;
  color?: string;
  assignedToModel?: string[];
}

export async function getEvents() {
  if (!prisma) {
    console.error("❌ No Prisma client");
    return [];
  }

  try {
    const rawEvents = await prisma.events.findMany({
      where: { v: 1 },
      select: {
        id: true,
        title: true,
        details: true,
        startDate: true,
        endDate: true,
        color: true,
        location: true,
        assignedTo: true,
        assignedToModel: true,
        createdBy: true,
        v: true,
        allDay: true,
      },
    });

    if (!Array.isArray(rawEvents)) return [];

    return rawEvents.map((event) => ({
      ...event,
      startDate: new Date(event.startDate).toISOString(),
      endDate: event.endDate ? new Date(event.endDate).toISOString() : null,
    }));
  } catch (error) {
    console.error("❌ Error:", error);
    return [];
  }
}

export async function createEvent(data: EventData) {
  try {
    const event = await prisma.events.create({
      data: {
        title: data.title,
        details: data.details ?? "",
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        color: data.color ?? "other",
        location: [],
        assignedTo: [],
        assignedToModel: data.assignedToModel ?? [],
        createdBy: "000000000000000000000000",
        v: 1,
        allDay: false,
      },
    });

    return {
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate?.toISOString() ?? null,
    };
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
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
        ...(data.assignedToModel && { assignedToModel: data.assignedToModel }),
      },
      select: {
        id: true,
        title: true,
        details: true,
        startDate: true,
        endDate: true,
        color: true,
        location: true,
        assignedTo: true,
        assignedToModel: true,
        createdBy: true,
        v: true,
        allDay: true,
      },
    });

    return {
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate?.toISOString() ?? null,
    };
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

export async function deleteEvent(id: string) {
  try {
    const { id: deletedId } = await prisma.events.delete({
      where: { id },
      select: { id: true },
    });
    return { success: true, id: deletedId };
  } catch (error) {
    console.error("❌ Error:", error);
    return { success: false, id };
  }
}
