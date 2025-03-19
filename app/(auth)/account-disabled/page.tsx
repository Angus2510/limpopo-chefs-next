"use client";

import { useEffect } from "react";
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
  // Handle logout
  const handleLogout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("user");
    window.location.href = "/login";
  };

  // Open WhatsApp with the finance department number
  const handleWhatsApp = () => {
    window.open("https://wa.me/27761912732", "_blank");
  };

  // Open email client with finance email
  const handleEmail = () => {
    window.location.href = "mailto:finance@limpopochefs.co.za";
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center font-bold tracking-tight">
            Account Blocked
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="p-6 bg-red-50 text-red-700 rounded-md">
            <p className="font-medium mb-2">
              Your account has been disabled due to outstanding fees / fees not
              paid.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            <p>Please contact Finance department for assistance:</p>
            <p className="mt-2">
              <strong>Phone:</strong> 076 191 2732
              <br />
              <strong>Email:</strong> finance@limpopochefs.co.za
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            variant="default"
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handleWhatsApp}
          >
            Click to WhatsApp Finance
          </Button>
          <Button variant="default" className="w-full" onClick={handleEmail}>
            Click to email Finance
          </Button>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            Return to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
