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
import { notFound } from "next/navigation";

// Define interfaces for type safety
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

export default async function AssignmentViewPage({ params }: PageProps) {
  console.log("🚀 Starting to load assignment page...");

  // Fix 1: Properly resolve params and never access params.id directly
  const resolvedParams = params instanceof Promise ? await params : params;
  const id = resolvedParams?.id;

  if (!id) {
    console.log("❌ No assignment ID provided");
    notFound();
  }

  try {
    console.log("🔍 Fetching assignment data...");

    // Fix 2: Use proper error handling for each Promise
    // Get assignment data
    const assignmentPromise = getAssignmentById(id);

    // Try to get answers safely
    let answersPromise;
    try {
      answersPromise = getAssignmentAnswers(id).catch((err) => {
        console.error("Error fetching answers:", err);
        return []; // Return empty array on error
      });
    } catch (error) {
      console.error("Error setting up answers promise:", error);
      answersPromise = Promise.resolve([]);
    }

    const intakeGroupsPromise = getAllIntakeGroups();

    // Wait for all promises
    const [assignment, answers, intakeGroups] = await Promise.all([
      assignmentPromise,
      answersPromise,
      intakeGroupsPromise,
    ]);

    if (!assignment) {
      console.log("❌ Assignment not found");
      notFound();
    }

    // Create a map for intake group lookups
    const intakeGroupMap = new Map(
      intakeGroups.map((group) => [group.id, group.title])
    );

    console.log("✅ Data fetched successfully");

    // Debug info for correctAnswer
    if (assignment.questions && assignment.questions.length > 0) {
      const firstQuestion = assignment.questions[0];
      console.log(`Debug - First question type: ${firstQuestion.type}`);
      console.log(
        `Debug - First question correctAnswer present: ${!!firstQuestion.correctAnswer}`
      );
      console.log(
        `Debug - First question correctAnswer type: ${typeof firstQuestion.correctAnswer}`
      );
    }

    return (
      <ContentLayout title={assignment.title}>
        <div className="container mx-auto py-6 space-y-6">
          {/* Assignment Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
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
                        {format(
                          new Date(assignment.availableFrom),
                          "PPP 'at' p"
                        )}
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
                {assignment.questions?.map((question, index) => {
                  // Safely attempt to filter answers - if answers is undefined, use empty array
                  const questionAnswers = Array.isArray(answers)
                    ? answers.filter((ans) => ans.question === question.id)
                    : [];

                  return (
                    <div key={question.id} className="border p-4 rounded-lg">
                      <h3 className="font-bold mb-2">
                        Question {index + 1} ({question.mark} marks)
                      </h3>
                      <p className="mb-4">{question.text}</p>

                      {question.options && question.options.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Options:</h4>
                          <div className="grid gap-2">
                            {question.options.map((option) => (
                              <div key={option.id} className="flex gap-2">
                                {option.value && (
                                  <span className="text-sm">
                                    {option.value}
                                  </span>
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

                      {/* Display the correct answer - NEW SECTION */}
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                        <h4 className="font-semibold text-green-700 mb-2">
                          Correct Answer:
                        </h4>
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
                            ) : question.correctAnswer &&
                              typeof question.correctAnswer === "object" ? (
                              <pre className="whitespace-pre-wrap bg-muted p-2 rounded text-xs">
                                {JSON.stringify(
                                  question.correctAnswer,
                                  null,
                                  2
                                )}
                              </pre>
                            ) : (
                              <p>{JSON.stringify(question.correctAnswer)}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm italic text-muted-foreground">
                            No correct answer specified
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </ContentLayout>
    );
  } catch (error) {
    console.error("🔥 Error loading assignment:", error);
    notFound();
  }
}
