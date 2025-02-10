"use client";

import Link from "next/link";
import { LayoutGrid, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuthStore from "../../store/authStore";
import { useRouter } from "next/navigation";

export function UserNav() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    const userData = Cookies.get("user"); // Assuming user info is stored in a cookie named "user"
    if (userData) {
      try {
        setUser(JSON.parse(userData)); // Parse JSON string to object
      } catch (error) {
        console.error("Error parsing user data from cookies:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("user"); // Clear user cookie on logout
    logout();
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.avatar || "/default-avatar.png"}
                    alt="Avatar"
                  />
                  <AvatarFallback className="bg-transparent">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "JD"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Profile</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.name || "John Doe"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || "johndoe@example.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/dashboard" className="flex items-center">
              <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/account" className="flex items-center">
              <User className="w-4 h-4 mr-3 text-muted-foreground" />
              Account
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="hover:cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-3 text-muted-foreground" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
