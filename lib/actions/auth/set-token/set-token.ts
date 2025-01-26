"use server";

import { cookies } from "next/headers";

export async function setToken(accessToken: string) {
  const cookieStore = await cookies();
  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1 * 60, // 15 minutes
    path: "/",
    sameSite: "lax",
  });

  return { success: true };
}
