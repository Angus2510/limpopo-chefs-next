import LoginForm from "@/components/forms/auth/LoginForm";
import Image from "next/image";
import Link from "next/link"; // Import Link for navigation

export default function LoginPage() {
  return (
    <div className="w-full h-screen flex flex-col lg:flex-row">
      {/* Left section: Login form */}
      <div className="flex items-center justify-center flex-col p-8 lg:p-8 w-full lg:w-1/2">
        <Image src="/img/logo.png" alt="Logo" width="250" height="250" />
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="text-balance text-muted-foreground">
            Enter your Student Number below to login to your account
          </p>
          {/* Reset Password Link */}
        </div>
        <LoginForm />
        <Link
          href="/reset"
          className="text-sm text-primary hover:underline mt-2"
        >
          Forgot Password?
        </Link>
        <Image
          src="/img/auth/sponsors-new.png"
          alt="Sponsors"
          width="350"
          height="350"
          className="mt-6" // Hide this on larger screens
        />
      </div>

      {/* Right section: Background image or illustration */}
      <div className="hidden lg:block w-2/3 rounded-bl-full overflow-hidden">
        <Image
          src="/img/auth/auth.jpg"
          alt="Auth background"
          width="1000"
          height="1000"
          className="h-full w-full object-cover "
        />
      </div>
    </div>
  );
}
