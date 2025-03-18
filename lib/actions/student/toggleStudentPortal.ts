"use server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleStudentPortal(studentId: string, enabled: boolean) {
  try {
    // Update both the inactiveReason and active fields
    await prisma.students.update({
      where: { id: studentId },
      data: {
        inactiveReason: enabled ? null : "Portal access disabled",
        active: enabled, // Also set the active field explicitly
      },
    });

    // Revalidate the student data
    revalidatePath(`/admin/finance/payable`);
    revalidatePath(`/admin/finance/student-balance/${studentId}`);

    return true;
  } catch (error) {
    console.error("Error toggling student portal access:", error);
    throw new Error("Failed to toggle portal access");
  }
}
