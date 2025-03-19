"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";
import { getAllCampuses } from "@/lib/actions/campus/campuses";
import { getAllOutcomes } from "@/lib/actions/intakegroup/outcome/outcomeQuery";
import { toast } from "@/components/ui/use-toast";

interface SelectionFormProps {
  onSelectionComplete: (selection: {
    intakeGroupId: string;
    campusId: string;
    outcomeId: string;
  }) => void;
}

interface FormValues {
  intakeGroupId: string;
  campusId: string;
  outcomeId: string;
}

export function SelectionForm({ onSelectionComplete }: SelectionFormProps) {
  const [intakeGroups, setIntakeGroups] = useState<
    { id: string; title: string }[]
  >([]);
  const [campuses, setCampuses] = useState<{ id: string; title: string }[]>([]);
  const [outcomes, setOutcomes] = useState<
    { id: string; title: string; type: string; hidden: boolean }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue } = useForm<FormValues>();
  const selectedIntakeGroup = watch("intakeGroupId");
  const selectedCampus = watch("campusId");
  const selectedOutcome = watch("outcomeId");

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

        // Fetch outcomes
        const outcomesData = await getAllOutcomes();
        console.log("Outcomes loaded:", outcomesData);
        const visibleOutcomes = outcomesData.filter(
          (outcome) => !outcome.hidden
        );
        console.log("Visible outcomes:", visibleOutcomes);
        setOutcomes(visibleOutcomes);
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="intakeGroupId">Intake Group</Label>
              <Select
                disabled={isLoading}
                value={selectedIntakeGroup}
                onValueChange={(value) => setValue("intakeGroupId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select intake group" />
                </SelectTrigger>
                <SelectContent>
                  {intakeGroups.length > 0 ? (
                    intakeGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="none">
                      No intake groups available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="outcomeId">Outcome</Label>
              <Select
                disabled={isLoading}
                value={selectedOutcome}
                onValueChange={(value) => setValue("outcomeId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  {outcomes.length > 0 ? (
                    outcomes.map((outcome) => (
                      <SelectItem key={outcome.id} value={outcome.id}>
                        {outcome.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="none">
                      No outcomes available
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
            !selectedIntakeGroup ||
            !selectedCampus ||
            !selectedOutcome ||
            isLoading
          }
        >
          {isLoading ? "Loading..." : "Load Students"}
        </Button>
      </form>
    </div>
  );
}

export default SelectionForm;
