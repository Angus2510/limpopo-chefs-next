// app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import {
  handlePasswordResetRequest,
  validateResetCode,
} from "@/lib/actions/auth/password-reset/password-reset";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, resetCode, newPassword } = body;

    // Handle different actions based on the request type
    if (action === "request") {
      const result = await handlePasswordResetRequest(email);
      return NextResponse.json(result);
    } else if (action === "reset") {
      const result = await validateResetCode(email, resetCode, newPassword);
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { message: "Invalid action type" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Password reset error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Password reset failed";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
