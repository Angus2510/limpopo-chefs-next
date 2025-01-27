"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import OtpInput from "@/components/features/auth/otpInput";
import { ButtonLoading } from "@/components/common/ButtonLoading";

// Define the validation schema using Zod
const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

// Define the form data type
type OTPFormData = z.infer<typeof otpSchema>;

export default function ResetPasswordForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  const [isLoading] = useState<boolean>(false);

  const onSubmit = async (data: OTPFormData) => {
    // Handle OTP submission logic here
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 flex flex-col items-center"
    >
      <Controller
        name="otp"
        control={control}
        defaultValue=""
        render={() => (
          <OtpInput
            onOtpChange={(newOtp) => {
              setValue("otp", newOtp);
            }}
          />
        )}
      />
      {errors.otp && (
        <p className="text-red-600 text-center">{errors.otp.message}</p>
      )}
      <ButtonLoading isLoading={isLoading}>Reset</ButtonLoading>
    </form>
  );
}
