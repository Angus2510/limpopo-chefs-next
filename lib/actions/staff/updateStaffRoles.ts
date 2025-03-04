"use server";
import prisma from "@/lib/db";

export async function updateStaffRoles(staffId: string, roles: string[]) {
  try {
    await prisma.staffs.update({
      where: { id: staffId },
      data: { roles },
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating staff roles:", error);
    return { success: false, error: "Failed to update roles" };
  }
}
