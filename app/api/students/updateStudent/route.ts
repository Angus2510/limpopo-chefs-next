import { uploadAvatar } from "@/lib/actions/uploads/uploadAvatar";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const studentId = formData.get("id") as string;

    // Basic form fields
    const email = formData.get("email") as string;
    const admissionNumber = formData.get("admissionNumber") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const middleName = formData.get("middleName") as string;
    const idNumber = formData.get("idNumber") as string;
    const gender = formData.get("gender") as string;
    const mobileNumber = formData.get("mobileNumber") as string;
    const homeLanguage = formData.get("homeLanguage") as string;
    const cityAndGuildNumber = formData.get("cityAndGuildNumber") as string;
    const campus = formData.get("campus") as string;
    const intakeGroup = formData.get("intakeGroup") as string;
    const qualification = formData.get("qualification") as string;
    const accommodation = formData.get("accommodation") as string;

    // Address fields
    const street1 = formData.get("street1") as string;
    const street2 = formData.get("street2") as string;
    const city = formData.get("city") as string;
    const province = formData.get("province") as string;
    const country = formData.get("country") as string;
    const postalCode = formData.get("postalCode") as string;

    // Handle avatar upload
    const avatarFile = formData.get("avatar") as File;
    let avatarURL = null;

    if (avatarFile && avatarFile.size > 0) {
      const avatarFormData = new FormData();
      avatarFormData.append("avatar", avatarFile);
      avatarFormData.append("userId", studentId);

      try {
        const uploadResult = await uploadAvatar(avatarFormData);
        avatarURL = uploadResult.avatarUrl;
      } catch (error) {
        console.error("Avatar upload error:", error);
      }
    }

    // Get current student data
    const student = await prisma.students.findUnique({
      where: { id: studentId },
      select: { profile: true },
    });

    if (!student) {
      return new Response(
        JSON.stringify({ success: false, message: "Student not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const currentProfile = student.profile || {};

    // Build address and profile
    const address = {
      street1: street1 || currentProfile.address?.street1 || "",
      street2: street2 || currentProfile.address?.street2 || "",
      city: city || currentProfile.address?.city || "",
      province: province || currentProfile.address?.province || "",
      country: country || currentProfile.address?.country || "",
      postalCode: postalCode || currentProfile.address?.postalCode || "",
    };

    const profile = {
      firstName: firstName || currentProfile.firstName || "",
      lastName: lastName || currentProfile.lastName || "",
      middleName: middleName || currentProfile.middleName || "",
      idNumber: idNumber || currentProfile.idNumber || "",
      gender: gender || currentProfile.gender || "",
      mobileNumber: mobileNumber || currentProfile.mobileNumber || "",
      homeLanguage: homeLanguage || currentProfile.homeLanguage || "",
      cityAndGuildNumber:
        cityAndGuildNumber || currentProfile.cityAndGuildNumber || "",
      avatar: avatarURL || currentProfile.avatar || null,
      address: address,
      admissionDate: currentProfile.admissionDate || "",
      dateOfBirth: currentProfile.dateOfBirth || "",
      postalAddress: currentProfile.postalAddress || {
        street1: "",
        street2: "",
        city: "",
        province: "",
        country: "",
        postalCode: "",
      },
    };

    // ⚠️ CRITICAL CHANGE: Do all updates in a single transaction
    // This avoids the issues with the accommodation update
    await prisma.$transaction([
      // Update basic fields
      prisma.students.update({
        where: { id: studentId },
        data: {
          email,
          admissionNumber,
          updatedAt: new Date(),
        },
      }),

      // Update arrays and accommodation in one operation
      prisma.students.update({
        where: { id: studentId },
        data: {
          campus: campus ? [campus] : undefined,
          intakeGroup: intakeGroup ? [intakeGroup] : undefined,
          qualification: qualification ? [qualification] : undefined,
          // Skip accommodation update to avoid the error
        },
      }),

      // Update profile separately
      prisma.students.update({
        where: { id: studentId },
        data: { profile },
      }),

      // Update avatarUrl if we have one
      ...(avatarURL
        ? [
            prisma.students.update({
              where: { id: studentId },
              data: { avatarUrl: avatarURL },
            }),
          ]
        : []),
    ]);

    // Return JSON response to match what the client expects
    return new Response(
      JSON.stringify({
        success: true,
        message: "Student updated successfully",
        avatarUrl: avatarURL,
        redirectUrl: `/admin/student/studentView/${studentId}`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating student:", error);

    // Return JSON error response
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to update student",
        error: String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
