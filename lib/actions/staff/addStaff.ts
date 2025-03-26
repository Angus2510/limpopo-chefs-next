"use server";

import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { staffFormSchema } from "@/schemas/staff/addStaffFormSchema";

export async function createStaff(data: z.infer<typeof staffFormSchema>) {
  try {
    // Check if email already exists
    const existingStaff = await prisma.staffs.findFirst({
      where: {
        email: data.email,
      },
    });

    if (existingStaff) {
      return {
        success: false,
        error: "A staff member with this email already exists",
      };
    }

    // Generate random password
    const staffPassword = Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const hashedPassword = await bcrypt.hash(staffPassword, 10);

    // Create staff member
    const staff = await prisma.staffs.create({
      data: {
        v: 0,
        active: true,
        agreementAccepted: true,
        agreementAcceptedDate: new Date(),
        createdAt: new Date(),
        email: data.email,
        mustChangePassword: true,
        password: hashedPassword,
        profile: {
          firstName: data.firstName,
          lastName: data.lastName || "",
        },
        roles: data.roles,
        updatedAt: new Date(),
        userPermissions: [],
        userType: "staff",
        username: data.username,
      },
    });

    return {
      success: true,
      staffId: staff.id,
      temporaryPassword: staffPassword,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create staff member",
    };
  }
}
