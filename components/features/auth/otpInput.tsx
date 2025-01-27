"use client";

import { useState } from "react";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface OtpInputProps {
  onOtpChange: (otp: string) => void;
}

export default function OtpInput({ onOtpChange }: OtpInputProps) {
  const [, setOtp] = useState<string>("");

  const handleOtpChange = (value: string) => {
    setOtp(value);
    onOtpChange(value);
  };

  return (
    <InputOTP
      maxLength={6}
      pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
      onChange={handleOtpChange}
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}
