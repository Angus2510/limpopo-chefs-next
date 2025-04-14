"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/common/multiselect";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";
import { getAllCampuses } from "@/lib/actions/campus/campuses";
import { getStudentsByIntakeAndCampus } from "@/lib/actions/student/getStudentsByIntakeAndCampus";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GraduateSelectionFormProps {
  onSelectionComplete: (selection: {
    intakeGroupId: string[];
    campusId: string;
  }) => void;
}

interface FormValues {
  intakeGroupId: string[];
  campusId: string;
}

export function GraduateSelectionForm({
  onSelectionComplete,
}: GraduateSelectionFormProps) {
  const [intakeGroups, setIntakeGroups] = useState<
    { id: string; title: string }[]
  >([]);
  const [campuses, setCampuses] = useState<{ id: string; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      intakeGroupId: [],
      campusId: "",
    },
  });

  const selectedIntakeGroups = watch("intakeGroupId");
  const selectedCampus = watch("campusId");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setLoadingError(null);

      try {
        const [intakeGroupsData, campusesData] = await Promise.all([
          getAllIntakeGroups(),
          getAllCampuses(),
        ]);

        if (!intakeGroupsData?.length) {
          throw new Error("No intake groups found");
        }

        if (!campusesData?.length) {
          throw new Error("No campuses found");
        }

        setIntakeGroups(intakeGroupsData);
        setCampuses(campusesData);
      } catch (error) {
        console.error("Error fetching form data:", error);
        setLoadingError(
          "Failed to load selection data. Please refresh the page."
        );
        toast({
          title: "Error loading data",
          description: "Could not load selection options. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Form submitted with data:", data);

      // Validate selection
      if (!data.intakeGroupId.length || !data.campusId) {
        throw new Error("Please select both intake group and campus");
      }

      // Fetch students using the utility function
      const students = await getStudentsByIntakeAndCampus(
        data.intakeGroupId,
        data.campusId
      );

      if (!students?.length) {
        toast({
          title: "No Students Found",
          description: "No students found for the selected criteria.",
          variant: "default",
        });
      }

      // Pass the selection to parent component
      onSelectionComplete(data);
    } catch (error) {
      console.error("Error processing selection:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to process selection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {loadingError && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          {loadingError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="intakeGroupId">Intake Groups</Label>
            <MultiSelect
              options={intakeGroups.map((group) => ({
                label: group.title,
                value: group.id,
              }))}
              defaultValue={[]}
              onValueChange={(values) => setValue("intakeGroupId", values)}
              placeholder="Select intake groups..."
              disabled={isLoading || isSubmitting}
              maxCount={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campusId">Campus</Label>
            <Select
              disabled={isLoading || isSubmitting}
              value={selectedCampus}
              onValueChange={(value) => setValue("campusId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select campus" />
              </SelectTrigger>
              <SelectContent>
                {campuses.length > 0 ? (
                  campuses.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id}>
                      {campus.title}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value="none">
                    No campuses available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          type="submit"
          disabled={
            !selectedIntakeGroups.length ||
            !selectedCampus ||
            isLoading ||
            isSubmitting
          }
          className="w-full md:w-auto"
        >
          {isSubmitting ? "Loading Students..." : "Load Students"}
        </Button>
      </form>
    </div>
  );
}
