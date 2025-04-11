"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { useAuth } from "@/context/auth-context";
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

export default function LoginForm() {
  const router = useRouter();
  const authStore = useAuthStore();
  const authContext = useAuth();
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

      // Make API call
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("Login Response Status:", response.status);

      const result = await response.json();

      // Check for disabled account before checking other response statuses
      if (response.status === 403 && result.accountDisabled) {
        console.log("Account disabled, redirecting to disabled page");
        router.push("/account-disabled");
        return;
      }

      if (!response.ok) {
        console.error("Login Error Response:", result);
        throw new Error(result.error || "Invalid credentials or server error");
      }

      const { accessToken = "", user } = result;

      console.log("Login Result:", {
        success: true,
        hasToken: !!accessToken,
        hasUser: !!user,
        userType: user?.userType,
      });
      // Change to:
      console.log("Updating both auth systems:", {
        hasUser: !!user,
        hasToken: !!accessToken,
      });
      // Update context first (it's more strict)
      authContext.login(accessToken, user);
      // Then update store
      authStore.login({ user, accessToken });

      // Set activity timestamp (for inactivity tracking)
      document.cookie = `lastActivity=${Date.now()}; path=/;`;

      // Add a timeout to check auth state after React has time to update state
      setTimeout(() => {
        console.log("Auth state after delay:", {
          contextAuth: authContext.isAuthenticated(),
          storeAuth: authStore.isAuthenticated(),
          hasContextUser: !!authContext.user,
          hasContextToken: !!authContext.accessToken,
        });
      }, 100);

      // Verify login was successful
      console.log("Auth state after login:", {
        storeAuthenticated: authStore.isAuthenticated(),
        contextAuthenticated: authContext.isAuthenticated(),
        userType: user.userType,
      });

      // Route based on user type
      console.log(`Routing to ${user.userType} dashboard...`);
      switch (user.userType) {
        case "Staff":
          router.push("/admin/dashboard");
          break;
        case "Student":
          router.push("/student/dashboard");
          break;
        case "Guardian":
          // Redirect guardian to their linked student's dashboard
          if (user.linkedStudentId) {
            router.push(`/student/dashboard?viewing=${user.linkedStudentId}`);
          } else {
            setError("No linked student found for this guardian account");
          }
          break;
        default:
          router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login Submit Error:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
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
