"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/common/multiselect";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";
import { getAllCampuses } from "@/lib/actions/campus/campuses";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectionFormProps {
  onSelectionComplete: (selection: {
    intakeGroupId: string[];
    campusId: string;
  }) => void;
}

interface FormValues {
  intakeGroupId: string[];
  campusId: string;
}

export function SelectionForm({ onSelectionComplete }: SelectionFormProps) {
  const [intakeGroups, setIntakeGroups] = useState<
    { id: string; title: string }[]
  >([]);
  const [campuses, setCampuses] = useState<{ id: string; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue } = useForm<FormValues>({
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
        // Fetch intake groups
        const intakeGroupsData = await getAllIntakeGroups();
        console.log("Intake groups loaded:", intakeGroupsData);
        setIntakeGroups(intakeGroupsData);

        // Fetch campuses
        const campusesData = await getAllCampuses();
        console.log("Campuses loaded:", campusesData);
        setCampuses(campusesData);
      } catch (error) {
        console.error("Error fetching data:", error);
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

  const onSubmit = (data: FormValues) => {
    onSelectionComplete(data);
  };

  return (
    <div className="space-y-4">
      {loadingError && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          {loadingError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Intake Group MultiSelect */}
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
                disabled={isLoading}
                maxCount={5}
              />
            </div>

            {/* Campus Select */}
            <div className="space-y-2">
              <Label htmlFor="campusId">Campus</Label>
              <Select
                disabled={isLoading}
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
        </div>

        <Button
          type="submit"
          disabled={
            !selectedIntakeGroups.length || !selectedCampus || isLoading
          }
        >
          {isLoading ? "Loading..." : "Load Students"}
        </Button>
      </form>
    </div>
  );
}

export default SelectionForm;
