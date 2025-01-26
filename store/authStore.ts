// stores/authStore.ts
// stores/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";

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
  user: User | null;
  accessToken: string | null;
  login: (data: { user: User; accessToken: string }) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  getToken: () => string | null;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      login: ({ user, accessToken }) => {
        console.log("Logging in with:", { user, accessToken }); // Debugging log
        set({
          user,
          accessToken,
        });
      },

      logout: () => {
        set({ user: null, accessToken: null });
      },

      isAuthenticated: () => {
        const { accessToken, user } = get();
        console.log("Authentication Check:", { accessToken, user }); // Debugging log

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

          return isValid;
        } catch (error) {
          console.error("Token verification error:", error);
          return false;
        }
      },

      getToken: () => {
        const { accessToken } = get();
        return accessToken;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);

export default useAuthStore;
