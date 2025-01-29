// emailService.ts
import { Resend } from "resend";

const resend = new Resend(process.env["RESEND_API_KEY"]);

/**
 * Sends an email using Resend
 * @param to - Recipient's email address
 * @param subject - Email subject
 * @param body - Email body (HTML or plain text)
 */
export async function sendEmail(to: string, subject: string, body: string) {
  try {
    const response = await resend.emails.send({
      from: "no-reply@mail.limpopochefs.co.za",
      to,
      subject,
      html: body,
    });
    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Email sending failed");
  }
}
