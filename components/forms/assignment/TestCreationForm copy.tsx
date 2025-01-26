"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { testFormSchema } from "@/schemas/assignment/testFormSchema"; // Ensure this schema is defined
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
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

const TestCreationForm: React.FC = () => {
  type FormData = {
    title: string;
    description: string;
    type: string;
    questions: {
      questionText: string;
      questionType: string;
      correctAnswer: string;
    }[];
  };

  const form = useForm<FormData>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
      questions: [],
    },
  });

  const { toast } = useToast();
  const { control, handleSubmit, reset } = form;

  // Manage the questions array
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

  const onSubmit = async (data: FormData) => {
    // Log form data including the test details and the questions array
    console.log("Form data:", data);

    try {
      // Simulate form submission
      toast({
        title: "Test created successfully",
        description: "The test data has been logged to the console.",
      });
      reset(); // Reset form fields
      setNewQuestion({
        questionText: "",
        questionType: "short-answer",
        correctAnswer: "",
      }); // Reset new question state
    } catch (error) {
      console.error("Error during form submission:", error);
      toast({
        title: "Failed to create test",
        description: "There was an error processing your request.",
      });
    }
  };

  const handleAddQuestion = () => {
    if (newQuestion.questionText) {
      addQuestion(newQuestion);
      setNewQuestion({
        questionText: "",
        questionType: "short-answer",
        correctAnswer: "",
      }); // Reset new question state
    } else {
      toast({
        title: "Please fill in the question text.",
        description: "Question text cannot be empty.",
      });
    }
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Test Details Section */}
          <div className="space-y-4">
            <CardHeader>
              <CardTitle>Test Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Test Title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Test Description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Test Type" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </div>

          {/* Add Question Section */}
          <div className="space-y-4">
            <CardHeader>
              <CardTitle>Add a Question</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Question Text</FormLabel>
                <FormControl>
                  <Input
                    value={newQuestion.questionText}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        questionText: e.target.value,
                      })
                    }
                    placeholder="Enter question text"
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>Question Type</FormLabel>
                <FormControl>
                  <Select
                    value={newQuestion.questionType}
                    onValueChange={(value) =>
                      setNewQuestion({ ...newQuestion, questionType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Question Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true-false">True/False</SelectItem>
                      <SelectItem value="short-answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>

              {newQuestion.questionType === "true-false" && (
                <FormItem>
                  <FormLabel>Correct Answer</FormLabel>
                  <FormControl>
                    <Select
                      value={newQuestion.correctAnswer}
                      onValueChange={(value) =>
                        setNewQuestion({ ...newQuestion, correctAnswer: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Correct Answer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}

              {newQuestion.questionType === "short-answer" && (
                <FormItem>
                  <FormLabel>Correct Answer</FormLabel>
                  <FormControl>
                    <Input
                      value={newQuestion.correctAnswer}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          correctAnswer: e.target.value,
                        })
                      }
                      placeholder="Enter correct answer"
                    />
                  </FormControl>
                </FormItem>
              )}

              <Button
                type="button"
                onClick={handleAddQuestion}
                className="sm:col-span-2"
              >
                Add Question
              </Button>
            </CardContent>
          </div>

          {/* Questions List Section */}
          <div className="space-y-4">
            <CardHeader>
              <CardTitle>Added Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {questionFields.length === 0 ? (
                <p>No questions added yet.</p>
              ) : (
                questionFields.map((question, index) => (
                  <div
                    key={question.id}
                    className="flex justify-between items-center mb-2"
                  >
                    <p>{`Q${index + 1}: ${question.questionText} (${
                      question.questionType
                    }) - Correct Answer: ${question.correctAnswer}`}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeQuestion(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </div>

          {/* Submit Button */}
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
