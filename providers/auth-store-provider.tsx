"use client";

import { useEffect } from "react";
import useAuthStore from "@/store/authStore";
import { jwtDecode } from "jwt-decode";

// Set to 10 minutes as requested
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
export function AuthStoreProvider({ children }: { children: React.ReactNode }) {
  console.log("AuthStoreProvider rendered");

  const syncCookie = useAuthStore((state) => state.syncCookie);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  console.log("Auth functions loaded:", {
    hasLogoutFn: !!logout,
    hasIsAuthFn: !!isAuthenticated,
    authState: isAuthenticated ? isAuthenticated() : "function not ready",
  });

  // Effect for syncing initial auth state with server
  useEffect(() => {
    console.log("Initial server auth sync effect running");
    const checkServerAuth = async () => {
      try {
        const response = await fetch("/api/validate-token", {
          method: "POST",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user) {
            // Update store with server auth data
            login({
              user: data.user,
              accessToken: data.token,
            });
            console.log("Synced auth state from server");
          }
        }
      } catch (error) {
        console.error("Server auth sync error:", error);
      }
    };

    checkServerAuth();
  }, [login]);

  // Continue with your existing effects...
  useEffect(() => {
    console.log("Cookie sync effect running");
    syncCookie();
  }, [syncCookie]);

  // Activity tracking effect
  useEffect(() => {
    const authenticated = isAuthenticated();
    console.log("Setting up inactivity tracking, auth state:", authenticated);

    if (!authenticated) {
      console.log("Not authenticated, skipping inactivity tracking");
      return;
    }

    // Track user activity to prevent auto logout
    let inactivityTimer: NodeJS.Timeout;
    let throttleTimeout: NodeJS.Timeout;
    let lastActivity = Date.now();

    // Throttled activity handler
    const throttledHandleActivity = () => {
      if (throttleTimeout) return;

      throttleTimeout = setTimeout(() => {
        lastActivity = Date.now();
        document.cookie = `lastActivity=${Date.now()}; path=/;`;
        throttleTimeout = undefined as unknown as NodeJS.Timeout;
      }, 500); // Throttle to 500ms
    };

    // Set up inactivity timer
    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);

      inactivityTimer = setTimeout(() => {
        const inactiveTime = Date.now() - lastActivity;
        if (inactiveTime >= INACTIVITY_TIMEOUT) {
          console.log(`User inactive for ${inactiveTime / 1000}s, logging out`);
          logout();
        }
      }, INACTIVITY_TIMEOUT);
    };

    // Initial setup
    resetInactivityTimer();

    // Event listeners for user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(event, throttledHandleActivity, true);
    });

    // Cleanup event listeners
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (throttleTimeout) clearTimeout(throttleTimeout);

      events.forEach((event) => {
        document.removeEventListener(event, throttledHandleActivity, true);
      });
    };
  }, [isAuthenticated, logout]);

  return <>{children}</>;
}
