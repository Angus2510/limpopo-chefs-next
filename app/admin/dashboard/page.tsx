"use client";

import { useEffect, useState } from "react";
import { ContentLayout } from "@/components/layout/content-layout";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

import CalendarDemo from "@/components/features/calendar-demo";

export default function ProtectedAdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, getToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detailed authentication logging
    const checkAuthentication = async () => {
      console.group("Authentication Check");
      console.log("Initial Authentication Status:", isAuthenticated());
      console.log("Current User:", user);

      const token = getToken();
      console.log("Token Present:", !!token);

      if (token) {
        try {
          // Optional: Additional token validation if needed
          const response = await fetch("/api/validate-token", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            console.log("Server-side token validation failed");
            throw new Error("Invalid token");
          }

          console.log("Server-side token validation successful");
        } catch (error) {
          console.error("Token validation error:", error);
          // Force logout if token is invalid
          useAuthStore.getState().logout();
        }
      }

      // Final authentication check
      if (!isAuthenticated()) {
        console.log("Redirecting to login");
        router.push("/login");
      }

      setIsLoading(false);
      console.groupEnd();
    };

    checkAuthentication();
  }, [isAuthenticated, router]);

  // Loading state to prevent flickering
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Prevent rendering if not authenticated
  if (!isAuthenticated()) {
    return null;
  }

  // Render dashboard content
  return (
    <div>
      <ContentLayout title="Dashboard"></ContentLayout>
      <CalendarDemo />
    </div>
  );
}
