"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { setToken } from '@/lib/actions/auth/set-token/set-token';

export default function SetCookiePage() {
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const accessToken = searchParams.get("accessToken");
    const redirectUrl = searchParams.get("redirect");

    if (accessToken) {
      // Call the server action to set the token as a secure HTTP-only cookie
      setToken(accessToken).then(() => {
        console.log("Access token set successfully.");

        // Redirect to the desired page
        if (redirectUrl) {
          console.log("Redirecting to:", redirectUrl);
          router.push(redirectUrl);
        }
      }).catch((error) => {
        console.error("Failed to set access token:", error);
        router.push('/login');
      });
    } else {
      // If no access token is provided, redirect to the login page
      router.push('/login');
    }
  }, [router]);

  return null; 
}
