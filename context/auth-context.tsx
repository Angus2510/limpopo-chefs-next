// app/context/auth-context.tsx
"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  userType: "Staff" | "Student" | "Guardian";
  avatar?: string;
}

interface AuthContextType {
  accessToken: string | null;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  autoLogoutTime?: number;
}

async function logoutAction() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

export function AuthProvider({
  children,
  autoLogoutTime = 2 * 60 * 1000, // 2 minutes default
}: AuthProviderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Use refs to keep track of our timers
  const logoutTimerRef = useRef<NodeJS.Timeout>();
  const warningTimerRef = useRef<NodeJS.Timeout>();

  const isAuthenticated = useCallback(() => {
    return !!accessToken && !!user;
  }, [accessToken, user]);

  // Function to clear both timers
  const clearTimers = useCallback(() => {
    console.log("Clearing timers");
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
  }, []);

  // Function to reset timers
  const resetTimers = useCallback(() => {
    console.log("Resetting timers at:", new Date().toLocaleTimeString());
    clearTimers();

    const warningTime = autoLogoutTime - 30000; // Warning 30 seconds before logout

    // Set warning timer
    warningTimerRef.current = setTimeout(() => {
      console.log(
        "Warning timer triggered at:",
        new Date().toLocaleTimeString()
      );
      toast({
        title: "Session Expiring Soon",
        description:
          "Your session will expire in 30 seconds due to inactivity. Click to stay logged in.",
        duration: 10000,
        action: {
          label: "Stay Logged In",
          onClick: () => {
            console.log(
              "Stay Logged In clicked at:",
              new Date().toLocaleTimeString()
            );
            resetTimers();
          },
        },
      });
    }, warningTime);

    // Set logout timer
    logoutTimerRef.current = setTimeout(async () => {
      console.log(
        "Logout timer triggered at:",
        new Date().toLocaleTimeString()
      );
      if (isAuthenticated()) {
        try {
          await logout();
        } catch (error) {
          console.error("Auto-logout failed:", error);
        }
      }
    }, autoLogoutTime);
  }, [autoLogoutTime, toast, isAuthenticated]);

  const login = useCallback(
    (token: string, userData: User) => {
      console.log("Login called at:", new Date().toLocaleTimeString());
      setAccessToken(token);
      setUser(userData);
      setLastActivity(Date.now());

      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(userData));

      // Reset timers on login
      resetTimers();

      toast({
        title: "Welcome back!",
        description: `Logged in as ${userData.firstName} ${userData.lastName}`,
      });
    },
    [toast, resetTimers]
  );

  const logout = useCallback(async () => {
    console.log("Logout called at:", new Date().toLocaleTimeString());
    try {
      await logoutAction();
      clearTimers();
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Failed to log out:", error);
      setAccessToken(null);
      setUser(null);
      localStorage.clear();
      router.push("/login");
    }
  }, [router, toast, clearTimers]);

  // Effect to handle activity monitoring
  useEffect(() => {
    if (!isAuthenticated()) {
      console.log("Not authenticated, skipping timer setup");
      return;
    }

    console.log(
      "Setting up activity monitoring at:",
      new Date().toLocaleTimeString()
    );

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "keydown",
    ];

    const handleActivity = () => {
      console.log("Activity detected at:", new Date().toLocaleTimeString());
      setLastActivity(Date.now());
      resetTimers();
    };

    // Add event listeners
    activityEvents.forEach((eventName) => {
      document.addEventListener(eventName, handleActivity, true);
    });

    // Initial timer setup
    resetTimers();

    // Cleanup
    return () => {
      console.log("Cleaning up activity monitoring");
      clearTimers();
      activityEvents.forEach((eventName) => {
        document.removeEventListener(eventName, handleActivity, true);
      });
    };
  }, [isAuthenticated, resetTimers, clearTimers]);

  // Effect to restore auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setAccessToken(storedToken);
        setUser(userData);
        console.log("Restored auth state at:", new Date().toLocaleTimeString());
      } catch (error) {
        console.error("Error restoring auth state:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const value = {
    accessToken,
    user,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
