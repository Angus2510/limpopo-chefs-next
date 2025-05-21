"use client"; // Important for client-side hooks and dynamic rendering

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/use-store";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/layout/menu";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { SidebarToggle } from "@/components/layout/sidebar-toggle";
import { useEffect, useState } from "react";

export function Sidebar() {
  const sidebar = useStore(useSidebarToggle, (state) => state);

  // Initialize isMobileView based on window.innerWidth if available on the client.
  // This provides a more accurate initial value on the client's first render.
  const [isMobileView, setIsMobileView] = useState(() => {
    if (typeof window === "undefined") {
      return false; // Default for SSR, will be corrected on client mount if different
    }
    return window.innerWidth < 768; // md breakpoint
  });

  useEffect(() => {
    // This effect now only needs to handle resize events,
    // as the initial state is set by useState's initializer on the client.
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768); // Adjust breakpoint as needed
    };

    window.addEventListener("resize", checkMobileView);
    // Ensure the view is correctly set on mount if the initial useState was SSR default
    // and client environment is now available.
    checkMobileView(); // Call on mount

    return () => window.removeEventListener("resize", checkMobileView);
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  // Ensure these paths correctly point to your images in the `public` folder
  const lightLogos = {
    open: "/img/logo.png",
    closed: "/img/logo-normal-simple.png", // This is used for mobile and closed sidebar on desktop
  };

  let determinedLogoSrc;
  if (isMobileView) {
    // On smaller screens, always use the 'closed' (simple) logo
    determinedLogoSrc = lightLogos.closed;
  } else {
    // Desktop view logic
    determinedLogoSrc = sidebar?.isOpen ? lightLogos.open : lightLogos.closed;
  }
  const logoSrc = determinedLogoSrc;

  // This console.log is helpful for debugging the paths:
  console.log("Sidebar State:", {
    isMobile: isMobileView,
    isOpen: sidebar?.isOpen,
    resolvedPath: logoSrc,
    lightLogosDefinition: lightLogos,
  });

  if (!sidebar) return null;

  let logoWidth;
  // Simplified logoWidth logic
  if (isMobileView) {
    logoWidth = 50; // Fixed size for the simple logo on mobile
  } else {
    logoWidth = sidebar?.isOpen ? 150 : 50; // Desktop: 150px for open, 50px for closed
  }

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen",
        "bg-background", // Ensures sidebar has a background color
        "transition-all ease-in-out duration-300",
        sidebar?.isOpen
          ? "translate-x-0" // Should be active when open
          : "-translate-x-full md:translate-x-0", // Changed lg: to md:
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
            {logoSrc && (
              <Image
                src={logoSrc}
                alt="Logo"
                width={logoWidth}
                height={50} // Assuming a fixed height or adjust as needed
                priority
                className={cn(
                  "mr-1 mt-4 transition-all duration-300 ease-in-out",
                  isMobileView
                    ? "opacity-100" // Simple logo always fully visible on mobile
                    : sidebar?.isOpen
                    ? "opacity-100" // Full logo visible when open on desktop
                    : "opacity-70" // Simple logo slightly faded when closed on desktop
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
