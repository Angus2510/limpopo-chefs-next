// app/hooks/useAutoLogout.tsx
"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

export function useAutoLogout(timeoutDuration = 10 * 60 * 1000) {
  // 10 minutes default
  const router = useRouter();
  const { logout, isAuthenticated } = useAuthStore();

  const handleLogout = useCallback(() => {
    if (isAuthenticated()) {
      console.log("Auto-logout triggered due to inactivity");
      logout();
      router.push("/login");
      router.refresh();
    }
  }, [logout, router, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated()) return;

    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(handleLogout, timeoutDuration);
    };

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "keydown",
    ];

    // Add event listeners
    activityEvents.forEach((eventName) => {
      document.addEventListener(eventName, resetInactivityTimer, true);
    });

    // Initialize the timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      clearTimeout(inactivityTimer);
      activityEvents.forEach((eventName) => {
        document.removeEventListener(eventName, resetInactivityTimer, true);
      });
    };
  }, [timeoutDuration, handleLogout, isAuthenticated]);
}
