"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { MultiSelect } from "@/components/common/multiselect";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Assignment } from "@/types/assignments/assignments";
import { updateAssignment } from "@/lib/actions/assignments/updateAssignment";
import { getAllCampuses, type Campus } from "@/lib/actions/campus/campuses";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";
import { generateRandomPassword } from "@/utils/password";

interface FormValues {
  duration: number;
  availableFrom: string;
  campus: string[];
  intakeGroups: string[];
  password: string;
}

interface EditAssignmentFormProps {
  assignment: Assignment;
}

export default function EditAssignmentForm({
  assignment,
}: EditAssignmentFormProps) {
  const router = useRouter();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [intakeGroups, setIntakeGroups] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      duration: assignment.duration,
      availableFrom: new Date(assignment.availableFrom)
        .toISOString()
        .split("T")[0],
      campus: assignment.campus,
      intakeGroups: assignment.intakeGroups,
      password: generateRandomPassword(),
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [campusData, intakeGroupData] = await Promise.all([
          getAllCampuses(),
          getAllIntakeGroups(),
        ]);
        setCampuses(campusData);
        setIntakeGroups(intakeGroupData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load form data",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, []);

  // Update the onSubmit function
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      const formattedDate = new Date(values.availableFrom);
      formattedDate.setUTCHours(12, 0, 0, 0);

      const formattedData = {
        duration: Number(values.duration),
        availableFrom: formattedDate,
        campus: values.campus || [],
        intakeGroups: values.intakeGroups || [],
        password: values.password,
      };

      console.log("Submitting data:", formattedData);

      const result = await updateAssignment(assignment.id, formattedData);

      if (!result) {
        throw new Error("Failed to update assignment");
      }

      toast({
        title: "Success",
        description: "Assessment updated successfully",
      });

      router.refresh();
      router.push("/admin/assignment");
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update assignment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const campusOptions = campuses.map((campus) => ({
    label: campus.title,
    value: campus.title,
  }));

  const intakeGroupOptions = intakeGroups.map((group) => ({
    label: group.title,
    value: group.id,
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                          required
                          min={1}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="availableFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available From</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value}
                          onChange={(e) => {
                            const newDate = e.target.value;
                            field.onChange(newDate);
                          }}
                          required
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input type="text" {...field} readOnly required />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            form.setValue("password", generateRandomPassword())
                          }
                        >
                          Generate
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="intakeGroups"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intake Groups</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={intakeGroupOptions}
                          defaultValue={field.value}
                          onValueChange={(value) => field.onChange(value)}
                          placeholder="Select intake groups"
                          maxCount={5}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="campus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campus</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={campusOptions}
                          defaultValue={field.value}
                          onValueChange={(value) => field.onChange(value)}
                          placeholder="Select campuses"
                          maxCount={3}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
