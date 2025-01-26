"use client"; // Important for client-side hooks and dynamic rendering

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/use-store";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/layout/menu";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { SidebarToggle } from "@/components/layout/sidebar-toggle";
import { useTheme } from "next-themes"; // Add this import
import { useState, useEffect } from "react"; // Add these imports

export function Sidebar() {
  const sidebar = useStore(useSidebarToggle, (state) => state);
  const { resolvedTheme } = useTheme(); // Get current theme
  const [mounted, setMounted] = useState(false); // Prevent hydration issues

  // Ensure component is mounted client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Logo selection logic
  const getLogoSrc = () => {
    // Define logo paths based on theme and sidebar state
    const logos = {
      light: {
        open: "/img/logo.png",
        closed: "/img/logo-normal-simple.png",
      },
      dark: {
        open: "/img/logo-light.png",
        closed: "/img/logo-white-simple.png",
      },
    };

    // Default fallback
    if (!mounted || !resolvedTheme) {
      return "/img/logo-default.png";
    }

    // Select logo based on theme and sidebar state
    const themeLogos = logos[resolvedTheme as "light" | "dark"];
    return sidebar?.isOpen ? themeLogos.open : themeLogos.closed;
  };

  if (!sidebar) return null;

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        sidebar?.isOpen === false ? "w-[90px]" : "w-72"
      )}
    >
      <SidebarToggle isOpen={sidebar?.isOpen} setIsOpen={sidebar?.setIsOpen} />

      <div className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800">
        <Button
          className={cn(
            "transition-transform ease-in-out duration-300 mb-1",
            sidebar?.isOpen === false ? "translate-x-1" : "translate-x-0"
          )}
          variant="link"
          asChild
        >
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src={getLogoSrc()}
              alt="Adaptive Logo"
              width={sidebar?.isOpen ? 150 : 50} // Responsive width
              height={50}
              priority // Important for faster loading
              className={cn(
                "mr-1 mt-4 transition-all duration-300 ease-in-out",
                sidebar?.isOpen ? "opacity-100" : "opacity-70" // Visual hint
              )}
            />
          </Link>
        </Button>

        <Menu isOpen={sidebar?.isOpen} />
      </div>
    </aside>
  );
}
