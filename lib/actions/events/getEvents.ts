"use server";
import prisma from "@/lib/db";

export async function getEvents() {
  try {
    return await prisma.events.findMany({
      orderBy: {
        startDate: "asc",
      },
    });
  } catch (error) {
    throw new Error("Failed to fetch events");
  }
}

export async function createEvent(data: {
  title: string;
  details: string;
  startDate: Date;
  endDate?: Date;
  color: string;
  location: string[];
  assignedTo: string[];
  assignedToModel: string[];
  createdBy: string;
}) {
  try {
    return await prisma.events.create({
      data: {
        ...data,
        v: 1,
      },
    });
  } catch (error) {
    throw new Error("Failed to create event");
  }
}

export async function updateEvent(
  id: string,
  data: Partial<{
    title: string;
    details: string;
    startDate: Date;
    endDate: Date;
    color: string;
    location: string[];
    assignedTo: string[];
    assignedToModel: string[];
  }>
) {
  try {
    return await prisma.events.update({
      where: { id },
      data,
    });
  } catch (error) {
    throw new Error("Failed to update event");
  }
}

export async function deleteEvent(id: string) {
  try {
    return await prisma.events.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error("Failed to delete event");
  }
}
