"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { testFormSchema } from "@/schemas/assignment/testFormSchema";
import { useToast } from "@/components/ui/use-toast";
import { createAssignment } from "@/lib/actions/assignments/createAssignment";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import TestDetails from "./TestDetails";
import AddQuestion from "./AddQuestion";
import QuestionsList from "./QuestionsList";
import DatePicker from "@/components/common/DatePicker";
import { ScrollArea } from "@/components/ui/scroll-area";

// Constants
const ASSIGNMENT_TYPES = {
  TEST: "test",
  TASK: "task",
} as const;

const HOURS_OPTIONS = Array.from({ length: 4 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} Hour${i > 0 ? "s" : ""}`,
}));

const MINUTES_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i * 5),
  label: `${i * 5} Minutes`,
}));

// Interfaces
interface TestCreationFormProps {
  intakeGroups: Array<{
    id: string;
    title: string;
  }>;
  outcomes: Array<{
    id: string;
    title: string;
    hidden: boolean;
  }>;
}

interface Question {
  questionText: string; // Changed from text
  questionType: string; // Changed from type
  mark: string;
  correctAnswer: string;
  options: Array<{
    value?: string;
    columnA?: string;
    columnB?: string;
  }>;
}

interface FormValues {
  title: string;
  type: "test" | "task";
  intakeGroups: string[];
  outcomes: string[];
  duration: {
    hours: string;
    minutes: string;
  };
  testDateTime: string;
  questions: Question[];
}

// Add this interface after your existing interfaces
interface AssignmentDataPayload {
  title: string;
  type: "test" | "task";
  duration: number;
  availableFrom: string;
  availableUntil: null;
  campus: string[];
  intakeGroups: string[];
  individualStudents: string[];
  outcomes: string[];
  lecturer: string;
  questions: {
    text: string;
    type: string;
    mark: string;
    correctAnswer: string;
    options: Array<{
      value?: string;
      columnA?: string;
      columnB?: string;
    }>;
  }[];
}

interface MarkSummary {
  totalMarks: number;
  questionCount: number;
}
// Main Component
const TestCreationForm: React.FC<TestCreationFormProps> = ({
  intakeGroups,
  outcomes,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Setup
  const form = useForm<FormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      title: "",
      type: ASSIGNMENT_TYPES.TEST,
      intakeGroups: [],
      outcomes: [],
      duration: { hours: "1", minutes: "0" },
      testDateTime: new Date().toISOString(),
      questions: [],
    },
  });

  const { control, setValue, watch, handleSubmit, reset } = form;

  // Questions Array Management
  const {
    fields: questionFields,
    append: addQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: "questions",
  });

  // Question State
  const [newQuestion, setNewQuestion] = useState<Question>({
    questionText: "",
    questionType: "short-answer",
    mark: "1",
    correctAnswer: "",
    options: [],
  });

  // Watched Fields
  const selectedType = watch("type");
  const selectedIntakeGroups = watch("intakeGroups") || [];
  const selectedOutcomes = watch("outcomes") || [];

  // Remove Selected Items Handler
  const removeSelected = (field: "intakeGroups" | "outcomes", id: string) => {
    const current = form.getValues(field);
    setValue(
      field,
      current.filter((currentId: string) => currentId !== id)
    );
  };

  const calculateMarkSummary = (questions: Question[]): MarkSummary => {
    return questions.reduce(
      (acc, question) => ({
        totalMarks: acc.totalMarks + parseInt(question.mark || "0", 10),
        questionCount: acc.questionCount + 1,
      }),
      { totalMarks: 0, questionCount: 0 }
    );
  };

  // Form Submission
  // Update the onSubmit function
  // In TestCreationForm.tsx, update the onSubmit function
  const onSubmit = async (data: FormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const assignmentData = {
        title: data.title.trim(),
        type: data.type,
        duration:
          parseInt(data.duration.hours) * 60 + parseInt(data.duration.minutes),
        availableFrom: new Date(data.testDateTime).toISOString(),
        availableUntil: null,
        campus: [],
        intakeGroups: data.intakeGroups || [],
        individualStudents: [],
        outcomes: data.outcomes || [],
        lecturer: "", // Remove SYSTEM - will be handled by server action
        questions: data.questions.map((q) => ({
          text: q.questionText.trim(),
          type: q.questionType,
          mark: q.mark || "1",
          correctAnswer: q.correctAnswer || "",
          options: Array.isArray(q.options) ? q.options : [],
        })),
      };

      const result = await createAssignment(assignmentData);

      if (!result.success) {
        throw new Error(result.message || "Failed to create assignment");
      }

      toast({
        title: "Success",
        description: `Assignment created successfully${
          result.data?.testPassword
            ? `. Password: ${result.data.testPassword}`
            : ""
        }`,
      });

      form.reset();
      router.refresh();
      router.push("/admin/assignment");
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create assignment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <Form {...form}>
        <div className="space-y-6">
          <CardHeader>
            <CardTitle>Assessment Configuration</CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-4">
            {/* Test Title */}
            <div className="col-span-2">
              <TestDetails control={control} />
            </div>

            {/* Assignment Type Selection */}
            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment Type</FormLabel>
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

            {/* Time Limit */}
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
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Intake Groups */}
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
                        <ScrollArea className="h-[200px]">
                          {" "}
                          {/* Add ScrollArea here */}
                          <CommandGroup>
                            {intakeGroups.map((group) => (
                              <CommandItem
                                key={group.id}
                                onSelect={() => {
                                  const current = field.value || [];
                                  const updated = current.includes(group.id)
                                    ? current.filter((id) => id !== group.id)
                                    : [...current, group.id];
                                  setValue("intakeGroups", updated);
                                }}
                              >
                                {group.title}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </ScrollArea>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedIntakeGroups.map((groupId) => {
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

            {/* Outcomes */}
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
                                    ? current.filter((id) => id !== outcome.id)
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
                    {selectedOutcomes.map((outcomeId) => {
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
                    showTime={true}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          {/* Question Management */}
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
          <div className="px-6 py-4 bg-muted/50 rounded-lg mx-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="font-semibold">Assessment Summary</h3>
                <div className="text-sm text-muted-foreground">
                  {calculateMarkSummary(questionFields).questionCount} Questions
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Total Marks:</span>
                <Badge variant="secondary" className="text-base px-3">
                  {calculateMarkSummary(questionFields).totalMarks}
                </Badge>
              </div>
            </div>
          </div>
          {/* Submit Button */}
          <div className="flex justify-end px-5 py-5">
            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              className="w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : `Save ${selectedType === "test" ? "Test" : "Task"}`}
            </Button>
          </div>
        </div>
      </Form>
    </Card>
  );
};

export default TestCreationForm;
