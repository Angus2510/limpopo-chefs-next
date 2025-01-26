"use server";

import prisma from "@/lib/db";
import { cookies } from "next/headers";

export async function logout() {
  // Get the refresh token from the cookies
  const refreshToken = cookies().get("refreshToken")?.value;

  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  // Find the session associated with this refresh token
  const session = await prisma.session.findUnique({
    where: { token: refreshToken },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  // Invalidate the session (you can delete it or mark it as inactive)
  await prisma.session.delete({
    where: { token: refreshToken },
  });

  // Clear the refresh token cookie
  cookies().set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: -1, // Expire the cookie immediately
  });

  return { success: true };
}
