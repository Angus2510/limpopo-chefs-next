// app/hooks/useAutoLogout.tsx
"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { useToast } from "@/components/ui/use-toast";

interface AutoLogoutOptions {
  timeoutDuration?: number; // Total time until logout (default: 10 minutes)
  warningTime?: number; // Time before logout to show warning (default: 1 minute)
  warningDuration?: number; // How long to show the warning toast (default: 10 seconds)
}

export function useAutoLogout({
  timeoutDuration = 10 * 60 * 1000, // 10 minutes
  warningTime = 60 * 1000, // 1 minute
  warningDuration = 10000, // 10 seconds
}: AutoLogoutOptions = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const { logout, isAuthenticated } = useAuthStore();

  // Use refs to maintain timer references across renders
  const logoutTimerRef = useRef<NodeJS.Timeout>();
  const warningTimerRef = useRef<NodeJS.Timeout>();

  // Cleanup function to clear all timers
  const clearTimers = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
  }, []);

  // Handle the actual logout process
  const handleLogout = useCallback(() => {
    if (isAuthenticated()) {
      console.log("Auto-logout triggered due to inactivity");
      clearTimers();
      logout();
      router.push("/login");
      router.refresh();
      toast({
        title: "Session Expired",
        description: "You have been logged out due to inactivity",
        variant: "destructive",
      });
    }
  }, [logout, router, isAuthenticated, toast, clearTimers]);

  // Reset both warning and logout timers
  const resetTimers = useCallback(() => {
    clearTimers();

    // Set warning timer
    warningTimerRef.current = setTimeout(() => {
      toast({
        title: "Session Expiring Soon",
        description:
          "Your session will expire in 1 minute due to inactivity. Click to stay logged in.",
        duration: warningDuration,
        action: {
          label: "Stay Logged In",
          onClick: () => resetTimers(), // Reset timers when user clicks to stay
        },
      });
    }, timeoutDuration - warningTime);

    // Set logout timer
    logoutTimerRef.current = setTimeout(handleLogout, timeoutDuration);
  }, [
    timeoutDuration,
    warningTime,
    warningDuration,
    handleLogout,
    clearTimers,
    toast,
  ]);

  useEffect(() => {
    // Only set up timers if user is authenticated
    if (!isAuthenticated()) return;

    // Define activity events to monitor
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "keydown",
    ];

    // Add event listeners and start initial timers
    activityEvents.forEach((eventName) => {
      document.addEventListener(eventName, resetTimers, true);
    });
    resetTimers();

    // Cleanup function
    return () => {
      clearTimers();
      activityEvents.forEach((eventName) => {
        document.removeEventListener(eventName, resetTimers, true);
      });
    };
  }, [isAuthenticated, resetTimers, clearTimers]);
}
