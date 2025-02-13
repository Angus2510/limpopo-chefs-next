import LoginForm from "@/components/forms/auth/LoginForm";
import Image from "next/image";
import Link from "next/link"; // Import Link for navigation

export default function LoginPage() {
  return (
    <div className="w-full h-screen flex flex-col md:flex-row">
      {/* Left section: Login form */}
      <div className="flex flex-col items-center justify-center p-8 md:p-6 w-full lg:w-1/2">
        {/* Logo size adjusts only on md screens but remains large on lg */}
        <Image
          src="/img/logo.png"
          alt="Logo"
          width={250}
          height={250}
          className="w-48 h-48 md:w-40 md:h-40 lg:w-52 lg:h-52"
        />

        <div className="grid gap-2 text-center">
          {/* Adjusted text sizes so it's proportional */}
          <h1 className="text-3xl md:text-2xl lg:text-3xl font-bold">Login</h1>
          <p className="text-lg md:text-sm lg:text-base text-muted-foreground">
            Enter your Student Number below to login to your account
          </p>
        </div>

        <LoginForm />

        <Link
          href="/reset"
          className="text-sm md:text-xs lg:text-sm text-primary hover:underline mt-2"
        >
          Forgot Password?
        </Link>

        {/* Adjusted sponsor image size for md & lg */}
        <Image
          src="/img/auth/sponsors-new.png"
          alt="Sponsors"
          width={550}
          height={450}
          className="w-64 h-64 md:w-44 md:h-44 lg:w-60 lg:h-60 mt-6"
        />
      </div>

      {/* Right section: Background image, now proportional */}
      <div className="hidden md:block w-1/2 lg:w-2/3 rounded-bl-[250px] md:rounded-bl-[150px] lg:rounded-bl-[200px] overflow-hidden">
        <Image
          src="/img/auth/auth.jpg"
          alt="Auth background"
          width={1000}
          height={1000}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
