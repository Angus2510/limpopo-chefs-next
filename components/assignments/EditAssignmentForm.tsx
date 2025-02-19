"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Assignment } from "@/types/assignments/assignments";
import { updateAssignment } from "@/lib/actions/assignments/updateAssignment";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

const QUESTION_TYPES = {
  SHORT_ANSWER: "short-answer",
  LONG_ANSWER: "long-answer",
  MULTIPLE_CHOICE: "multiple-choice",
  TRUE_FALSE: "true-false",
} as const;

interface EditAssignmentFormProps {
  assignment: Assignment;
  intakeGroups: any[];
  outcomes: any[];
}

interface Question {
  id: string;
  text: string;
  type: string;
  mark: string;
  correctAnswer: any;
  options: any[];
}

export default function EditAssignmentForm({
  assignment,
  intakeGroups,
  outcomes,
}: EditAssignmentFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: assignment.title,
    type: assignment.type,
    duration: assignment.duration,
    availableFrom: new Date(assignment.availableFrom)
      .toISOString()
      .split("T")[0],
    campus: assignment.campus,
    intakeGroups: assignment.intakeGroups,
    outcomes: assignment.outcome,
    questions: assignment.questions as Question[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleMultipleChoiceOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedQuestions = [...formData.questions];
    const question = updatedQuestions[questionIndex];
    const newOptions = [...question.options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], value };

    updatedQuestions[questionIndex] = {
      ...question,
      options: newOptions,
    };

    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleCorrectAnswerChange = (
    questionIndex: number,
    optionIndex: number
  ) => {
    const updatedQuestions = [...formData.questions];
    const question = updatedQuestions[questionIndex];

    updatedQuestions[questionIndex] = {
      ...question,
      correctAnswer: question.options[optionIndex].value,
    };

    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateAssignment(assignment.id, formData);
      toast({
        title: "Success",
        description: "Assignment updated successfully",
      });
      router.push("/admin/assignment");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <FormField
                name="title"
                render={() => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="type"
                render={() => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="test">Test</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  name="duration"
                  render={() => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={formData.duration}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              duration: parseInt(e.target.value),
                            })
                          }
                          required
                          min={1}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name="availableFrom"
                  render={() => (
                    <FormItem>
                      <FormLabel>Available From</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={formData.availableFrom}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              availableFrom: e.target.value,
                            })
                          }
                          required
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Questions</h3>
            <div className="space-y-6">
              {formData.questions.map((question, index) => (
                <div
                  key={question.id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <h4 className="font-medium">
                    Question {index + 1} ({question.mark} marks)
                  </h4>

                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Textarea
                        value={question.text}
                        onChange={(e) =>
                          handleQuestionChange(index, "text", e.target.value)
                        }
                        rows={3}
                      />
                    </FormControl>
                  </FormItem>

                  <div className="grid grid-cols-2 gap-4">
                    <FormItem>
                      <FormLabel>Mark</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={question.mark}
                          onChange={(e) =>
                            handleQuestionChange(index, "mark", e.target.value)
                          }
                          min={1}
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        value={question.type}
                        onValueChange={(value) =>
                          handleQuestionChange(index, "type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={QUESTION_TYPES.SHORT_ANSWER}>
                            Short Answer
                          </SelectItem>
                          <SelectItem value={QUESTION_TYPES.LONG_ANSWER}>
                            Long Answer
                          </SelectItem>
                          <SelectItem value={QUESTION_TYPES.MULTIPLE_CHOICE}>
                            Multiple Choice
                          </SelectItem>
                          <SelectItem value={QUESTION_TYPES.TRUE_FALSE}>
                            True/False
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  </div>

                  {question.type === QUESTION_TYPES.MULTIPLE_CHOICE && (
                    <div className="space-y-4">
                      <FormLabel>Options</FormLabel>
                      {question.options.map((option: any, optIndex: number) => (
                        <div key={optIndex} className="flex items-center gap-4">
                          <span className="w-6">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <Input
                            value={option.value}
                            onChange={(e) =>
                              handleMultipleChoiceOptionChange(
                                index,
                                optIndex,
                                e.target.value
                              )
                            }
                          />
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={question.correctAnswer === option.value}
                              onCheckedChange={() =>
                                handleCorrectAnswerChange(index, optIndex)
                              }
                            />
                            <span>Correct</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === QUESTION_TYPES.TRUE_FALSE && (
                    <FormItem>
                      <FormLabel>Correct Answer</FormLabel>
                      <Select
                        value={question.correctAnswer}
                        onValueChange={(value) =>
                          handleQuestionChange(index, "correctAnswer", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}

                  {(question.type === QUESTION_TYPES.SHORT_ANSWER ||
                    question.type === QUESTION_TYPES.LONG_ANSWER) && (
                    <FormItem>
                      <FormLabel>Model Answer</FormLabel>
                      <FormControl>
                        <Textarea
                          value={question.correctAnswer}
                          onChange={(e) =>
                            handleQuestionChange(
                              index,
                              "correctAnswer",
                              e.target.value
                            )
                          }
                          rows={
                            question.type === QUESTION_TYPES.LONG_ANSWER ? 4 : 2
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                </div>
              ))}
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
