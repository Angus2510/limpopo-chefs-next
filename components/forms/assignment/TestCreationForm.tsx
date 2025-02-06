"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { testFormSchema } from "@/schemas/assignment/testFormSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import TestDetails from "./TestDetails";
import AddQuestion from "./AddQuestion";
import QuestionsList from "./QuestionsList";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

import DatePicker from "@/components/common/DatePicker";
import { AssignmentService } from "@/utils/assignmentServices";

const assignmentService = new AssignmentService();

const ASSIGNMENT_TYPES = {
  TEST: "test",
  TASK: "task",
} as const;

type AssignmentType = (typeof ASSIGNMENT_TYPES)[keyof typeof ASSIGNMENT_TYPES];

// Create an array of hours for the dropdown (0-24)
const HOURS_OPTIONS = Array.from({ length: 25 }, (_, i) => ({
  value: i.toString(),
  label: i === 1 ? "1 hour" : `${i} hours`,
}));

// Create an array of minutes for the dropdown (0-59)
const MINUTES_OPTIONS = Array.from({ length: 60 }, (_, i) => ({
  value: i.toString(),
  label: i === 1 ? "1 minute" : `${i} minutes`,
}));

interface IntakeGroup {
  id: string;
  title: string;
}

interface Outcome {
  id: string;
  title: string;
  type: string;
  hidden: boolean;
  campus: string[];
}

interface TestCreationFormProps {
  intakeGroups: IntakeGroup[];
  outcomes: Outcome[];
}

const TestCreationForm: React.FC<TestCreationFormProps> = ({
  intakeGroups,
  outcomes,
}) => {
  const form = useForm({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      title: "",
      type: ASSIGNMENT_TYPES.TEST, // Default to test
      intakeGroups: [],
      outcomes: [],
      duration: {
        hours: "1", // Default to 1 hour
        minutes: "0", // Default to 0 minutes
      },
      testDateTime: undefined,
      questions: [],
    },
  });

  const { toast } = useToast();
  const { control, handleSubmit, reset, setValue, watch } = form;

  const {
    fields: questionFields,
    append: addQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: "questions",
  });

  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    questionType: "short-answer",
    correctAnswer: "",
  });

  // Watch for changes in fields
  const selectedIntakeGroups = watch("intakeGroups") || [];
  const selectedOutcomes = watch("outcomes") || [];
  const selectedType = watch("type");
  const duration = watch("duration");

  const onSubmit = async (data: any) => {
    // Convert duration to total minutes for API
    const totalMinutes =
      parseInt(data.duration.hours) * 60 + parseInt(data.duration.minutes);

    const formData = {
      title: data.title,
      type: data.type,
      duration: totalMinutes,
      availableFrom: new Date(data.testDateTime),
      availableUntil: null,
      campus: [],
      intakeGroups: data.intakeGroups,
      individualStudents: [],
      outcomes: data.outcomes,
      lecturer: "",
      questions: data.questions,
    };

    try {
      await assignmentService.createAssignment(formData);
      toast({
        title: "Success",
        description: "Assignment created successfully",
      });
      reset();
      setNewQuestion({
        questionText: "",
        questionType: "short-answer",
        correctAnswer: "",
      });
    } catch (error) {
      console.error("Error during form submission:", error);
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive",
      });
    }
  };

  const removeSelected = (field: string, value: string) => {
    const currentValues = watch(field) || [];
    setValue(
      field,
      currentValues.filter((v: string) => v !== value)
    );
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <CardHeader>
            <CardTitle className="w-full">Test Configuration</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <TestDetails control={control} />
            </div>

            {/* Assignment Type Selection */}
            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ASSIGNMENT_TYPES.TEST}>
                        Test
                      </SelectItem>
                      <SelectItem value={ASSIGNMENT_TYPES.TASK}>
                        Task
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration Controls */}
            <div className="flex flex-col space-y-2">
              <FormLabel>Time Limit</FormLabel>
              <div className="flex space-x-2">
                <FormField
                  control={control}
                  name="duration.hours"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Hours" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {HOURS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="duration.minutes"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Minutes" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MINUTES_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Multi-select Intake Groups */}
            <FormField
              control={control}
              name="intakeGroups"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Intake Groups</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={`w-full justify-between ${
                            !field.value?.length && "text-muted-foreground"
                          }`}
                        >
                          {field.value?.length > 0
                            ? `${field.value.length} groups selected`
                            : "Select intake groups"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search intake groups..." />
                        <CommandEmpty>No intake group found.</CommandEmpty>
                        <CommandGroup>
                          {intakeGroups.map((group) => (
                            <CommandItem
                              key={group.id}
                              onSelect={() => {
                                const current = field.value || [];
                                const updated = current.includes(group.id)
                                  ? current.filter(
                                      (id: string) => id !== group.id
                                    )
                                  : [...current, group.id];
                                setValue("intakeGroups", updated);
                              }}
                            >
                              {group.title}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedIntakeGroups.map((groupId: string) => {
                      const group = intakeGroups.find((g) => g.id === groupId);
                      return (
                        <Badge
                          key={groupId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {group?.title}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() =>
                              removeSelected("intakeGroups", groupId)
                            }
                          />
                        </Badge>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Multi-select Outcomes */}
            <FormField
              control={control}
              name="outcomes"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Outcomes</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={`w-full justify-between ${
                            !field.value?.length && "text-muted-foreground"
                          }`}
                        >
                          {field.value?.length > 0
                            ? `${field.value.length} outcomes selected`
                            : "Select outcomes"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search outcomes..." />
                        <CommandEmpty>No outcome found.</CommandEmpty>
                        <CommandGroup>
                          {outcomes
                            .filter((outcome) => !outcome.hidden)
                            .map((outcome) => (
                              <CommandItem
                                key={outcome.id}
                                onSelect={() => {
                                  const current = field.value || [];
                                  const updated = current.includes(outcome.id)
                                    ? current.filter(
                                        (id: string) => id !== outcome.id
                                      )
                                    : [...current, outcome.id];
                                  setValue("outcomes", updated);
                                }}
                              >
                                {outcome.title}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedOutcomes.map((outcomeId: string) => {
                      const outcome = outcomes.find((o) => o.id === outcomeId);
                      return (
                        <Badge
                          key={outcomeId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {outcome?.title}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() =>
                              removeSelected("outcomes", outcomeId)
                            }
                          />
                        </Badge>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Test Date and Time */}
            <FormField
              control={control}
              name="testDateTime"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Test Date and Time</FormLabel>
                  <DatePicker
                    control={control}
                    name="testDateTime"
                    label="Test Date and Time"
                    showTime={true}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <AddQuestion
            newQuestion={newQuestion}
            setNewQuestion={setNewQuestion}
            addQuestion={addQuestion}
            toast={toast}
          />
          <QuestionsList
            questionFields={questionFields}
            removeQuestion={removeQuestion}
          />

          <div className="flex justify-end px-5 py-5">
            <Button type="submit" className="w-auto">
              Save {selectedType === ASSIGNMENT_TYPES.TEST ? "Test" : "Task"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default TestCreationForm;
