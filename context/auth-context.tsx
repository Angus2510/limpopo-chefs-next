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
import { jwtDecode } from "jwt-decode";

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

interface JwtPayload {
  id: string;
  userType: string;
  exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  autoLogoutTime?: number;
}

async function validateToken(token: string): Promise<boolean> {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
}

async function refreshToken(): Promise<{ token: string; user: User } | null> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export function AuthProvider({
  children,
  autoLogoutTime = 3600000, // 1 hour default
}: AuthProviderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [isInitialized, setIsInitialized] = useState(false);

  const logoutTimerRef = useRef<NodeJS.Timeout>();
  const warningTimerRef = useRef<NodeJS.Timeout>();
  const refreshTimerRef = useRef<NodeJS.Timeout>();

  const isAuthenticated = useCallback(() => {
    if (!accessToken || !user) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(accessToken);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }, [accessToken, user]);

  const clearAllTimers = useCallback(() => {
    [logoutTimerRef, warningTimerRef, refreshTimerRef].forEach((timer) => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = undefined;
      }
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAllTimers();
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem("user");
      router.push("/login");
      router.refresh();
    }
  }, [router, clearAllTimers]);

  const setupTimers = useCallback(() => {
    clearAllTimers();

    // Warning timer (5 minutes before expiry)
    warningTimerRef.current = setTimeout(() => {
      toast({
        title: "Session Expiring Soon",
        description: "Your session will expire soon. Click to stay logged in.",
        action: {
          label: "Stay Logged In",
          onClick: async () => {
            const refresh = await refreshToken();
            if (refresh) {
              setAccessToken(refresh.token);
              setUser(refresh.user);
              setupTimers();
            }
          },
        },
      });
    }, autoLogoutTime - 300000);

    // Auto logout timer
    logoutTimerRef.current = setTimeout(() => {
      logout();
    }, autoLogoutTime);

    // Token refresh timer (every 45 minutes)
    refreshTimerRef.current = setTimeout(async () => {
      const refresh = await refreshToken();
      if (refresh) {
        setAccessToken(refresh.token);
        setUser(refresh.user);
        setupTimers();
      }
    }, 2700000);
  }, [autoLogoutTime, logout, toast]);

  const login = useCallback(
    (token: string, userData: User) => {
      setAccessToken(token);
      setUser(userData);
      setLastActivity(Date.now());
      localStorage.setItem("user", JSON.stringify(userData));
      setupTimers();

      toast({
        title: "Welcome back!",
        description: `Logged in as ${userData.firstName} ${userData.lastName}`,
      });
    },
    [setupTimers, toast]
  );

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");

        // Try to validate current session
        const response = await fetch("/api/auth/validate", {
          credentials: "include",
        });

        if (response.ok) {
          const { token, user } = await response.json();
          setAccessToken(token);
          setUser(user);
          setupTimers();
        } else if (storedUser) {
          // Try to refresh if we have stored user data
          const refresh = await refreshToken();
          if (refresh) {
            setAccessToken(refresh.token);
            setUser(refresh.user);
            setupTimers();
          } else {
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [setupTimers]);

  // Activity monitoring
  useEffect(() => {
    if (!isAuthenticated()) return;

    const handleActivity = () => {
      setLastActivity(Date.now());
      setupTimers();
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) =>
      document.addEventListener(event, handleActivity, true)
    );

    return () => {
      events.forEach((event) =>
        document.removeEventListener(event, handleActivity, true)
      );
      clearAllTimers();
    };
  }, [isAuthenticated, setupTimers, clearAllTimers]);

  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
