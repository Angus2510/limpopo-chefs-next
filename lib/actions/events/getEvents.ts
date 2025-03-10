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
    console.log("Fetching events...");

    // Add error handling for prisma connection
    if (!prisma) {
      console.error("Prisma client is not initialized");
      return [];
    }

    const events = await prisma.events.findMany({
      orderBy: {
        startDate: "asc",
      },
      // Add select to explicitly define what we want to fetch
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

    console.log(`Successfully fetched ${events.length} events`);

    // Transform dates to ensure they're properly serialized
    const serializedEvents = events.map((event) => ({
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate ? event.endDate.toISOString() : null,
    }));

    return serializedEvents;
  } catch (error) {
    // More detailed error logging
    console.error("Failed to fetch events:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }
    return [];
  }
}

export async function createEvent(data: EventData) {
  try {
    console.log("Creating event with data:", {
      title: data.title,
      startDate: data.startDate,
      color: data.color,
      assignedToModelCount: data.assignedToModel?.length,
    });

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

    console.log("Event created successfully:", event.id);
    return event;
  } catch (error) {
    console.error("Failed to create event:", error);
    throw new Error("Failed to create event");
  }
}

// Update the calendar component to handle the serialized dates:
