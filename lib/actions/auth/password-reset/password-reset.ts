import prisma from "@/lib/db";
import { generateResetCode } from "@/lib/actions/auth/generate-reset-code";
import bcrypt from "bcryptjs";
import sendEmailNotification from "@/utils/emailService";
import { passwordResetTemplate } from "@/lib/email-templates/passwordReset";

export async function handlePasswordResetRequest(identifier: string) {
  console.log("🔐 Password Reset Request | Start", {
    timestamp: new Date().toISOString(),
    identifier,
  });

  try {
    const userTypes = [
      { model: prisma.staffs, type: "Staff" },
      { model: prisma.students, type: "Student" },
      { model: prisma.guardians, type: "Guardian" },
    ];

    let foundUser = null;
    let userType = null;

    // Enhanced User Search with Detailed Logging
    console.group("🔍 User Search Process");
    for (const { model, type } of userTypes) {
      console.log(`Searching ${type} Model`, { searchField: identifier });

      const user = await model.findFirst({
        where: { OR: [{ email: identifier }] },
        select: {
          id: true,
          email: true,
          // Only select necessary fields for security
        },
      });

      console.log(`Search Result for ${type}:`, {
        userFound: !!user,
        userId: user?.id,
      });

      if (user) {
        foundUser = user;
        userType = type;
        break;
      }
    }
    console.groupEnd();

    if (!foundUser) {
      console.error("❌ User not found", { identifier });
      throw new Error("User not found");
    }

    // Reset Code Generation with Enhanced Logging
    console.group("🔢 Reset Code Generation");
    const resetToken = generateResetCode(); // 6-digit code
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    console.log("Reset Parameters", {
      resetToken,
      expiryTime: resetTokenExpiry.toISOString(),
      expiryDuration: "15 minutes",
    });
    console.groupEnd();

    // Determine the correct Prisma model
    const prismaModel = userTypes.find((ut) => ut.type === userType)?.model;
    if (!prismaModel) {
      console.error("❌ Invalid user type", { userType });
      throw new Error("Invalid user type");
    }

    // Save reset code with transaction for added security
    await prisma.$transaction(async (tx) => {
      // Update user with reset token and expiry
      await prismaModel.update({
        where: { id: foundUser.id },
        data: {
          resetToken: resetToken.toString(), // Ensure string type
          resetTokenExpiry,
        },
      });

      // Send email with reset code directly using the email utility
      console.group("📧 Email Transmission");
      try {
        const emailHtml = passwordResetTemplate(resetToken);
        const subject = "Password Reset Code";

        const emailInfo = await sendEmailNotification(
          foundUser.email,
          subject,
          emailHtml
        );
        console.log("Email sent successfully", { info: emailInfo });
      } catch (emailError) {
        console.error("❌ Email Transmission Error", {
          errorMessage: (emailError as Error).message,
        });
        throw emailError;
      }
      console.groupEnd();
    });

    return {
      success: true,
      userType,
      message: "Reset code sent successfully",
    };
  } catch (error) {
    console.error("❌ Password Reset Request Failed", {
      errorMessage: (error as Error).message,
      errorStack: (error as Error).stack,
      timestamp: new Date().toISOString(),
    });
    throw new Error("Failed to process password reset request");
  }
}

export async function validateResetCode(
  identifier: string,
  resetToken: string,
  newPassword: string
) {
  console.log("🔐 Reset Code Validation | Start", {
    timestamp: new Date().toISOString(),
    identifier,
  });

  try {
    // Input Validation
    if (resetToken.length !== 6 || !/^\d{6}$/.test(resetToken)) {
      throw new Error("Invalid reset code format");
    }

    if (newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const userTypes = [
      { model: prisma.staffs, type: "Staff" },
      { model: prisma.students, type: "Student" },
      { model: prisma.guardians, type: "Guardian" },
    ];

    let foundUser = null;
    let userType = null;
    let prismaModel = null;

    // User Search Process
    console.group("🔍 User Search for Reset Validation");
    for (const { model, type } of userTypes) {
      const user = await model.findFirst({
        where: { email: identifier },
        select: {
          id: true,
          email: true,
          resetToken: true,
          resetTokenExpiry: true,
        },
      });

      console.log(`Search in ${type} Model`, {
        userFound: !!user,
        userId: user?.id,
      });

      if (user) {
        foundUser = user;
        userType = type;
        prismaModel = model;
        break;
      }
    }
    console.groupEnd();

    if (!foundUser || !prismaModel) {
      console.error("❌ User not found", { identifier });
      throw new Error("User not found");
    }

    // Reset Code Verification
    console.group("🔢 Reset Code Verification");
    const isValidResetCode =
      foundUser.resetToken === resetToken &&
      foundUser.resetTokenExpiry &&
      foundUser.resetTokenExpiry > new Date();

    console.log("Validation Checks", {
      codeMatch: foundUser.resetToken === resetToken,
      notExpired: foundUser.resetTokenExpiry > new Date(),
    });

    if (!isValidResetCode) {
      console.error("❌ Invalid or Expired Reset Code");
      throw new Error("Invalid or expired reset code");
    }
    console.groupEnd();

    // Password Update with Transaction
    await prisma.$transaction(async (tx) => {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear reset token and expiry
      await prismaModel.update({
        where: { id: foundUser.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      // Send confirmation email directly using the email utility
      console.group("📧 Password Update Confirmation");
      try {
        const confirmationSubject = "Your Password Has Been Updated";
        const confirmationHtml = `<p>Your password has been updated successfully.</p>`;
        const emailInfo = await sendEmailNotification(
          foundUser.email,
          confirmationSubject,
          confirmationHtml
        );
        console.log("Confirmation email sent successfully", {
          info: emailInfo,
        });
      } catch (emailError) {
        console.error("❌ Confirmation Email Error", {
          errorMessage: (emailError as Error).message,
        });
        throw new Error("Confirmation email failed");
      }
      console.groupEnd();
    });

    return {
      success: true,
      userType,
      message: "Password reset successful",
    };
  } catch (error) {
    console.error("❌ Password Reset Validation Failed", {
      errorMessage: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
    throw new Error("Failed to reset password");
  }
}
