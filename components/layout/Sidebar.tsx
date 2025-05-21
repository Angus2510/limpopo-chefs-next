"use client"; // Important for client-side hooks and dynamic rendering

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/use-store";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/layout/menu";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { SidebarToggle } from "@/components/layout/sidebar-toggle"; // This is the toggle button
import { useEffect, useState } from "react";

export function Sidebar() {
  const sidebar = useStore(useSidebarToggle, (state) => state);

  const [isMobileView, setIsMobileView] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.innerWidth < 768; // md breakpoint (screens less than 768px wide)
  });

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", checkMobileView);
    checkMobileView(); // Call on mount to set initial state correctly

    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  const lightLogos = {
    open: "/img/logo.png",
    closed: "/img/logo-normal-simple.png",
  };

  let determinedLogoSrc;
  if (isMobileView) {
    determinedLogoSrc = lightLogos.closed;
  } else {
    determinedLogoSrc = sidebar?.isOpen ? lightLogos.open : lightLogos.closed;
  }
  const logoSrc = determinedLogoSrc;

  console.log("Sidebar State:", {
    isMobile: isMobileView,
    isOpen: sidebar?.isOpen,
    resolvedPath: logoSrc,
  });

  if (!sidebar) return null; // Ensure sidebar store is available

  let logoWidth;
  if (isMobileView) {
    logoWidth = 50;
  } else {
    logoWidth = sidebar?.isOpen ? 150 : 50;
  }

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen",
        "bg-background", // Ensures sidebar has a solid background
        "transition-all ease-in-out duration-300",
        sidebar?.isOpen
          ? "translate-x-0" // Sidebar is open and visible
          : "-translate-x-full md:translate-x-0", // Sidebar closed: slides out on mobile (<768px), collapses on tablet/desktop (>=768px)
        sidebar?.isOpen === false ? "w-[90px]" : "w-72" // Width when collapsed vs. open
      )}
    >
      {/* 
        This SidebarToggle is the button to open/close the sidebar.
        Ensure SidebarToggle.tsx is styled to be visible and clickable 
        on mobile when the sidebar is open.
      */}
      <SidebarToggle isOpen={sidebar?.isOpen} setIsOpen={sidebar?.setIsOpen} />

      <div className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800">
        <Button
          className={cn(
            "transition-transform ease-in-out duration-300 mb-1",
            sidebar?.isOpen === false ? "translate-x-1" : "translate-x-0" // Slight adjustment for collapsed logo
          )}
          variant="link"
          asChild
        >
          <Link href="/dashboard" className="flex items-center gap-2">
            {logoSrc && (
              <Image
                src={logoSrc}
                alt="Logo"
                width={logoWidth}
                height={50}
                priority
                className={cn(
                  "mr-1 mt-4 transition-all duration-300 ease-in-out",
                  isMobileView
                    ? "opacity-100"
                    : sidebar?.isOpen
                    ? "opacity-100"
                    : "opacity-70"
                )}
              />
            )}
          </Link>
        </Button>
        <Menu isOpen={sidebar?.isOpen} />
      </div>
    </aside>
  );
}
