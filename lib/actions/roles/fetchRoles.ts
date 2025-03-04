"use server";
import prisma from "@/lib/db";

export interface Role {
  id: string;
  roleName: string;
  description: string;
}

export async function fetchRoles(): Promise<Role[]> {
  try {
    const roles = await prisma.roles.findMany({
      select: {
        id: true,
        roleName: true,
        description: true,
      },
    });
    return roles;
  } catch (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
}
