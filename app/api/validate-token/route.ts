import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env["JWT_SECRET"]!) as {
      id: string;
      userType: string;
    };

    return NextResponse.json({
      valid: true,
      user: {
        id: decoded.id,
        userType: decoded.userType,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// Add GET method support for convenience
export async function GET(request: Request) {
  return POST(request);
}
