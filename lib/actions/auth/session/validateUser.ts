"use server";

import * as jose from "jose";

const secretKey = new TextEncoder().encode(
  process.env.SECRET_KEY || "your-secret-key"
);

export async function validateSession(accessToken: string) {
  console.log("Starting validateSession function");

  try {
    if (!accessToken) {
      console.log("No access token provided.");
      return { valid: false, refreshRequired: true };
    }

    console.log("Access token provided. Verifying access token.");

    // Verify and decode the access token
    const { payload } = await jose.jwtVerify(accessToken, secretKey);

    const {
      session: { sessionId, userType, userId },
    } = payload as {
      session: { sessionId: string; userType: string; userId: string };
    };

    console.log("Access token verified. Returning session data.");

    return {
      valid: true,
      userType,
      userId,
      sessionId,
    };
  } catch (error) {
    console.error("Error validating session:", (error as Error).message);
    return {
      valid: false,
      refreshRequired: (error as Error).message === "Session expired",
    };
  }
}
