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
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768); // Adjust breakpoint as needed
    };
    // Initial check + event listener
    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  const lightLogos = {
    open: "/img/logo.png",
    closed: "/img/logo-normal-simple.png",
  };

  let determinedLogoSrc;
  let pathKeyUsed; // For debugging
  if (isMobileView) {
    // On smaller screens, always use the 'closed' (simple) logo
    determinedLogoSrc = lightLogos.closed;
    pathKeyUsed = "lightLogos.closed (mobile)";
  } else {
    // Desktop view logic
    if (sidebar?.isOpen) {
      determinedLogoSrc = lightLogos.open;
      pathKeyUsed = "lightLogos.open (desktop, sidebar open)";
    } else {
      determinedLogoSrc = lightLogos.closed;
      pathKeyUsed = "lightLogos.closed (desktop, sidebar closed)";
    }
  }
  const logoSrc = determinedLogoSrc;

  console.log("Sidebar State:", {
    isMobile: isMobileView,
    isOpen: sidebar?.isOpen,
    pathKeyUsed: pathKeyUsed,
    resolvedPath: logoSrc, // This is the critical value passed to <Image src={...} />
    lightLogosObject: JSON.parse(JSON.stringify(lightLogos)), // See the definition at runtime
  });

  if (!sidebar) return null;

  let logoWidth;
  if (isMobileView && sidebar?.isOpen) {
    // Note: if always simple logo on mobile, this width logic might also need adjustment
    logoWidth = 100; // This was for the 'closed' logo when sidebar is open on mobile
  } else if (isMobileView && !sidebar?.isOpen) {
    logoWidth = 50; // Assuming simple logo (closed) should be 50px when sidebar is closed on mobile
  } else if (sidebar?.isOpen) {
    // Desktop open
    logoWidth = 150;
  } else {
    // Desktop closed
    logoWidth = 50;
  }
  // Simplified logoWidth logic if mobile always uses one type of logo:
  if (isMobileView) {
    logoWidth = 50; // Or whatever fixed size you want for the simple logo on mobile
  } else {
    logoWidth = sidebar?.isOpen ? 150 : 50;
  }

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen",
        "transition-all ease-in-out duration-300", // Handles transitions for transform and width
        sidebar?.isOpen
          ? "translate-x-0"
          : "-translate-x-full lg:translate-x-0",
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
                height={50} // Consider if height also needs to be dynamic or if width constraint is enough
                priority
                className={cn(
                  "mr-1 mt-4 transition-all duration-300 ease-in-out",
                  sidebar?.isOpen ? "opacity-100" : "opacity-70" // Opacity might also need review based on mobile always showing simple logo
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
