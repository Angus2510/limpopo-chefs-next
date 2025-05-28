"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContentLayout } from "@/components/layout/content-layout";
import { Loader2, Search, ArrowLeft, Info } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { getStudentMarks } from "@/lib/actions/assignments/getStudentMarks";

interface AssignmentMark {
  id: string;
  dateTaken: string;
  assignmentData: {
    id: string;
    title: string;
    type: string;
    outcome?: string[];
  };
  testScore: number | null;
  taskScore: number | null;
  percent: number | null;
  status: string;
  feedback?: {
    submissionDetails?: {
      studentEmail: string;
      studentUsername: string;
      assignmentTitle: string;
      assignmentType: string;
      submissionTime: string;
    };
  };
}

export default function StudentMarksPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [studentNumber, setStudentNumber] = useState("");
  const [marks, setMarks] = useState<AssignmentMark[]>([]);
  const [studentInfo, setStudentInfo] = useState<{
    firstName: string;
    lastName: string;
    admissionNumber: string;
  } | null>(null);

  const handleSearch = async () => {
    if (!studentNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a student number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await getStudentMarks(studentNumber);

      if ("error" in result) {
        throw new Error(result.error);
      }

      setMarks(result.results);
      setStudentInfo(result.student);

      if (result.results.length === 0) {
        toast({
          title: "No Results",
          description: "No marks found for this student",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error fetching marks:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch student marks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
      case "marked":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleMarkClick = (assignmentId: string) => {
    router.push(`/admin/assignment/mark/${assignmentId}`);
  };

  return (
    <ContentLayout title="Student Marks Search">
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/assignment/mark")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter student number"
              className="pl-8"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Search
          </Button>
        </div>

        {studentInfo && (
          <div className="bg-muted/50 p-4 rounded-lg mb-6">
            <h2 className="font-semibold text-lg">
              {studentInfo.firstName} {studentInfo.lastName}
            </h2>
            <p className="text-sm text-muted-foreground">
              Student Number: {studentInfo.admissionNumber}
            </p>
          </div>
        )}

        {marks.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Assessment</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Test Mark</TableHead>
                <TableHead>Task Mark</TableHead>
                <TableHead>Overall %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marks.map((mark) => (
                <TableRow key={mark.id}>
                  <TableCell>
                    {format(new Date(mark.dateTaken), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>{mark.assignmentData?.title}</TableCell>
                  <TableCell>{mark.assignmentData?.type}</TableCell>
                  <TableCell>{mark.testScore ?? "N/A"}</TableCell>
                  <TableCell>{mark.taskScore ?? "N/A"}</TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${
                        mark.percent !== null
                          ? mark.percent >= 50
                            ? "text-green-600"
                            : "text-red-600"
                          : ""
                      }`}
                    >
                      {mark.percent ? `${mark.percent}%` : "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        mark.status
                      )}`}
                    >
                      {mark.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {mark.feedback && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Submission Details",
                            description: (
                              <div className="mt-2 text-sm space-y-1">
                                <p>
                                  Email:{" "}
                                  {
                                    mark.feedback.submissionDetails
                                      ?.studentEmail
                                  }
                                </p>
                                <p>
                                  Student ID:{" "}
                                  {
                                    mark.feedback.submissionDetails
                                      ?.studentUsername
                                  }
                                </p>
                                <p>
                                  Assignment:{" "}
                                  {
                                    mark.feedback.submissionDetails
                                      ?.assignmentTitle
                                  }
                                </p>
                                <p>
                                  Type:{" "}
                                  {
                                    mark.feedback.submissionDetails
                                      ?.assignmentType
                                  }
                                </p>
                                <p>
                                  Submitted:{" "}
                                  {mark.feedback.submissionDetails
                                    ?.submissionTime
                                    ? format(
                                        new Date(
                                          mark.feedback.submissionDetails.submissionTime
                                        ),
                                        "dd MMM yyyy HH:mm"
                                      )
                                    : "N/A"}
                                </p>
                              </div>
                            ),
                          });
                        }}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={
                        mark.status === "submitted" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleMarkClick(mark.id)}
                    >
                      {mark.status === "submitted" ? "Mark" : "View"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </ContentLayout>
  );
}
