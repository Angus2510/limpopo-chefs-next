import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/auth-context";
import { AuthStoreProvider } from "@/providers/auth-store-provider";
import { AuthDebug } from "@/components/AuthDebug";

// Initialize font
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Metadata configuration
export const metadata: Metadata = {
  title: "Home",
  description: "Home",
};

// Create a wrapper component to handle client-side providers
function Providers({ children }: { children: React.ReactNode }) {
  return (
    // AuthStoreProvider wraps Zustand store initialization
    <AuthStoreProvider>
      {/* AuthProvider handles context-based auth with built-in auto-logout */}
      <AuthProvider autoLogoutTime={10 * 60 * 1000}>{children}</AuthProvider>
    </AuthStoreProvider>
  );
}

// Root layout component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
