// app/components/AuthDebug.tsx
"use client";

import { useAuth } from "@/context/auth-context";

export function AuthDebug() {
  const auth = useAuth();

  console.log("AuthDebug mounted");

  return (
    <div className="p-4 border rounded m-4">
      <h2>Auth Debug Panel</h2>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => {
          console.log("Auth state:", {
            isAuthenticated: auth.isAuthenticated(),
            user: auth.user,
          });
        }}
      >
        Check Auth State
      </button>
    </div>
  );
}
