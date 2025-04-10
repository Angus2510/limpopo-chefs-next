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
import { Badge } from "@/components/ui/badge";
import { MarkAnswers } from "@/components/assignments/markAnswers";
import { getAssignmentAnswers } from "@/lib/actions/assignments/getAssignmentAnswers";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

// Define interfaces for type safety
interface PageProps {
  params: { id: string } | Promise<{ id: string }>;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
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

interface Question {
  id: string;
  text: string;
  type: string;
  mark: string;
  correctAnswer?: any;
  options: {
    id: string;
    value?: string;
    columnA?: string;
    columnB?: string;
  }[];
}

interface AssignmentResult {
  id: string;
  dateTaken: Date;
  scores: string | null;
  student: Student;
  assignment: Assignment;
  answers: string[];
}

interface JwtPayload {
  id: string;
  firstName: string;
  lastName: string;
  userType: string;
  exp: number;
}

// Decode JWT token and validate
function getUserFromToken(token: string | undefined) {
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp <= currentTime) {
      return null;
    }

    return {
      id: decoded.id,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      userType: decoded.userType,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

export default async function AssignmentMarkingPage({ params }: PageProps) {
  console.log("🚀 Starting to load assessment marking page...");

  // Get token from cookies at the top level of the component
  const cookieStore = await cookies();

  // Check for BOTH possible cookie names
  const token =
    cookieStore.get("token")?.value || cookieStore.get("accessToken")?.value;

  if (!token) {
    console.log("❌ No authentication token found");
    return (
      <ContentLayout title="Unauthorized">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-destructive font-medium mb-2">
            Unauthorized Access
          </div>
          <p className="text-muted-foreground max-w-md text-center mb-6">
            You must be logged in as a staff member to view this page.
          </p>
        </div>
      </ContentLayout>
    );
  }

  const user = getUserFromToken(token);
  const staffId = user?.id;

  // Properly resolve params whether it's a Promise or direct object
  const resolvedParams = params instanceof Promise ? await params : params;
  const id = resolvedParams?.id;

  if (!id) {
    console.log("❌ No result ID provided");
    notFound();
  }

  // Check if user is authenticated and is staff
  if (!user || user.userType !== "Staff") {
    return (
      <ContentLayout title="Unauthorized">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-destructive font-medium mb-2">
            Unauthorized Access
          </div>
          <p className="text-muted-foreground max-w-md text-center mb-6">
            You must be logged in as a staff member to view this page.
          </p>
        </div>
      </ContentLayout>
    );
  }

  try {
    console.log("🔍 Fetching assessment result data...");

    // Get the assignment result directly - no need to fetch the assignment separately
    const resultData = await getAssignmentAnswers(id);

    if (!resultData) {
      console.log("❌ assessment result not found");
      return (
        <ContentLayout title="Result Not Found">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-destructive font-medium mb-2">
              Assignment Result Not Found
            </div>
            <p className="text-muted-foreground max-w-md text-center mb-6">
              The assessment result you&apos;re looking for could not be found.
            </p>
          </div>
        </ContentLayout>
      );
    }

    const result = resultData;
    console.log("✅ Result data fetched successfully");
    console.log(
      `👤 Student: ${result.student.firstName} ${result.student.lastName}`
    );
    console.log(`📄 Assignment: ${result.assignment.title}`);

    // Parse answers from strings to objects
    const parsedAnswers = [];
    for (const answerStr of result.answers) {
      try {
        const answer = JSON.parse(answerStr);
        parsedAnswers.push(answer);
      } catch (e) {
        console.error("Failed to parse answer:", e);
      }
    }

    console.log(`📝 Parsed ${parsedAnswers.length} answers`);

    // Parse scores
    let scoresMap = {};
    if (result.scores) {
      try {
        scoresMap = JSON.parse(result.scores);
        console.log(
          `🎯 Found scores for ${Object.keys(scoresMap).length} questions`
        );
      } catch (e) {
        console.error("Failed to parse scores:", e);
      }
    } else {
      console.log(`⚠️ No scores found for this submission`);
    }

    // Calculate total score
    let totalScore = 0;
    let totalPossible = 0;

    Object.values(scoresMap).forEach((score) => {
      if (typeof score === "number") {
        totalScore += score;
      }
    });

    result.assignment.questions.forEach((question) => {
      totalPossible += parseInt(question.mark);
    });

    const percentage =
      totalPossible > 0 ? Math.round((totalScore * 100) / totalPossible) : 0;

    console.log(
      `📊 Total score: ${totalScore}/${totalPossible} (${percentage}%)`
    );

    return (
      <ContentLayout
        title={`Marking: ${result.student.firstName} ${result.student.lastName}`}
      >
        <div className="container mx-auto py-6 space-y-6 ">
          {/* Student and Assignment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Result Details</CardTitle>
              <CardDescription>Student assessment submission</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm">
                      Student Information
                    </h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <p className="text-sm text-muted-foreground">Name:</p>
                      <p className="text-sm font-medium">
                        {result.student.firstName} {result.student.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Submitted:
                      </p>
                      <p className="text-sm">
                        {format(new Date(result.dateTaken), "PPP 'at' p")}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Performance</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <p className="text-sm text-muted-foreground">
                        Total Score:
                      </p>
                      <p className="text-sm font-medium">
                        {totalScore}/{totalPossible} ({percentage}%)
                      </p>
                      <p className="text-sm text-muted-foreground">Grade:</p>
                      <Badge
                        className={
                          percentage >= 75
                            ? "bg-green-500"
                            : percentage >= 50
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }
                      >
                        {percentage >= 75
                          ? "Distinction"
                          : percentage >= 60
                          ? "Merit"
                          : percentage >= 50
                          ? "Pass"
                          : "Fail"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Assignment Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm">
                      Assessment Information
                    </h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <p className="text-sm text-muted-foreground">Title:</p>
                      <p className="text-sm">{result.assignment.title}</p>
                      <p className="text-sm text-muted-foreground">Type:</p>
                      <p className="text-sm">{result.assignment.type}</p>
                      <p className="text-sm text-muted-foreground">
                        Questions:
                      </p>
                      <p className="text-sm">
                        {result.assignment.questions.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions and Answers Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left side - Questions and Correct Answers */}
            <div className="flex flex-col h-full">
              <Card className="w-full h-full flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle>Assessment Memo</CardTitle>
                  <CardDescription>
                    Total Questions: {result.assignment.questions?.length || 0}{" "}
                    | Total Marks: {totalPossible}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <div className="h-full">
                    <div className="space-y-6">
                      {result.assignment.questions?.map((question, index) => (
                        <div
                          key={question.id}
                          className="border p-4 rounded-lg"
                        >
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

                          {/* Display the correct answer */}
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
                                  <p>
                                    {JSON.stringify(question.correctAnswer)}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm italic text-muted-foreground">
                                No correct answer specified
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right side - Student Answers */}
            <div className="flex flex-col h-full">
              <Card className="w-full h-full flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle>Student Answers</CardTitle>
                  <CardDescription>
                    Review and mark the student&apos;s responses
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow items-stretch flex flex-col">
                  <div className="h-full">
                    <MarkAnswers
                      resultId={id}
                      questions={result.assignment.questions}
                      parsedAnswers={parsedAnswers}
                      initialScores={scoresMap}
                      totalPossible={totalPossible}
                      staffId={staffId || ""}
                      studentId={result.student.id}
                      groupId={result.assignment.intakeGroups[0]} // Add this line - assuming the first group is the relevant one
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ContentLayout>
    );
  } catch (error) {
    console.error("🔥 Error loading assignment result:", error);
    return (
      <ContentLayout title="Error Loading Result">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-destructive font-medium mb-2">
            Failed to load assignment result
          </div>
          <p className="text-muted-foreground max-w-md text-center mb-6">
            There was an error retrieving the assignment result data. Please try
            again later.
          </p>
          <pre className="bg-muted p-4 rounded text-xs max-w-lg overflow-auto">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
      </ContentLayout>
    );
  }
}
