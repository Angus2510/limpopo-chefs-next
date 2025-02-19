import { getAssignmentById } from "@/lib/actions/assignments/getAssignmentById";
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

interface PageProps {
  params: { id: string };
}

export default async function AssignmentViewPage({ params }: PageProps) {
  // Validate params
  if (!params?.id) {
    notFound();
  }

  // Wait for params to be available
  const id = await Promise.resolve(params.id);
  const assignment = await getAssignmentById(id);

  if (!assignment) {
    notFound();
  }

  return (
    <ContentLayout title={assignment.title}>
      <div className="container mx-auto py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{assignment.title}</CardTitle>
            <CardDescription>
              {assignment.type.charAt(0).toUpperCase() +
                assignment.type.slice(1)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <strong>Available From:</strong>{" "}
                {format(new Date(assignment.availableFrom), "PPP")}
              </div>
              <div>
                <strong>Duration:</strong> {assignment.duration} minutes
              </div>
              <div>
                <strong>Password:</strong> {assignment.password}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {assignment.questions?.map((question, index) => (
                <div key={question.id} className="border p-4 rounded-lg">
                  <h3 className="font-bold mb-2">
                    Question {index + 1} ({question.mark} marks)
                  </h3>
                  <p className="mb-2">{question.text}</p>

                  {question.type === "multiple-choice" && (
                    <div className="pl-4">
                      {question.options?.map(
                        (option: any, optIndex: number) => (
                          <div
                            key={optIndex}
                            className="flex items-center gap-2"
                          >
                            <span>{String.fromCharCode(65 + optIndex)}.</span>
                            <span>{option.value}</span>
                            {option.value === question.correctAnswer && (
                              <span className="text-green-600 ml-2">
                                (Correct)
                              </span>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {question.type === "true-false" && (
                    <div className="pl-4">
                      <p>Correct Answer: {question.correctAnswer}</p>
                    </div>
                  )}

                  {(question.type === "short-answer" ||
                    question.type === "long-answer") && (
                    <div className="pl-4">
                      <p className="font-medium">Model Answer:</p>
                      <p className="mt-1">{question.correctAnswer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
