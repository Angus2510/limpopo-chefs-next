"use client";

import Link from "next/link";
import { LayoutGrid, LogOut, User, Settings } from "lucide-react";
import { useEffect, useState } from "react";
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
import { fetchStudentData } from "@/lib/actions/student/fetchStudentData";
import { fetchStaffMemberById } from "@/lib/actions/staff/fetchStaffMemberById";

export function UserNav() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<any>(null);

  // Fetch user details based on type
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.id || !user?.userType) return;

      try {
        setLoading(true);
        let details;

        if (user.userType === "Staff") {
          details = await fetchStaffMemberById(user.id);
        } else if (user.userType === "Student") {
          const response = await fetchStudentData(user.id);
          details = response.student;
        }

        console.log("Fetched user details:", details);
        setUserDetails(details);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUserDetails();
    }
  }, [user?.id, user?.userType]);

  // Get user name from fetched details
  const getUserFullName = () => {
    if (loading) return "Loading...";
    if (!userDetails) return "Unknown User";

    if (userDetails.profile?.firstName && userDetails.profile?.lastName) {
      return `${userDetails.profile.firstName} ${userDetails.profile.lastName}`.trim();
    }

    return "Unknown User";
  };

  const userFullName = getUserFullName();
  const userEmail = userDetails?.email || user?.email || "Loading...";
  const userType = user?.userType || "Guest";

  // Enhanced avatar handling
  const getAvatarPath = () => {
    if (userDetails?.profile?.avatar) return userDetails.profile.avatar;
    if (userDetails?.avatarUrl) return userDetails.avatarUrl;
    return `/avatars/${userType.toLowerCase()}-default.png`;
  };

  const userAvatar = getAvatarPath();

  // Enhanced initials generator
  const getInitials = () => {
    if (loading) return "...";
    if (!userDetails?.profile) return "?";

    const first = userDetails.profile.firstName?.[0];
    const last = userDetails.profile.lastName?.[0];

    if (!first || !last) return "?";
    return `${first}${last}`.toUpperCase();
  };

  const handleLogout = async () => {
    try {
      console.log("Initiating logout...");
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Early return if not authenticated
  if (!isAuthenticated() || !user) {
    return null;
  }

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative h-8 w-8 rounded-full border-none"
                aria-label={`Open user menu for ${userFullName}`}
              >
                <Avatar className="h-8 w-8">
                  {loading ? (
                    <AvatarFallback className="bg-primary/10">
                      <span className="animate-pulse">...</span>
                    </AvatarFallback>
                  ) : (
                    <>
                      <AvatarImage
                        src={userAvatar}
                        alt={userFullName}
                        className="object-cover"
                        onError={(e) => {
                          console.log("Avatar load failed, using fallback");
                          (
                            e.target as HTMLImageElement
                          ).src = `/avatars/${userType.toLowerCase()}-default.png`;
                        }}
                      />
                      <AvatarFallback className="bg-primary/10">
                        {getInitials()}
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500" />
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
              {loading ? "Loading..." : userFullName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {loading ? "Loading..." : userEmail}
            </p>
            <p className="text-xs leading-none text-muted-foreground/80">
              {userType}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          {userType === "Staff" && (
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center">
                <LayoutGrid className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
