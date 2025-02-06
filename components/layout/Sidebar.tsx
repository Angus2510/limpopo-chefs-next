"use client"; // Important for client-side hooks and dynamic rendering

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/use-store";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/layout/menu";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { SidebarToggle } from "@/components/layout/sidebar-toggle";

export function Sidebar() {
  const sidebar = useStore(useSidebarToggle, (state) => state);

  // Define logo paths for the light theme only
  const lightLogos = {
    open: "/img/logo.png",
    closed: "/img/logo-normal-simple.png",
  };

  // Select logo based on sidebar state
  const logoSrc = sidebar?.isOpen ? lightLogos.open : lightLogos.closed;

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
              src={logoSrc}
              alt="Logo"
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
