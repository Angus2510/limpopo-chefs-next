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
import { Input } from "@/components/ui/input";
import DatePicker from "@/components/common/DatePicker";

// Updated interfaces to match Prisma models
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

      type: "",
      intakeGroup: "",
      outcome: "",
      duration: {
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
      testDateTime: undefined,
      questions: [],
    },
  });

  const { toast } = useToast();
  const { control, handleSubmit, reset } = form;

  // Handle intake group change
  const onChangeIntakeGroup = (value: string) => {
    form.setValue("intakeGroup", value);
  };

  // Handle outcome change
  const onChangeOutcome = (value: string) => {
    form.setValue("outcome", value);
  };

  // Rest of the component logic...
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

  const onSubmit = async (data: any) => {
    const totalSeconds =
      data.duration.hours * 3600 +
      data.duration.minutes * 60 +
      data.duration.seconds;

    const formData = {
      ...data,
      duration: totalSeconds,
      testDateTime: data.testDateTime?.toISOString(),
    };

    try {
      toast({
        title: "Test created successfully",
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
        title: "Failed to create test",
        description: "There was an error processing your request.",
      });
    }
  };

  // Filter out hidden outcomes
  const visibleOutcomes = outcomes.filter((outcome) => !outcome.hidden);

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <CardHeader>
              <CardTitle className="w-full">Test Configuration</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              <div className="col-span-2 ">
                <TestDetails control={control} />
              </div>

              {/* Intake Group Selection */}
              <FormField
                control={control}
                name="intakeGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intake Group</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={onChangeIntakeGroup}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Intake Group" />
                        </SelectTrigger>
                        <SelectContent>
                          {intakeGroups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Outcome Selection */}
              <FormField
                control={control}
                name="outcome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Outcome</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={onChangeOutcome}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Outcome" />
                        </SelectTrigger>
                        <SelectContent>
                          {visibleOutcomes.map((outcome) => (
                            <SelectItem key={outcome.id} value={outcome.id}>
                              {outcome.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Test Duration */}
              <div className="sm:col-span-2">
                <FormLabel>Test Duration</FormLabel>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={control}
                    name="duration.hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            placeholder="Hours"
                            onChange={(e) =>
                              setValue(
                                "duration.hours",
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="duration.minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            max="59"
                            placeholder="Minutes"
                            onChange={(e) =>
                              setValue(
                                "duration.minutes",
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="duration.seconds"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            max="59"
                            placeholder="Seconds"
                            onChange={(e) =>
                              setValue(
                                "duration.seconds",
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

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
          </div>

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
              Save Test
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default TestCreationForm;
