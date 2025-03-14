import ResetPasswordForm from "@/components/forms/auth/ResetForm";

export default function ResetPasswordPage() {
  return (
    <div className="w-full h-full  ">
      {/* Left section: Reset Password form */}
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Reset Password</h1>
            <p className="text-balance text-muted-foreground">
              Enter the pin sent to your e-mail below.
            </p>
          </div>
          <ResetPasswordForm />
        </div>
      </div>
      {/* Right section: Background image or illustration */}
      <div className="hidden bg-muted lg:block">
        {/* <Image
          src="/placeholder.svg"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        /> */}
      </div>
    </div>
  );
}
