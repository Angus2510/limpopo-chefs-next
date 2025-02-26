"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import useAuthStore from "@/store/authStore";

export function AuthDebug() {
  const [state, setState] = useState({
    contextAuth: false,
    storeAuth: false,
    contextUser: null as any,
    storeUser: null as any,
    cookies: "",
    tokenExpiry: "",
  });

  const auth = useAuth();
  const authStore = useAuthStore();

  useEffect(() => {
    const updateState = () => {
      const contextAuth = auth.isAuthenticated();
      const storeAuth = authStore.isAuthenticated();
      const cookies = document.cookie;

      let tokenExpiry = "No token";
      if (auth.accessToken) {
        try {
          const decoded = JSON.parse(atob(auth.accessToken.split(".")[1]));
          const expDate = new Date(decoded.exp * 1000);
          tokenExpiry = expDate.toLocaleTimeString();
        } catch (e) {
          tokenExpiry = "Invalid token";
        }
      }

      setState({
        contextAuth,
        storeAuth,
        contextUser: auth.user,
        storeUser: authStore.user,
        cookies,
        tokenExpiry,
      });
    };

    // Update immediately
    updateState();

    // Then update every second
    const interval = setInterval(updateState, 1000);
    return () => clearInterval(interval);
  }, [auth, authStore]);

  return (
    <div className="fixed bottom-4 right-4 bg-black/70 text-white p-3 rounded z-50">
      <h3 className="font-bold text-sm">Auth Debug</h3>
      <div className="text-xs space-y-1 mt-1">
        <p>Context Auth: {state.contextAuth ? "✅" : "❌"}</p>
        <p>Store Auth: {state.storeAuth ? "✅" : "❌"}</p>
        <p>Token Expires: {state.tokenExpiry}</p>
        <p>Has Cookie: {state.cookies.includes("accessToken") ? "✅" : "❌"}</p>
        {state.storeUser && (
          <p>
            User: {state.storeUser.firstName} ({state.storeUser.userType})
          </p>
        )}
      </div>
      <div className="mt-2 flex space-x-2">
        <button
          onClick={() => {
            console.log("Auth Context:", auth);
            console.log("Auth Store:", {
              user: authStore.user,
              isAuthenticated: authStore.isAuthenticated(),
              token: authStore.accessToken?.substring(0, 20) + "...",
            });
          }}
          className="bg-blue-600 px-2 py-1 rounded text-xs"
        >
          Log Details
        </button>
        <button
          onClick={() => {
            authStore.syncCookie();
          }}
          className="bg-green-600 px-2 py-1 rounded text-xs"
        >
          Sync
        </button>
      </div>
    </div>
  );
}
