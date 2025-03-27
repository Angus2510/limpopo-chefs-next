"use server";

import prisma from "@/lib/db";

export interface StaffMember {
  id: string;
  email: string;
  active: boolean;
  profile: {
    firstName: string;
    lastName: string;
  };
}

export async function fetchStaffMemberById(id: string): Promise<StaffMember> {
  try {
    const staff = await prisma.staffs.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        active: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!staff) {
      throw new Error("Staff member not found");
    }

    return staff;
  } catch (error) {
    console.error("Error fetching staff member:", error);
    throw error;
  }
}
