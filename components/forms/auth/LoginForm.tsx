//components/forms/auth/LoginForm.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonLoading } from "@/components/common/ButtonLoading";

// Define the validation schema using Zod
const loginSchema = z.object({
  identifier: z.string().nonempty("Email or Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Define the form data type
type LoginFormData = z.infer<typeof loginSchema>;

async function loginAction(data: { identifier: string; password: string }) {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("Login Response Status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Login Error Response:", errorData);
      throw new Error(errorData.error || "Invalid credentials or server error");
    }

    const result = await response.json();

    return result; // returns { accessToken, user }
  } catch (error) {
    console.error("Login Action Error:", error);
    throw error;
  }
}

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setError(null);
    setIsLoading(true);

    try {
      console.log("Form Submit - Starting Login Process");

      // Attempt to log in
      const result = await loginAction(data);
      console.log("Login Result:", result); // Add this

      // Log the entire result for inspection

      // Destructure with fallback to prevent undefined
      const { accessToken = "", user } = result;
      console.log("User Object:", user); // Add this
      console.log("User Type:", user?.userType);
      // Use the Zustand store's login method
      login({
        user,
        accessToken,
      });
      console.log("About to route based on user type:", user?.userType);
      // Route based on user type
      switch (user.userType) {
        case "Staff":
          console.log("Routing to Staff Dashboard");
          router.push("/admin/dashboard");
          break;
        case "Student":
          console.log("Routing to Student Dashboard");
          try {
            router.refresh();
            await router.push("/student/dashboard");
            console.log("Router push completed");
          } catch (e) {
            console.error("Routing error:", e);
          }
          break;
        case "Guardian":
          console.log("Routing to Guardian Dashboard");
          router.push("/guardian/dashboard");
          break;
        default:
          console.log("Routing to Default Dashboard");
          router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login Submit Error:", error);
      setIsLoading(false);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="identifier">Student Number</Label>
        <Input
          id="identifier"
          type="text"
          placeholder="Student Number"
          {...register("identifier")}
          className="mt-1"
        />
        {errors.identifier && (
          <p className="text-red-600 mt-1">{errors.identifier.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Your password"
          {...register("password")}
          className="mt-1"
        />
        {errors.password && (
          <p className="text-red-600 mt-1">{errors.password.message}</p>
        )}
      </div>
      <ButtonLoading isLoading={isLoading}>Login</ButtonLoading>
      {error && <p className="text-red-600 text-center mt-4">{error}</p>}
    </form>
  );
}
