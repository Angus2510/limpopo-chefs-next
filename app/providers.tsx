// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";

import { Toaster } from "@/components/ui/toaster";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <div className="">
      <SessionProvider>{children}</SessionProvider>
      <Toaster />
    </div>
  );
}
