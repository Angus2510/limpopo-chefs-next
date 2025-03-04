"use server";

import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { StaffFormValues } from "@/schemas/staff/addStaffFormSchema";

interface CreateStaffData {
  formData: FormData;
  selectedRoles: string[];
}

export async function createStaff({
  formData,
  selectedRoles,
}: CreateStaffData) {
  try {
    // Generate a default password
    const staffPassword = generatePassword(12);
    const hashedStaffPassword = await bcrypt.hash(staffPassword, 10);

    // Create the staff member
    const staff = await prisma.staffs.create({
      data: {
        username: formData.get("username") as string,
        email: formData.get("email") as string,
        password: hashedStaffPassword,
        active: true,
        profile: {
          firstName: formData.get("firstName") as string,
          lastName: formData.get("lastName") as string,
          dateOfBirth: formData.get("dateOfBirth")
            ? new Date(formData.get("dateOfBirth") as string)
            : null,
          homeLanguage: formData.get("homeLanguage") as string,
          mobileNumber: formData.get("mobileNumber") as string,
          gender: formData.get("gender") as string,
          idNumber: formData.get("idNumber") as string,
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
      },
    });

    // Assign roles if any are selected
    if (selectedRoles.length > 0) {
      await prisma.userRole.createMany({
        data: selectedRoles.map((roleId) => ({
          userId: staff.id,
          roleId,
          userType: "Staff",
        })),
      });
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
      error: "Failed to create staff member",
    };
  }
}
