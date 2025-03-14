"use server";
import prisma from "@/lib/db";

export async function toggleStudentPortal(studentId: string, enabled: boolean) {
  try {
    await prisma.students.update({
      where: { id: studentId },
      data: {
        inactiveReason: enabled ? null : "Portal access disabled",
      },
    });
    return true;
  } catch (error) {
    console.error("Error toggling student portal access:", error);
    throw new Error("Failed to toggle portal access");
  }
}
