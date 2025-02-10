export type UserType = "Staff" | "Student" | "Guardian";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  avatar?: string;
}

export interface TokenPayload {
  id: string;
  userType: UserType;
  exp: number;
}

export interface StudentData {
  student: any; // Replace with your student type
  wellnessRecords: any[];
  results: any[];
  learningMaterials: any[];
  events: any[];
  finances: any;
  documents: any[];
}

// stores/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import type { User, TokenPayload, StudentData } from "@/types/auth/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  studentData: StudentData | null;
  loading: boolean;
  error: string | null;
  login: (data: { user: User; accessToken: string }) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  getToken: () => string | null;
  syncCookie: () => void;
  fetchStudentData: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      studentData: null,
      loading: false,
      error: null,

      login: ({ user, accessToken }) => {
        console.log("Logging in with:", { user, accessToken });

        Cookies.set("accessToken", accessToken, {
          expires: 1 / 24, // 1 hour
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });

        set({
          user,
          accessToken,
          studentData: null, // Reset student data on login
          error: null,
        });
      },

      logout: () => {
        Cookies.remove("accessToken");
        set({
          user: null,
          accessToken: null,
          studentData: null,
          error: null,
        });
      },

      isAuthenticated: () => {
        const { accessToken, user } = get();
        console.log("Authentication Check:", { accessToken, user });

        if (!accessToken) {
          console.log("No access token found");
          return false;
        }

        try {
          const decoded = jwtDecode<TokenPayload>(accessToken);
          const isValid = decoded.exp > Date.now() / 1000;

          console.log("Token Validation:", {
            isValid,
            currentTime: new Date(),
            expirationTime: new Date(decoded.exp * 1000),
          });

          if (!isValid) {
            get().logout();
            return false;
          }

          return isValid;
        } catch (error) {
          console.error("Token verification error:", error);
          get().logout();
          return false;
        }
      },

      getToken: () => {
        const { accessToken } = get();
        return accessToken || Cookies.get("accessToken") || null;
      },

      syncCookie: () => {
        const { accessToken } = get();
        const cookieToken = Cookies.get("accessToken");

        if (accessToken && !cookieToken) {
          Cookies.set("accessToken", accessToken, {
            expires: 1 / 24,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });
        } else if (!accessToken && cookieToken) {
          try {
            const decoded = jwtDecode<TokenPayload>(cookieToken);
            if (decoded.exp > Date.now() / 1000) {
              set({ accessToken: cookieToken });
            } else {
              Cookies.remove("accessToken");
            }
          } catch {
            Cookies.remove("accessToken");
          }
        }
      },

      setLoading: (loading: boolean) => set({ loading }),

      setError: (error: string | null) => set({ error }),

      fetchStudentData: async () => {
        const { user, isAuthenticated, logout, setLoading, setError } = get();

        if (!isAuthenticated() || user?.userType !== "Student") {
          setError("Unauthorized access");
          return;
        }

        setLoading(true);
        setError(null);

        try {
          const response = await fetch("/api/student/data");

          if (!response.ok) {
            throw new Error("Failed to fetch student data");
          }

          const data = await response.json();
          set({ studentData: data });
        } catch (error) {
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError(String(error));
          }
          if (
            error instanceof Error &&
            error.message.includes("Unauthorized")
          ) {
            logout();
          }
        } finally {
          setLoading(false);
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.syncCookie();
        }
      },
    }
  )
);

export default useAuthStore;
