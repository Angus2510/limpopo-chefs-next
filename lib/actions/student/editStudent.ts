"use server";
import prisma from "@/lib/db";
import { uploadAvatar } from "@/lib/actions/uploads/uploadAvatar";
import { revalidatePath } from "next/cache";

export async function updateStudent(formData: FormData) {
  try {
    console.log("Update student action started");
    const studentId = formData.get("id") as string;
    console.log("Updating student with ID:", studentId);

    // Handle avatar upload if present - IMPROVED ERROR HANDLING
    let avatarUrl;
    if (formData.has("avatar") && formData.get("avatar") instanceof File) {
      try {
        // More detailed logging for debugging
        const avatarFile = formData.get("avatar") as File;
        console.log(
          "Processing avatar upload:",
          avatarFile.name,
          avatarFile.size
        );

        const avatarResult = await uploadAvatar(formData);
        console.log("Avatar upload result:", avatarResult);

        if (avatarResult && avatarResult.avatarUrl) {
          avatarUrl = avatarResult.avatarUrl;
          console.log("Avatar URL set to:", avatarUrl);
        } else {
          console.error("Avatar upload succeeded but returned no URL");
        }
      } catch (avatarError) {
        console.error("Avatar upload failed:", avatarError);
        // Continue with the rest of the update even if avatar fails
      }
    }

    // Extract basic student fields
    const admissionNumber = formData.get("admissionNumber") as string;
    const email = formData.get("email") as string;
    const campus = formData.get("campus") as string;
    const intakeGroup = formData.get("intakeGroup") as string;
    const qualification = formData.get("qualification") as string;

    console.log("Basic fields:", { admissionNumber, email });

    // Extract profile data
    const profileData = {
      firstName: formData.get("firstName") as string,
      middleName: (formData.get("middleName") as string) || "",
      lastName: formData.get("lastName") as string,
      idNumber: formData.get("idNumber") as string,
      dateOfBirth: (formData.get("dateOfBirth") as string) || "",
      gender: formData.get("gender") as string,
      homeLanguage: (formData.get("homeLanguage") as string) || "",
      mobileNumber: formData.get("mobileNumber") as string,
      cityAndGuildNumber: (formData.get("cityAndGuildNumber") as string) || "",
      admissionDate: (formData.get("admissionDate") as string) || "",
    };

    console.log("Profile data:", profileData);

    // Process guardians
    const guardianIndices: Set<number> = new Set();
    for (const [key] of formData.entries()) {
      const match = key.match(/guardians\[(\d+)\]\./);
      if (match) {
        guardianIndices.add(parseInt(match[1], 10));
      }
    }

    console.log("Found guardian indices:", Array.from(guardianIndices));

    // Process each guardian
    const guardianPromises = Array.from(guardianIndices).map(async (index) => {
      const guardianId = formData.get(`guardians[${index}].id`) as string;
      const guardianData = {
        firstName: formData.get(`guardians[${index}].firstName`) as string,
        lastName: formData.get(`guardians[${index}].lastName`) as string,
        email: (formData.get(`guardians[${index}].email`) as string) || null,
        mobileNumber:
          (formData.get(`guardians[${index}].phoneNumber`) as string) || null,
        relation:
          (formData.get(`guardians[${index}].relation`) as string) || null,
      };

      console.log(`Guardian ${index} data:`, {
        id: guardianId,
        ...guardianData,
      });

      if (guardianId) {
        // Update existing guardian
        console.log(`Updating existing guardian: ${guardianId}`);
        return prisma.guardians.update({
          where: { id: guardianId },
          data: guardianData,
        });
      } else {
        // Create new guardian
        console.log("Creating new guardian");
        return prisma.guardians.create({
          data: guardianData,
        });
      }
    });

    // Process all guardian updates/creations
    console.log("Processing guardian updates/creations");
    const updatedGuardians = await Promise.all(guardianPromises);
    const guardianIds = updatedGuardians.map((guardian) => guardian.id);
    console.log("Guardian IDs after update:", guardianIds);

    // Try to update the student record directly without fetching existing student
    console.log("Updating student record");

    // First update profile and address
    console.log("Updating profile and address");
    try {
      const profileUpdateResult = await prisma.students.update({
        where: { id: studentId },
        data: {
          profile: {
            update: {
              firstName: profileData.firstName,
              middleName: profileData.middleName,
              lastName: profileData.lastName,
              idNumber: profileData.idNumber,
              gender: profileData.gender,
              homeLanguage: profileData.homeLanguage,
              mobileNumber: profileData.mobileNumber,
              cityAndGuildNumber: profileData.cityAndGuildNumber,
              dateOfBirth: profileData.dateOfBirth,
              admissionDate: profileData.admissionDate,
              address: {
                update: {
                  street1: formData.get("street1") as string,
                  street2: (formData.get("street2") as string) || "",
                  city: formData.get("city") as string,
                  province: formData.get("province") as string,
                  country: formData.get("country") as string,
                  postalCode: formData.get("postalCode") as string,
                },
              },
            },
          },
        },
      });
      console.log("Profile updated successfully");
    } catch (profileError) {
      console.error("Error updating profile:", profileError);
      throw new Error(`Failed to update profile: ${profileError.message}`);
    }

    // Then update student's basic fields
    console.log("Updating student basic fields");
    let studentUpdateResult;
    try {
      studentUpdateResult = await prisma.students.update({
        where: { id: studentId },
        data: {
          admissionNumber,
          email,
          campus: campus ? [campus] : [],
          intakeGroup: intakeGroup ? [intakeGroup] : [],
          qualification: qualification ? [qualification] : [],
          guardians: guardianIds,
          ...(avatarUrl && { avatarUrl }),
        },
      });
      console.log("Student updated successfully:", studentUpdateResult.id);
    } catch (studentError) {
      console.error("Error updating student:", studentError);
      throw new Error(`Failed to update student: ${studentError.message}`);
    }

    // Revalidate the cache for this student
    revalidatePath(`/admin/student/edit/${studentId}`);
    revalidatePath(`/admin/student/studentView/${studentId}`);
    revalidatePath("/admin/student");

    return {
      success: true,
      student: studentUpdateResult,
      message: "Student updated successfully",
    };
  } catch (error) {
    console.error("Error updating student:", error);
    return {
      success: false,
      error:
        error.message ||
        "An unexpected error occurred while updating the student",
    };
  }
}
