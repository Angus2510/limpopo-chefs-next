"use server";
import prisma from "@/lib/db";

export interface StaffMember {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  roles: string[]; // These are role IDs
  active: boolean;
}

export async function fetchStaffWithRoles(): Promise<StaffMember[]> {
  try {
    const staffs = await prisma.staffs.findMany({
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        roles: true,
        active: true,
      },
    });
    return staffs;
  } catch (error) {
    console.error("Error fetching staff:", error);
    return [];
  }
}
