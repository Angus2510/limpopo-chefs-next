// app/api/validate-token/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Validate token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    return NextResponse.json({
      valid: true,
      user: {
        id: decoded.id,
        userType: decoded.userType,
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
