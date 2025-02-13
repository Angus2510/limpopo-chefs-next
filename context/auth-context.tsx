// app/context/auth-context.tsx
"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
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
  autoLogoutTime = 10 * 60 * 1000, // 10 minutes
}: AuthProviderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  const isAuthenticated = useCallback(() => {
    return !!accessToken && !!user;
  }, [accessToken, user]);

  const login = useCallback(
    (token: string, userData: User) => {
      setAccessToken(token);
      setUser(userData);
      setLastActivity(Date.now());

      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(userData));

      toast({
        title: "Welcome back!",
        description: `Logged in as ${userData.firstName} ${userData.lastName}`,
      });
    },
    [toast]
  );

  const logout = useCallback(async () => {
    try {
      await logoutAction();

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
  }, [router, toast]);

  // Auto-logout effect
  useEffect(() => {
    if (!isAuthenticated()) return;

    let logoutTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;

    const resetTimers = () => {
      clearTimeout(logoutTimer);
      clearTimeout(warningTimer);
      setLastActivity(Date.now());

      // Warning timer (1 minute before logout)
      warningTimer = setTimeout(() => {
        toast({
          title: "Session Expiring Soon",
          description:
            "Your session will expire in 1 minute due to inactivity. Click to stay logged in.",
          duration: 10000,
          action: {
            label: "Stay Logged In",
            onClick: () => resetTimers(),
          },
        });
      }, autoLogoutTime - 60000);

      // Logout timer
      logoutTimer = setTimeout(() => {
        toast({
          title: "Session Expired",
          description: "You have been logged out due to inactivity",
          variant: "destructive",
        });
        logout();
      }, autoLogoutTime);
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

    activityEvents.forEach((eventName) => {
      document.addEventListener(eventName, resetTimers, true);
    });

    resetTimers();

    return () => {
      clearTimeout(logoutTimer);
      clearTimeout(warningTimer);
      activityEvents.forEach((eventName) => {
        document.removeEventListener(eventName, resetTimers, true);
      });
    };
  }, [isAuthenticated, logout, autoLogoutTime, toast]);

  // Restore auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setAccessToken(storedToken);
        setUser(userData);
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
