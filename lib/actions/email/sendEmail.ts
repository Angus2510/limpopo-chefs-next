import { NextResponse } from "next/server";
import sendEmailNotification from "@/utils/emailService"; // Import Nodemailer function
import { studentCreationTemplate } from "@/lib/email-templates/addingStudent"; // Import template

export async function POST(request: Request) {
  const { email, emailType, placeholders } = await request.json();

  if (!email || !emailType || !placeholders) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  let emailHtml = "";
  let subject = "";

  // Map email types to templates
  switch (emailType) {
    case "studentCreation":
      emailHtml = studentCreationTemplate(
        placeholders.studentName,
        placeholders.username,
        placeholders.password
      );
      subject = "Your Student Account is Ready!";
      break;
    default:
      return NextResponse.json(
        { message: "Invalid email type" },
        { status: 400 }
      );
  }

  try {
    const info = await sendEmailNotification(email, subject, emailHtml);
    return NextResponse.json({ message: "Email sent successfully", info });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Failed to send email", error: errorMessage },
      { status: 500 }
    );
  }
}
