"use server";
import prisma from "@/lib/db";

export async function deleteStaffMember(staffId: string) {
  try {
    await prisma.staffs.delete({
      where: { id: staffId },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting staff member:", error);
    return { success: false, error: "Failed to delete staff member" };
  }
}
