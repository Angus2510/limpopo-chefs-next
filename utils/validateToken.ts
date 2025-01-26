// lib/utils/validateToken.ts
import jwt from "jsonwebtoken";

export function validateToken(token: string | undefined) {
  if (!token) {
    throw new Error("No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string); // Use your JWT secret here
    return decoded;
  } catch {
    throw new Error("Invalid token");
  }
}
