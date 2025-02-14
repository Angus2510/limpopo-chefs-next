// app/providers/auth-store-provider.tsx
"use client";

import { useEffect } from "react";
import useAuthStore from "@/store/authStore";

export function AuthStoreProvider({ children }: { children: React.ReactNode }) {
  const syncCookie = useAuthStore((state) => state.syncCookie);

  // Sync the auth state with cookies on mount and when window gains focus
  useEffect(() => {
    // Initial sync
    syncCookie();

    // Sync on window focus
    const handleFocus = () => {
      syncCookie();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [syncCookie]);

  return <>{children}</>;
}
