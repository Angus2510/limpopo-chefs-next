"use client";

import * as React from "react";
import { format, isValid, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

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
      render={({ field }) => {
        // Handle the date value conversion
        const date = field.value ? new Date(field.value) : null;
        const isValidDate = date ? isValid(date) : false;

        return (
          <div className={cn("flex flex-col", className)}>
            {label && (
              <label className="mb-2 text-sm font-medium">{label}</label>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !isValidDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {isValidDate ? format(date!, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={isValidDate ? date : undefined}
                  onSelect={(newDate) => {
                    field.onChange(newDate ? newDate.toISOString() : null);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {description && (
              <p className="mt-2 text-sm text-gray-500">{description}</p>
            )}
          </div>
        );
      }}
    />
  );
};

export default DatePicker;
