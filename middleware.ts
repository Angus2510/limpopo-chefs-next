// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string | number;
  userType: string;
  exp: number;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const currentPath = request.nextUrl.pathname;

  // Define protected route patterns
  const protectedRoutes = ["/dashboard", "/student", "/staff", "/guardian"];

  // Debug logs
  console.log("Middleware Check:", {
    path: currentPath,
    hasToken: !!token,
  });

  // Check if current path starts with any protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    currentPath.startsWith(route)
  );

  if (isProtectedRoute) {
    // No token present
    if (!token) {
      console.log("No token found, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Decode and validate token
      const decoded = jwtDecode<DecodedToken>(token);
      console.log("Decoded token:", {
        userType: decoded.userType,
        expiration: new Date(decoded.exp * 1000),
      });

      // Check token expiration
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        console.log("Token expired");

        // Clear the expired token
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("accessToken");
        return response;
      }

      // Role-based access control
      const userType = decoded.userType;
      const userPath = `/${userType.toLowerCase()}`;

      console.log("Access Check:", {
        currentPath,
        userType,
        userPath,
      });

      // Direct route match - user accessing their own dashboard
      if (currentPath.startsWith(userPath)) {
        return NextResponse.next();
      }

      // Handle general dashboard access if needed
      if (currentPath === "/dashboard") {
        // Optionally redirect to type-specific dashboard
        return NextResponse.redirect(
          new URL(`${userPath}/dashboard`, request.url)
        );
      }

      // User trying to access wrong dashboard type
      if (protectedRoutes.some((route) => currentPath.startsWith(route))) {
        console.log("Unauthorized access attempt");
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      return NextResponse.next();
    } catch (error) {
      // Invalid token
      console.error("Token validation error:", error);

      // Clear the invalid token
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("accessToken");
      return response;
    }
  }

  return NextResponse.next();
}

// Specify which routes middleware applies to
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/student/:path*",
    "/staff/:path*",
    "/guardian/:path*",
  ],
};
