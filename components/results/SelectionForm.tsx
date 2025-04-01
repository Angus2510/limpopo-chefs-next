"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/common/multiselect";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";
import { getAllCampuses } from "@/lib/actions/campus/campuses";
import { getAllOutcomes } from "@/lib/actions/intakegroup/outcome/outcomeQuery";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
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
    outcomeId: string;
  }) => void;
}

interface FormValues {
  intakeGroupId: string[];
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
  const [outcomeOpen, setOutcomeOpen] = useState(false);

  const { register, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      intakeGroupId: [],
      campusId: "",
      outcomeId: "",
    },
  });

  const selectedIntakeGroups = watch("intakeGroupId");
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

            {/* Outcome Searchable Select */}
            <div className="space-y-2">
              <Label htmlFor="outcomeId">Outcome</Label>
              <Popover open={outcomeOpen} onOpenChange={setOutcomeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={outcomeOpen}
                    className="w-full justify-between"
                    disabled={isLoading}
                  >
                    {selectedOutcome
                      ? outcomes.find(
                          (outcome) => outcome.id === selectedOutcome
                        )?.title
                      : "Select outcome..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search outcomes..." />
                    <CommandEmpty>No outcome found.</CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-auto">
                      {outcomes.map((outcome) => (
                        <CommandItem
                          key={outcome.id}
                          value={outcome.title}
                          onSelect={() => {
                            setValue("outcomeId", outcome.id);
                            setOutcomeOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedOutcome === outcome.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {outcome.title}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={
            !selectedIntakeGroups.length ||
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
