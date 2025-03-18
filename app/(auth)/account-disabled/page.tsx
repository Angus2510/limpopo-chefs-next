"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AccountDisabledPage() {
  const [reason, setReason] = useState<string>(
    "Your account has been disabled"
  );

  useEffect(() => {
    try {
      // Try to get the reason from the user cookie
      const userCookie = Cookies.get("user");
      if (userCookie) {
        const userData = JSON.parse(userCookie);
        if (userData.inactiveReason) {
          setReason(userData.inactiveReason);
        }
      }
    } catch (error) {
      console.error("Error reading cookie:", error);
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("user");
    window.location.href = "/login";
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center font-bold tracking-tight">
            Account Disabled
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="p-6 bg-red-50 text-red-700 rounded-md">
            <p className="font-medium mb-2">
              Your account access has been suspended
            </p>
            <p className="text-sm text-red-600">Reason: {reason}</p>
          </div>
          <div className="text-sm text-gray-500">
            <p>Please contact the administration office for assistance:</p>
            <p className="mt-2">
              <strong>Phone:</strong> 084 806 8596
              <br />
              <strong>Email:</strong> info@limpopochefs.co.za
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            Return to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
