import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { NextResponse } from "next/server";

interface TokenPayload {
  id: string;
  userType: string;
  exp: number;
}

// Simplified handler function
async function validateToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json(
      { authenticated: false, reason: "no-token" },
      { status: 401 }
    );
  }

  try {
    // Just validate the token
    const decoded = jwtDecode<TokenPayload>(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      return NextResponse.json(
        { authenticated: false, reason: "expired" },
        { status: 401 }
      );
    }

    // Update activity timestamp
    cookieStore.set("lastActivity", Date.now().toString());

    // Return basic data without trying to fetch user details
    return NextResponse.json(
      {
        authenticated: true,
        token,
        user: { id: decoded.id, userType: decoded.userType },
        tokenExpiresIn: Math.round(decoded.exp - currentTime),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { authenticated: false, reason: "invalid" },
      { status: 401 }
    );
  }
}

// Export both handlers
export const GET = validateToken;
export const POST = validateToken;
