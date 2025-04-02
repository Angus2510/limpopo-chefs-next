"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import WelLocationSelect from "./WelLocationSelect";
import { addWelHours } from "@/lib/actions/wels/addWelHours";

const formSchema = z.object({
  welId: z.string({
    required_error: "Please select where the student worked",
  }),
  startDate: z.string({
    required_error: "When did they start working?",
  }),
  endDate: z.string({
    required_error: "When did they finish working?",
  }),
  totalHours: z
    .string({
      required_error: "How many hours did they work?",
    })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Hours must be a positive number",
    }),
  establishmentContact: z.string({
    required_error: "Who was their supervisor?",
  }),
  evaluated: z.boolean().default(false),
});

interface WelHoursFormProps {
  studentId: string;
}

const WelHoursForm = ({ studentId }: WelHoursFormProps) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      welId: "",
      startDate: "",
      endDate: "",
      totalHours: "",
      establishmentContact: "",
      evaluated: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!studentId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No student selected",
        });
        return;
      }

      const formData: WelHoursData = {
        studentId,
        welId: values.welId,
        startDate: values.startDate,
        endDate: values.endDate,
        totalHours: values.totalHours,
        establishmentContact: values.establishmentContact,
        evaluated: values.evaluated,
      };

      const result = await addWelHours(formData);

      if (result.success) {
        toast({
          title: "Success",
          description: "WEL hours added successfully",
        });
        form.reset();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to add WEL hours",
        });
      }
    } catch (error) {
      console.error("Error submitting WEL hours:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-2xl font-bold">Add WEL Hours</h2>

        <FormField
          control={form.control}
          name="welId"
          render={({ field }) => (
            <FormItem>
              <WelLocationSelect
                onSelect={(welId) => field.onChange(welId)}
                selectedWel={field.value}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="totalHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Hours</FormLabel>
              <FormControl>
                <Input type="number" min="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="establishmentContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Establishment Contact</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="evaluated"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Evaluated</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Submit WEL Hours
        </Button>
      </form>
    </Form>
  );
};

export default WelHoursForm;
