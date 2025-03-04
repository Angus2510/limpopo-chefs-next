"use server";

import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

const generatePassword = (length: number) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export async function createStaff(formData: FormData) {
  try {
    // Log form data for debugging
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    // Extract and validate roles
    const roles = Array.from(formData.entries())
      .filter(([key]) => key.startsWith("roles["))
      .map(([_, value]) => value as string);

    // Generate a default password
    const staffPassword = generatePassword(12);
    const hashedStaffPassword = await bcrypt.hash(staffPassword, 10);

    // Prepare staff data
    const staffData = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: hashedStaffPassword,
      profile: {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        dateOfBirth: formData.get("dateOfBirth")
          ? new Date(formData.get("dateOfBirth") as string).toISOString()
          : null,
        homeLanguage: formData.get("homeLanguage ") as string,
        mobileNumber: formData.get("mobileNumber") as string,
        gender: formData.get("gender") as string,
        idNumber: formData.get("idNumber ") as string,
        position: formData.get("position") as string,
        department: formData.get("department") as string,
        designation: formData.get("designation") as string,
        address: {
          street1: formData.get("address.street1") as string,
          street2: (formData.get("address.street2") as string) || "",
          city: formData.get("address.city") as string,
          province: formData.get("address.province") as string,
          country: formData.get("address.country") as string,
          postalCode: formData.get("address.postalCode") as string,
        },
      },
    };

    // Create the staff record
    const staff = await prisma.staffs.create({
      data: staffData,
    });

    // Create or update the UserRole record
    await prisma.userRole.create({
      data: {
        userId: staff.id,
        roleIds: roles,
        userType: "Staff",
      },
    });

    console.log("Staff created and roles assigned:", staff);
    return staff;
  } catch (error) {
    console.error("Error creating staff or assigning roles:", error);
    throw new Error("Failed to create staff and assign roles");
  }
}
