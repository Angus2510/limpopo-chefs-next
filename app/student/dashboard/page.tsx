"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { ContentLayout } from "@/components/layout/content-layout";

export default function ProtectedStudentDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Move the store access inside useEffect
  const [authData, setAuthData] = useState({
    user: null,
    isAuthenticated: false,
  });

  // Handle client-side initialization
  useEffect(() => {
    setIsClient(true);
    const { user, isAuthenticated, getToken } = useAuthStore.getState();
    setAuthData({ user, isAuthenticated: isAuthenticated() });
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkAuthentication = async () => {
      const { isAuthenticated, getToken } = useAuthStore.getState();
      console.group("Student Dashboard Authentication Check");

      console.log("Initial Authentication Status:", isAuthenticated());
      console.log("Current User:", authData.user);

      const token = getToken();
      console.log("Token Present:", !!token);

      if (token) {
        try {
          const response = await fetch("/api/validate-token", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "X-User-Type": "student",
            },
          });

          if (!response.ok) {
            console.log("Server-side token validation failed");
            throw new Error("Invalid token or insufficient permissions");
          }

          console.log("Server-side token validation successful");
        } catch (error) {
          console.error("Token validation error:", error);
          useAuthStore.getState().logout();
          router.push("/login");
          return;
        }
      }

      if (!isAuthenticated()) {
        console.log("Redirecting to login");
        router.push("/login");
      } else {
        const user = useAuthStore.getState().user;
        if (user?.userType !== "Student") {
          console.log("Unauthorized user type access attempt");
          router.push("/unauthorized");
          return;
        }
      }

      setIsLoading(false);
      console.groupEnd();
    };

    checkAuthentication();
  }, [isClient, router]);

  // Show nothing during SSR
  if (!isClient) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-xl">
          Loading Student Dashboard...
        </div>
      </div>
    );
  }

  // Check authentication after client-side hydration
  if (!authData.isAuthenticated) {
    return null;
  }

  return (
    <ContentLayout title="Student Dashboard">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <p>
              Name: {authData.user?.firstName} {authData.user?.lastName}
            </p>
            <p>User Type: {authData.user?.userType}</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Courses</h2>
            <p>Enrolled Courses: Loading...</p>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
