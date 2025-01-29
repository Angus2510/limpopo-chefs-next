// stores/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

// Define user types
type UserType = "Staff" | "Student" | "Guardian";

// User interface
interface User {
  id: number;
  firstName: string;
  lastName: string;
  userType: UserType;
  avatar?: string;
}

// Token payload interface
interface TokenPayload {
  id: number;
  userType: UserType;
  exp: number;
}

// Authentication Store Interface
interface AuthState {
  user: User;
  accessToken: string | null;
  login: (data: { user: User; accessToken: string }) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  getToken: () => string | null;
  syncCookie: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      login: ({ user, accessToken }) => {
        console.log("Logging in with:", { user, accessToken });

        // Set the cookie along with the store update
        Cookies.set("accessToken", accessToken, {
          expires: 1 / 24, // 1 hour
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });

        set({
          user,
          accessToken,
        });
      },

      logout: () => {
        // Clear the cookie along with the store
        Cookies.remove("accessToken");
        set({ user: null, accessToken: null });
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

          // If token is invalid, clear everything
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
        // First try to get from store, then fallback to cookie
        return accessToken || Cookies.get("accessToken") || null;
      },

      // New method to sync cookie with store
      syncCookie: () => {
        const { accessToken } = get();
        const cookieToken = Cookies.get("accessToken");

        if (accessToken && !cookieToken) {
          // If token exists in store but not in cookie, set cookie
          Cookies.set("accessToken", accessToken, {
            expires: 1 / 24, // 1 hour
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });
        } else if (!accessToken && cookieToken) {
          // If token exists in cookie but not in store, set store
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
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
      // Add onRehydrateStorage to sync cookie when store is rehydrated
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.syncCookie();
        }
      },
    }
  )
);

export default useAuthStore;
