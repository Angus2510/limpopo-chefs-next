"use server";

import prisma from "@/lib/db";

interface UpdateStaffData {
  email: string;
  firstName: string;
  lastName: string;
  active: boolean;
}

export async function updateStaffMember(id: string, data: UpdateStaffData) {
  try {
    const updated = await prisma.staffs.update({
      where: { id },
      data: {
        email: data.email,
        active: data.active,
        profile: {
          update: {
            firstName: data.firstName,
            lastName: data.lastName,
          },
        },
      },
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating staff member:", error);
    return { success: false, error: "Failed to update staff member" };
  }
}
