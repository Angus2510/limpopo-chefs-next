"use client";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // Updated to generic identifier
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Send login request to the backend
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }), // Updated payload
      });

      const data = await res.json();

      if (res.ok) {
        // Store the JWT token in localStorage
        localStorage.setItem("token", data.token);
        // Redirect to the student portal or another page
        window.location.href = "/terms"; // Change this to your desired route
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Left Section */}
      <div className="flex w-full flex-col items-center justify-between bg-gray-100 p-8 md:w-1/2">
        {/* Logo */}
        <div className="mt-2">
          <Image
            src="/img/logo.png"
            alt="Logo"
            className="mx-auto mb-10"
            width={250}
            height={250}
          />
        </div>

        {/* Login Form */}
        <form className="w-3/4 space-y-6" onSubmit={handleLogin}>
          <h2 className="text-center text-2xl font-bold text-gray-800">
            Student Portal
          </h2>
          <h3 className="text-center text-base text-gray-500">
            Enter your email or username and password to sign in.
          </h3>

          <Input
            type="text"
            id="identifier"
            placeholder="Email or Username"
            value={identifier} // Updated state
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <Input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log In"}
          </Button>
          {error && <p className="text-center text-red-500">{error}</p>}
        </form>

        {/* Sponsors */}
        <div className="my-8">
          <div className="flex justify-center space-x-4">
            <Image
              src="/img/auth/sponsors.png"
              alt="Sponsors"
              className="h-8 object-contain"
              width={500}
              height={500}
            />
          </div>
        </div>
      </div>

      {/* Right Section (Image) */}
      <div
        className="hidden w-full bg-cover bg-center md:block md:w-1/2"
        style={{ backgroundImage: "url('/img/auth/auth.jpg')" }}
      ></div>
    </div>
  );
}
