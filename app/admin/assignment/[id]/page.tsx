import { getAssignmentById } from "@/lib/actions/assignments/getAssignmentById";
import { getAssignmentAnswers } from "@/lib/actions/assignments/getAssignmentAnswers";
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
  if (!params?.id) {
    notFound();
  }

  const id = await Promise.resolve(params.id);
  const [assignment, answers] = await Promise.all([
    getAssignmentById(id),
    getAssignmentAnswers(id),
  ]);

  if (!assignment) {
    notFound();
  }

  return (
    <ContentLayout title={assignment.title}>
      <div className="container mx-auto py-6 space-y-6">
        {/* Existing assignment details card */}

        {/* Questions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Questions & Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {assignment.questions?.map((question, index) => {
                const questionAnswers = answers?.filter(
                  (ans) => ans.question === question.id
                );

                return (
                  <div key={question.id} className="border p-4 rounded-lg">
                    {/* Question Header */}
                    <h3 className="font-bold mb-2">
                      Question {index + 1} ({question.mark} marks)
                    </h3>
                    <p className="mb-2">{question.text}</p>

                    {/* Question Content (existing code) */}
                    {/* ... your existing question type conditionals ... */}

                    {/* Answers Section */}
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-semibold mb-2">
                        Submissions ({questionAnswers?.length || 0})
                      </h4>
                      <div className="space-y-3">
                        {questionAnswers?.map((answer) => (
                          <div
                            key={answer.id}
                            className="bg-muted p-3 rounded-md"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Submitted:{" "}
                                  {format(new Date(answer.answeredAt), "PPp")}
                                </p>
                                <p className="mt-2">
                                  Answer:{" "}
                                  {typeof answer.answer === "string"
                                    ? answer.answer
                                    : JSON.stringify(answer.answer)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">
                                  Score: {answer.scores ?? "Not scored"}
                                </p>
                                {answer.moderatedscores && (
                                  <p className="text-sm text-muted-foreground">
                                    Moderated: {answer.moderatedscores}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
}
