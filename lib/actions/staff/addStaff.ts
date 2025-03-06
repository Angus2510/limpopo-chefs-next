"use server";

import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { staffFormSchema } from "@/schemas/staff/addStaffFormSchema";
import sendEmailNotification from "@/utils/emailService";
import { staffCreationTemplate } from "@/lib/email-templates/addingStaff";

export async function createStaff(data: z.infer<typeof staffFormSchema>) {
  try {
    const staffPassword = Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const hashedPassword = await bcrypt.hash(staffPassword, 10);

    const staff = await prisma.staffs.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        active: true,
        agreementAccepted: true,
        agreementAcceptedDate: new Date(),
        mustChangePassword: true,
        userType: "staff",
        createdAt: new Date(),
        updatedAt: new Date(),
        v: 0,
        profile: {
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          idNumber: data.idNumber,
          mobileNumber: data.mobileNumber,
          designation: data.designation,
          employeeId: data.employeeId,
          emergencyContact: data.emergencyContact,
          maritalStatus: data.maritalStatus,
          address: data.address,
          postalAddress: data.address,
        },
        roles: data.roles,
      },
    });

    // Send welcome email
    try {
      await sendEmailNotification(
        data.email,
        "Welcome to Limpopo Chefs Academy - Staff Account Created",
        staffCreationTemplate(data.firstName, data.username, staffPassword)
      );
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Continue even if email fails
    }

    return {
      success: true,
      staffId: staff.id,
      temporaryPassword: staffPassword,
    };
  } catch (error) {
    console.error("Error creating staff:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create staff member",
    };
  }
}
