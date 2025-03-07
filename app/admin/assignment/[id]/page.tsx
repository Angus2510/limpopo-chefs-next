"use client";

import { useState, useEffect } from "react";
import { getAssignmentById } from "@/lib/actions/assignments/getAssignmentById";
import { getAssignmentAnswers } from "@/lib/actions/assignments/getAssignmentAnswers";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";
import { ContentLayout } from "@/components/layout/content-layout";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { notFound, useRouter } from "next/navigation";
import { EditQuestionModal } from "@/components/modals/EditQuestionModal";
import { updateQuestion } from "@/lib/actions/assignments/updateQuestion";

interface PageProps {
  params: { id: string } | Promise<{ id: string }>;
}

interface IntakeGroup {
  id: string;
  title: string;
}

interface Answer {
  id: string;
  question: string;
  answer: string | object | null;
  answeredAt: Date;
  scores: number | null;
  moderatedscores: number | null;
  student: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
  mark: string;
  correctAnswer?: any; // Added correctAnswer field
  options: {
    id: string;
    value?: string;
    columnA?: string;
    columnB?: string;
  }[];
}

interface Assignment {
  id: string;
  title: string;
  type: string;
  duration: number;
  password: string;
  availableFrom: Date;
  intakeGroups: string[];
  outcome: string[];
  questions: Question[];
}

export default function AssignmentViewPage({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [intakeGroups, setIntakeGroups] = useState<IntakeGroup[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [intakeGroupMap, setIntakeGroupMap] = useState<Map<string, string>>(
    new Map()
  );
  const [editingAnswer, setEditingAnswer] = useState<Answer | null>(null);

  useEffect(() => {
    loadData();
  }, [params]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log("🚀 Starting to load assessment page...");

      const resolvedParams = params instanceof Promise ? await params : params;
      const id = resolvedParams?.id;

      if (!id) {
        console.log("❌ No assessment ID provided");
        notFound();
        return;
      }

      const [assignmentData, answersData, intakeGroupsData] = await Promise.all(
        [
          getAssignmentById(id),
          getAssignmentAnswers(id).catch((err) => {
            console.error("Error fetching answers:", err);
            return [];
          }),
          getAllIntakeGroups(),
        ]
      );

      if (!assignmentData) {
        console.log("❌ Assessment not found");
        notFound();
        return;
      }

      const groupMap = new Map(
        intakeGroupsData.map((group) => [group.id, group.title])
      );

      setAssignment(assignmentData);
      setAnswers(answersData);
      setIntakeGroups(intakeGroupsData);
      setIntakeGroupMap(groupMap);

      // Debug info
      if (assignmentData.questions && assignmentData.questions.length > 0) {
        const firstQuestion = assignmentData.questions[0];
        console.log(`Debug - First question type: ${firstQuestion.type}`);
        console.log(
          `Debug - First question correctAnswer present: ${!!firstQuestion.correctAnswer}`
        );
      }

      console.log("✅ Data fetched successfully");
    } catch (error) {
      console.error("🔥 Error loading assignment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load assignment data",
      });
      notFound();
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionUpdate = async (updatedQuestion: Question) => {
    try {
      const result = await updateQuestion(updatedQuestion.id, {
        text: updatedQuestion.text,
        mark: updatedQuestion.mark,
        correctAnswer: updatedQuestion.correctAnswer,
        options: updatedQuestion.options,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update local state
      if (assignment) {
        const updatedQuestions = assignment.questions.map((q) =>
          q.id === updatedQuestion.id ? updatedQuestion : q
        );
        setAssignment({ ...assignment, questions: updatedQuestions });
      }

      toast({ description: "Question updated successfully" });
      setEditingQuestion(null);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to update question",
      });
    }
  };

  const handleAnswerUpdate = async (updatedAnswer: Answer) => {
    try {
      // Add your answer update logic here
      const result = await updateAnswer(updatedAnswer.id, {
        scores: updatedAnswer.scores,
        moderatedscores: updatedAnswer.moderatedscores,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update local state
      const updatedAnswers = answers.map((a) =>
        a.id === updatedAnswer.id ? updatedAnswer : a
      );
      setAnswers(updatedAnswers);

      toast({ description: "Answer updated successfully" });
      setEditingAnswer(null);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to update answer",
      });
    }
  };

  const renderQuestion = (question: Question, index: number) => {
    const questionAnswers = Array.isArray(answers)
      ? answers.filter((ans) => ans.question === question.id)
      : [];

    return (
      <div key={question.id} className="border p-4 rounded-lg">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold">
            Question {index + 1} ({question.mark} marks)
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingQuestion(question)}
          >
            Edit Question
          </Button>
        </div>
        <p className="mb-4">{question.text}</p>

        {/* Options Section */}
        {question.options && question.options.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Options:</h4>
            <div className="grid gap-2">
              {question.options.map((option) => (
                <div key={option.id} className="flex gap-2">
                  {option.value && (
                    <span className="text-sm">{option.value}</span>
                  )}
                  {option.columnA && option.columnB && (
                    <span className="text-sm">
                      {option.columnA} ➔ {option.columnB}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Correct Answer Section */}
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <h4 className="font-semibold text-green-700 mb-2">Correct Answer:</h4>
          {question.correctAnswer ? (
            <div className="text-sm">
              {typeof question.correctAnswer === "string" ? (
                <p>{question.correctAnswer}</p>
              ) : Array.isArray(question.correctAnswer) ? (
                <ul className="list-disc ml-5">
                  {question.correctAnswer.map((item, idx) => (
                    <li key={idx}>
                      {typeof item === "string"
                        ? item
                        : item.columnA && item.columnB
                        ? `${item.columnA} ➔ ${item.columnB}`
                        : JSON.stringify(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <pre className="whitespace-pre-wrap bg-muted p-2 rounded text-xs">
                  {JSON.stringify(question.correctAnswer, null, 2)}
                </pre>
              )}
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              No correct answer specified
            </p>
          )}
        </div>

        {/* Student Answers Section */}
        {questionAnswers.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Student Answers:</h4>
            <div className="space-y-2">
              {questionAnswers.map((answer) => (
                <div key={answer.id} className="p-2 bg-muted rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      Answered: {format(new Date(answer.answeredAt), "PPp")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Score: {answer.scores ?? "Not marked"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingAnswer(answer)}
                      >
                        Edit Score
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    {typeof answer.answer === "string" ? (
                      <p className="text-sm">{answer.answer}</p>
                    ) : (
                      <pre className="text-xs bg-muted p-2 rounded">
                        {JSON.stringify(answer.answer, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <ContentLayout title="Loading...">
        <div className="flex justify-center items-center h-48">
          Loading assessment...
        </div>
      </ContentLayout>
    );
  }

  if (!assignment) return null;

  return (
    <ContentLayout title={assignment.title}>
      <div className="container mx-auto py-6 space-y-6">
        {/* Assignment Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Details</CardTitle>
            <CardDescription>Overview and configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <p className="text-sm text-muted-foreground">Type:</p>
                    <p className="text-sm">{assignment.type}</p>
                    <p className="text-sm text-muted-foreground">Duration:</p>
                    <p className="text-sm">
                      {Math.floor(assignment.duration / 60)}h{" "}
                      {assignment.duration % 60}m
                    </p>
                    <p className="text-sm text-muted-foreground">Password:</p>
                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {assignment.password}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Scheduling</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <p className="text-sm text-muted-foreground">
                      Available From:
                    </p>
                    <p className="text-sm">
                      {format(new Date(assignment.availableFrom), "PPP 'at' p")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Access and Outcomes */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm">Intake Groups</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {assignment.intakeGroups.map((groupId) => (
                      <span
                        key={groupId}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                      >
                        {intakeGroupMap.get(groupId) || groupId}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Learning Outcomes</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {assignment.outcome.map((outcome) => (
                      <span
                        key={outcome}
                        className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full"
                      >
                        {outcome}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Questions & Submissions</CardTitle>
            <CardDescription>
              Total Questions: {assignment.questions?.length || 0} | Total
              Marks:{" "}
              {assignment.questions?.reduce(
                (acc, q) => acc + Number(q.mark),
                0
              ) || 0}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {assignment.questions?.map((question, index) =>
                renderQuestion(question, index)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Question Modal */}
      {editingQuestion && (
        <EditQuestionModal
          isOpen={!!editingQuestion}
          onClose={() => setEditingQuestion(null)}
          question={editingQuestion}
          onSave={handleQuestionUpdate}
        />
      )}

      {/* Edit Answer Modal */}
      {editingAnswer && (
        <EditAnswerModal
          isOpen={!!editingAnswer}
          onClose={() => setEditingAnswer(null)}
          answer={editingAnswer}
          onSave={handleAnswerUpdate}
        />
      )}
    </ContentLayout>
  );
}
