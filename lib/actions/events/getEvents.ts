"use server";

import prisma from "@/lib/db";

// READ
export async function getEvents() {
  console.log("🔍 Starting getEvents");
  try {
    // Add logging to check Prisma connection
    console.log("📡 Checking Prisma connection");
    if (!prisma) {
      console.error("❌ Prisma client is not initialized");
      return [];
    }

    // Try to get events with explicit select
    const rawEvents = await prisma.events.findMany({
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

    console.log("📦 Raw events data:", JSON.stringify(rawEvents, null, 2));

    if (!Array.isArray(rawEvents)) {
      console.error("❌ Events is not an array:", rawEvents);
      return [];
    }

    // Safe serialization
    const events = rawEvents
      .map((event) => {
        try {
          return {
            ...event,
            startDate:
              event.startDate instanceof Date
                ? event.startDate.toISOString()
                : new Date(event.startDate).toISOString(),
            endDate: event.endDate
              ? event.endDate instanceof Date
                ? event.endDate.toISOString()
                : new Date(event.endDate).toISOString()
              : null,
          };
        } catch (err) {
          console.error("❌ Error processing event:", event.id, err);
          return null;
        }
      })
      .filter(Boolean); // Remove any failed conversions

    console.log("✅ Successfully processed events:", events.length);
    return events;
  } catch (error) {
    console.error("❌ Error in getEvents:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return [];
  }
}

// CREATE
export async function createEvent(data: any) {
  console.log("📝 Creating event:", data);
  try {
    const event = await prisma.events.create({
      data: {
        title: data.title,
        details: data.details || "",
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        color: data.color || "other",
        location: [],
        assignedTo: [],
        assignedToModel: data.assignedToModel || [],
        createdBy: "000000000000000000000000",
        v: 1,
        allDay: false,
      },
    });

    console.log("✅ Created event:", event.id);
    return {
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate ? event.endDate.toISOString() : null,
    };
  } catch (error) {
    console.error("❌ Error creating event:", error);
    throw error;
  }
}

// UPDATE
export async function updateEvent(id: string, data: any) {
  console.log("📝 Attempting to update event:", { id, data });
  try {
    const event = await prisma.events.update({
      where: { id },
      data: {
        title: data.title,
        details: data.details || "",
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        color: data.color || "other",
        assignedToModel: data.assignedToModel || [],
      },
      // Explicitly select all fields
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

    console.log("✅ Successfully updated event:", event.id);
    return {
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate ? event.endDate.toISOString() : null,
    };
  } catch (error) {
    console.error("❌ Error updating event:", error);
    throw error;
  }
}

// DELETE
export async function deleteEvent(id: string) {
  console.log("🗑️ Attempting to delete event:", id);
  try {
    const deletedEvent = await prisma.events.delete({
      where: { id },
      select: { id: true }, // Only select what we need
    });
    console.log("✅ Successfully deleted event:", id);
    return { success: true, id: deletedEvent.id };
  } catch (error) {
    console.error("❌ Error deleting event:", error);
    return { success: false, id };
  }
}
