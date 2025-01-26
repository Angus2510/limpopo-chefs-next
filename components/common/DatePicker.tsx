"use client";

import * as React from "react";
import { format, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Control, Controller } from "react-hook-form";

interface DatePickerProps {
  control: Control<Record<string, any>>;
  name: string;
  label: string;
  description?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  control,
  name,
  description,
}) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-col">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !field.value && "text-muted-foreground"
                )}
              >
                {field.value && isValid(new Date(field.value)) ? (
                  format(new Date(field.value), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {description && (
            <p className="mt-2 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
    />
  );
};

export default DatePicker;
