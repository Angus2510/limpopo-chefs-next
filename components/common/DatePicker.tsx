"use client";

import * as React from "react";
import { format, isValid, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface DatePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  description?: string;
  className?: string;
}

const DatePicker = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
}: DatePickerProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormControl>
            <Input
              type="date"
              {...field}
              value={
                field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""
              }
            />
          </FormControl>
          <FormMessage />
          {description && (
            <p className="mt-2 text-sm text-gray-500">{description}</p>
          )}
        </FormItem>
      )}
    />
  );
};

export default DatePicker;
