"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the shape of the AuthContext state
interface AuthContextType {
  accessToken: string | null;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

// Define the User type (adjust fields as needed)
interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string; // Avatar is optional
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the AuthProvider props type
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Function to log in the user
  const login = (token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
  };

  // Function to log out the user
  const logout = async () => {
    try {
      // Call the server action to invalidate the session
      await logoutAction();

      // Clear the access token and user data from the context
      setAccessToken(null);
      setUser(null);

      // Redirect to login page or homepage
      window.location.href = "/login";
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ accessToken, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
