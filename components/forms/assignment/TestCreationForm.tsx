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

import DatePicker from "@/components/common/DatePicker";
import { AssignmentService } from "@/utils/assignmentServices"; // Import the service

const assignmentService = new AssignmentService(); // Instantiate service

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
  console.log("Rendering TestCreationForm Component");

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

  console.log("Form initialized with default values:", form.getValues());

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

  // Watch for changes
  console.log("Current Intake Group:", watch("intakeGroup"));
  console.log("Current Outcome:", watch("outcome"));
  console.log("Current Test DateTime:", watch("testDateTime"));

  const onSubmit = async (data: any) => {
    console.log("Submitting form with data:", data);

    const totalSeconds =
      data.duration.hours * 3600 +
      data.duration.minutes * 60 +
      data.duration.seconds;

    const formData = {
      title: data.title,
      type: data.type,
      duration: totalSeconds,
      availableFrom: new Date(data.testDateTime),
      availableUntil: null, // You can modify this if needed
      campus: [], // Assuming this needs to be handled dynamically
      intakeGroups: [data.intakeGroup],
      individualStudents: [], // Modify as necessary
      outcome: data.outcome,
      lecturer: "", // Assign appropriate lecturer ID
      questions: data.questions,
    };

    console.log("Final formData before submission:", formData);

    try {
      await assignmentService.createAssignment(formData);

      console.log("Assignment created successfully!");
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

      console.log("Form reset after submission");
    } catch (error) {
      console.error("Error during form submission:", error);
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            console.log("Form submit event triggered");
            e.preventDefault();
            handleSubmit(onSubmit)();
          }}
          className="space-y-6"
        >
          <CardHeader>
            <CardTitle className="w-full">Test Configuration</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
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
                      onValueChange={(value) => {
                        console.log("Intake Group changed to:", value);
                        setValue("intakeGroup", value);
                      }}
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
                      onValueChange={(value) => {
                        console.log("Outcome changed to:", value);
                        setValue("outcome", value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        {outcomes
                          .filter((outcome) => !outcome.hidden)
                          .map((outcome) => (
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

          {/* Question Management */}
          <AddQuestion
            newQuestion={newQuestion}
            setNewQuestion={setNewQuestion}
            addQuestion={(question) => {
              console.log("Adding question:", question);
              addQuestion(question);
            }}
            toast={toast}
          />
          <QuestionsList
            questionFields={questionFields}
            removeQuestion={(index) => {
              console.log("Removing question at index:", index);
              removeQuestion(index);
            }}
          />

          <div className="flex justify-end px-5 py-5">
            <Button
              type="submit"
              className="w-auto"
              onClick={() => console.log("Submit button clicked")}
            >
              Save Test
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default TestCreationForm;
