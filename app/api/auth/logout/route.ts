import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  console.log("Logout API route called");
  const cookieStore = await cookies();

  // Clear auth cookies
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken"); // If you use refresh tokens

  // You can add any other cookies that need clearing

  return NextResponse.json(
    { success: true, message: "Logged out successfully" },
    { status: 200 }
  );
}
