// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  // Define protected route patterns
  const protectedRoutes = ["/dashboard", "/student", "/staff", "/guardian"];

  const currentPath = request.nextUrl.pathname;

  // Check if current path starts with any protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    currentPath.startsWith(route)
  );

  if (isProtectedRoute) {
    // No token present
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Decode and validate token
      const decoded = jwtDecode(token);

      // Check token expiration
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Optional: Add role-based access control
      const userType = decoded.userType;
      const isAuthorized = protectedRoutes.some(
        (route) =>
          currentPath.startsWith(route) &&
          currentPath.includes(userType.toLowerCase())
      );

      if (!isAuthorized) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      return NextResponse.next();
    } catch {
      // Invalid token
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/student/:path*",
    "/staff/:path*",
    "/guardian/:path*",
  ],
};
