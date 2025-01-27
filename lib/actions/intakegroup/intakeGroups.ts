// /lib/actions/intakeGroups.ts
"use server";
import prisma from "@/lib/db";

/**
 * Fetches all intake groups.
 * @returns {Promise<Object[]>} The fetched intake groups with their IDs and titles.
 */
export async function getAllIntakeGroups() {
  try {
    return await prisma.intakegroups.findMany({
      select: {
        id: true,
        title: true,
      },
    });
  } catch (error) {
    throw new Error("Failed to fetch intake groups");
  }
}

export async function createIntakeGroup(title: string) {
  try {
    return await prisma.intakegroups.create({
      data: {
        title,
        v: 1,
      },
    });
  } catch (error) {
    throw new Error("Failed to create intake group");
  }
}

export async function updateIntakeGroup(id: string, title: string) {
  try {
    return await prisma.intakegroups.update({
      where: { id },
      data: { title },
    });
  } catch (error) {
    throw new Error("Failed to update intake group");
  }
}

export async function deleteIntakeGroup(id: string) {
  try {
    return await prisma.intakegroups.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error("Failed to delete intake group");
  }
}
