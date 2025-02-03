"use server";

import prisma from "@/lib/db";
import { generateResetCode } from "@/lib/actions/auth/generate-reset-code";
import bcrypt from "bcryptjs";

export async function handlePasswordResetRequest(identifier: string) {
  try {
    const userTypes = [
      { model: prisma.staffs, type: "Staff" },
      { model: prisma.students, type: "Student" },
      { model: prisma.guardians, type: "Guardian" },
    ];

    let foundUser = null;
    let userType = null;

    // Find the user by email or username
    for (const { model, type } of userTypes) {
      const user = await model.findFirst({
        where: {
          OR: [{ email: identifier }, { username: identifier }],
        },
      });

      if (user) {
        foundUser = user;
        userType = type;
        break;
      }
    }

    if (!foundUser) {
      throw new Error("User not found");
    }

    // Generate reset code and expiry time
    const resetCode = generateResetCode(); // Generates a 6-digit code
    const resetCodeExp = new Date(Date.now() + 15 * 60 * 1000); // Expires in 15 minutes

    // Determine the correct Prisma model
    const prismaModel = userTypes.find((ut) => ut.type === userType)?.model;
    if (!prismaModel) {
      throw new Error("Invalid user type");
    }

    // Save reset code to the user record
    await prismaModel.update({
      where: { id: foundUser.id },
      data: {
        resetCode,
        resetCodeExp,
      },
    });

    // Send email with reset code using your existing sendEmail API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/lib/actions/email/sendEmail`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: foundUser.email,
          emailType: "passwordReset",
          placeholders: { resetCode },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    return { success: true, userType };
  } catch (error) {
    console.error("Password reset request failed:", error);
    throw new Error("Failed to process password reset request");
  }
}

// Function to validate the reset code and update password
export async function validateResetCode(
  identifier: string,
  resetCode: string,
  newPassword: string
) {
  try {
    const userTypes = [
      { model: prisma.staffs, type: "Staff" },
      { model: prisma.students, type: "Student" },
      { model: prisma.guardians, type: "Guardian" },
    ];

    let foundUser = null;
    let userType = null;
    let prismaModel = null;

    // Find user and their type
    for (const { model, type } of userTypes) {
      const user = await model.findFirst({
        where: {
          OR: [{ email: identifier }, { username: identifier }],
        },
      });

      if (user) {
        foundUser = user;
        userType = type;
        prismaModel = model;
        break;
      }
    }

    if (!foundUser || !prismaModel) {
      throw new Error("User not found");
    }

    // Verify reset code
    if (
      !foundUser.resetCode ||
      !foundUser.resetCodeExp ||
      foundUser.resetCodeExp < new Date() ||
      foundUser.resetCode.trim() !== resetCode.trim()
    ) {
      throw new Error("Invalid or expired reset code");
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset code
    await prismaModel.update({
      where: { id: foundUser.id },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExp: null,
      },
    });

    return { success: true, userType };
  } catch (error) {
    console.error("Reset code validation failed:", error);
    throw new Error("Failed to reset password");
  }
}
