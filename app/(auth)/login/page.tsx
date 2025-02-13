import LoginForm from "@/components/forms/auth/LoginForm";
import Image from "next/image";
import Link from "next/link"; // Import Link for navigation

export default function LoginPage() {
  return (
    <div className="w-full h-screen flex flex-col md:flex-row">
      {/* Left section: Login form */}
      <div className="flex items-center justify-center flex-col p-8 md:p-4 w-full md:w-1/2">
        {/* Adjusted logo size on md screens */}
        <Image
          src="/img/logo.png"
          alt="Logo"
          width={250}
          height={250}
          className="w-40 h-40 md:w-32 md:h-32"
        />

        <div className="grid gap-2 text-center">
          {/* Adjusted text size on md screens */}
          <h1 className="text-3xl md:text-xl font-bold">Login</h1>
          <p className="text-base md:text-sm text-muted-foreground">
            Enter your Student Number below to login to your account
          </p>
        </div>

        <LoginForm />

        <Link
          href="/reset"
          className="text-sm md:text-xs text-primary hover:underline mt-2"
        >
          Forgot Password?
        </Link>

        {/* Adjusted sponsor image size */}
        <Image
          src="/img/auth/sponsors-new.png"
          alt="Sponsors"
          width={350}
          height={350}
          className="w-52 h-52 md:w-40 md:h-40 mt-6"
        />
      </div>

      {/* Right section: Background image */}
      <div className="hidden md:block w-1/2 rounded-bl-[250px] md:rounded-bl-[150px] overflow-hidden">
        <Image
          src="/img/auth/auth.jpg"
          alt="Auth background"
          width={800}
          height={800}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
