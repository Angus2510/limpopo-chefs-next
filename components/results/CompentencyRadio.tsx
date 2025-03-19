"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface CompetencyRadioProps {
  value: "competent" | "not_competent" | undefined;
  onChange: (value: "competent" | "not_competent") => void;
  disabled?: boolean;
}

export function CompetencyRadio({
  value,
  onChange,
  disabled = false,
}: CompetencyRadioProps) {
  return (
    <div className="space-y-2">
      <Label className="text-base font-medium">Competency Status</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange as (value: string) => void}
        disabled={disabled}
        className="flex flex-col space-y-1"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="competent" id="competent" />
          <Label
            htmlFor="competent"
            className={`${
              value === "competent" ? "font-semibold text-green-600" : ""
            }`}
          >
            Competent
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="not_competent" id="not_competent" />
          <Label
            htmlFor="not_competent"
            className={`${
              value === "not_competent" ? "font-semibold text-red-600" : ""
            }`}
          >
            Not Competent
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}

export default CompetencyRadio;
