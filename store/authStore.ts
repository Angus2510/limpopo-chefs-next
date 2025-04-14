export type UserType = "Staff" | "Student" | "Guardian";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  avatar?: string;
  email: string;
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
import { useTermsDialog } from "@/hooks/use-dialog";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  studentData: StudentData | null;
  loading: boolean;
  error: string | null;
  login: (data: { user: User; accessToken: string }) => void;
  logout: () => Promise<void>; // Change to async
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

        // Set cookie first
        Cookies.set("accessToken", accessToken, {
          expires: 10 / (24 * 60),
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });

        // Then update state
        set({
          user,
          accessToken,
          studentData: null,
          error: null,
        });

        // Force show POPI dialog
        setTimeout(() => {
          useTermsDialog.getState().showOnLogin();
        }, 0);
      },

      logout: async () => {
        console.log("Logout function called");

        // Reset POPI dialog state
        useTermsDialog.getState().resetTerms();

        // Clear client-side state first for immediate effect
        Cookies.remove("accessToken");
        set({
          user: null,
          accessToken: null,
          studentData: null,
          error: null,
        });

        try {
          console.log("Calling logout API");
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
        } catch (error) {
          console.error("Logout API error:", error);
        }

        window.location.href = "/login";
      },

      isAuthenticated: () => {
        const { accessToken, user } = get();

        if (!accessToken) {
          return false;
        }

        try {
          const decoded = jwtDecode<TokenPayload>(accessToken);
          return decoded.exp > Date.now() / 1000;
        } catch (error) {
          console.error("Token verification error:", error);
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
            expires: 10 / (24 * 60),
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
