"use client";

import Link from "next/link";
import { LayoutGrid, LogOut, User } from "lucide-react";
import { useEffect } from "react";

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
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export function UserNav() {
  const router = useRouter();
  // Use the context-based auth system instead of Zustand
  const { user, logout, isAuthenticated } = useAuth();

  const userFullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.lastName || "Guest User";

  const userEmail = user?.id || "No ID available";
  const userAvatar = user?.avatar;
  const userInitial = user?.firstName
    ? user.firstName.charAt(0).toUpperCase()
    : user?.lastName
    ? user.lastName.charAt(0).toUpperCase()
    : "G";

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // For debugging only - remove in production
  useEffect(() => {
    console.log("Auth context user:", user);
    console.log("Is authenticated:", isAuthenticated());
  }, [user, isAuthenticated]);

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
                    src={userAvatar || "/default-avatar.png"}
                    alt="Avatar"
                  />
                  <AvatarFallback className="bg-transparent">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                {isAuthenticated() && (
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500" />
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Profile</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userFullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
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
