"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export type AttendanceQRCode = {
  id: string;
  data: {
    campusId: string;
    campusTitle: string;
    intakeGroups: Array<{
      id: string;
      title: string;
    }>;
    outcome: {
      id: string;
      title: string;
    };
    date: string;
    timestamp: string;
  };
  createdAt: string;
};

export async function createAttendanceQR(
  data: Omit<AttendanceQRCode, "id" | "createdAt">
) {
  try {
    const qrCode = await prisma.QrAttendance.create({
      data: {
        data: data.data,
        campusId: data.data.campusId,
        outcomeId: data.data.outcome.id,
        date: new Date(data.data.date),
      },
    });

    revalidatePath("/admin/attendance/qr");
    return { success: true, data: qrCode };
  } catch (error) {
    console.error("Failed to create QR code:", error);
    return { success: false, error: "Failed to create QR code" };
  }
}

export async function getAttendanceQRs() {
  try {
    const qrCodes = await prisma.QrAttendance.findMany({
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: qrCodes };
  } catch (error) {
    console.error("Failed to fetch QR codes:", error);
    return { success: false, error: "Failed to fetch QR codes" };
  }
}

export async function deleteAttendanceQR(id: string) {
  try {
    await prisma.QrAttendance.delete({
      where: { id },
    });

    revalidatePath("/admin/attendance/qr");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete QR code:", error);
    return { success: false, error: "Failed to delete QR code" };
  }
}
