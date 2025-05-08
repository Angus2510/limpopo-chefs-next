"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/layout/content-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  CalendarIcon,
  ArrowLeft,
  Loader2,
  Search,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

interface Student {
  id: string;
  admissionNumber: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface Assignment {
  id: string;
  title: string;
  type: string;
  outcome: string[];
  createdAt: string;
}

interface AssignmentResult {
  id: string;
  assignment: string;
  assignmentData: {
    id: string;
    title: string;
    type: string;
    outcome: string[];
    outcomes: {
      id: string;
      title: string;
      type: string;
      hidden: boolean;
      campus: string[];
    }[];
  } | null;
  studentData: {
    admissionNumber: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  } | null;
  status: string;
  dateTaken: string;
  testScore: number | null;
  taskScore: number | null;
  scores: number | null;
  percent: number | null;
  markedBy: string | null;
}

export default function GroupAssignmentMarkPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params["groupId"] as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string>("");
  const [assignments, setAssignments] = useState<AssignmentResult[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("dateTaken-desc");

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    if (!groupId) return;

    const MAX_RETRIES = 3;
    let currentTry = 0;

    while (currentTry < MAX_RETRIES) {
      try {
        setLoading(true);
        setError(null);

        // First get the group name
        const groupResponse = await fetch(`/api/intake-groups/${groupId}`, {
          // Add timeout of 10 seconds
          signal: AbortSignal.timeout(10000),
        });

        if (!groupResponse.ok) {
          throw new Error(
            `Failed to fetch group info: ${groupResponse.status}`
          );
        }

        const groupData = await groupResponse.json();
        setGroupName(groupData.title);

        // Then get all assignments for this group
        const resultsResponse = await fetch(
          `/api/assignments/results?groupId=${groupId}`,
          {
            // Add timeout of 30 seconds for assignments
            signal: AbortSignal.timeout(30000),
          }
        );

        if (!resultsResponse.ok) {
          throw new Error(
            `Failed to fetch assignments: ${resultsResponse.status}`
          );
        }

        const resultsData = await resultsResponse.json();
        setAssignments(resultsData.results);
        return; // Success, exit the retry loop
      } catch (error) {
        console.error(`Attempt ${currentTry + 1} failed:`, error);

        if (currentTry === MAX_RETRIES - 1) {
          // Last attempt failed
          setError(
            "The request timed out. This could be due to a large number of assignments. Please try again or contact support if the issue persists."
          );
          toast({
            title: "Error loading data",
            description: "Request timed out. Please try again.",
            variant: "destructive",
          });
        }

        currentTry++;
        // Wait before retrying (exponential backoff)
        if (currentTry < MAX_RETRIES) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * currentTry)
          );
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter and sort assignments
  const filteredAssignments = assignments
    .filter((assignment) => {
      // Filter by status
      if (filter !== "all" && assignment.status !== filter) {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const titleMatches = assignment.assignmentData?.title
          .toLowerCase()
          .includes(searchLower);
        const studentNameMatches =
          assignment.studentData?.profile.firstName
            .toLowerCase()
            .includes(searchLower) ||
          assignment.studentData?.profile.lastName
            .toLowerCase()
            .includes(searchLower);
        const admissionMatches = assignment.studentData?.admissionNumber
          .toLowerCase()
          .includes(searchLower);

        return titleMatches || studentNameMatches || admissionMatches;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort based on selected option
      const [field, direction] = sortBy.split("-");

      if (field === "dateTaken") {
        const dateA = new Date(a.dateTaken).getTime();
        const dateB = new Date(b.dateTaken).getTime();
        return direction === "desc" ? dateB - dateA : dateA - dateB;
      }

      if (field === "student") {
        const nameA =
          `${a.studentData?.profile.lastName} ${a.studentData?.profile.firstName}`.toLowerCase();
        const nameB =
          `${b.studentData?.profile.lastName} ${b.studentData?.profile.firstName}`.toLowerCase();
        return direction === "desc"
          ? nameB.localeCompare(nameA)
          : nameA.localeCompare(nameB);
      }

      if (field === "title") {
        const titleA = a.assignmentData?.title.toLowerCase() || "";
        const titleB = b.assignmentData?.title.toLowerCase() || "";
        return direction === "desc"
          ? titleB.localeCompare(titleA)
          : titleA.localeCompare(titleB);
      }

      return 0;
    });

  // Group assignments by status for tabs
  const pendingCount = assignments.filter((a) => a.status === "pending").length;
  const markedCount = assignments.filter((a) => a.status === "marked").length;
  const submittedCount = assignments.filter(
    (a) => a.status === "submitted"
  ).length;

  if (loading) {
    return (
      <ContentLayout title="Loading Assignments">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
          <span>Loading assessment data...</span>
        </div>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout title="Error">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Assessment
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => fetchGroupData()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title={`Assessment for ${groupName}`}>
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
          <TabsList>
            <TabsTrigger value="all">
              All Assessments ({assignments.length})
            </TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="marked">Marked ({markedCount})</TabsTrigger>
            <TabsTrigger value="submitted">
              Submitted ({submittedCount})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Assessments or students"
                className="pl-8 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateTaken-desc">Newest First</SelectItem>
                <SelectItem value="dateTaken-asc">Oldest First</SelectItem>
                <SelectItem value="student-asc">Student Name (A-Z)</SelectItem>
                <SelectItem value="student-desc">Student Name (Z-A)</SelectItem>
                <SelectItem value="title-asc">
                  Assessment Title (A-Z)
                </SelectItem>
                <SelectItem value="title-desc">
                  Assessment Title (Z-A)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <AssignmentsTable
            assignments={filteredAssignments}
            onMarkAssignment={(id) =>
              router.push(`/admin/assignment/mark/${id}`)
            }
          />
        </TabsContent>

        <TabsContent value="pending" className="mt-0">
          <AssignmentsTable
            assignments={filteredAssignments.filter(
              (a) => a.status === "pending"
            )}
            onMarkAssignment={(id) =>
              router.push(`/admin/assignment/mark/${id}`)
            }
          />
        </TabsContent>

        <TabsContent value="marked" className="mt-0">
          <AssignmentsTable
            assignments={filteredAssignments.filter(
              (a) => a.status === "marked"
            )}
            onMarkAssignment={(id) =>
              router.push(`/admin/assignment/mark/${id}`)
            }
          />
        </TabsContent>

        <TabsContent value="submitted" className="mt-0">
          <AssignmentsTable
            assignments={filteredAssignments.filter(
              (a) => a.status === "submitted"
            )}
            onMarkAssignment={(id) =>
              router.push(`/admin/assignment/mark/${id}`)
            }
          />
        </TabsContent>
      </Tabs>
    </ContentLayout>
  );
}

interface AssignmentsTableProps {
  assignments: AssignmentResult[];
  onMarkAssignment: (id: string) => void;
}

function AssignmentsTable({
  assignments,
  onMarkAssignment,
}: AssignmentsTableProps) {
  if (assignments.length === 0) {
    return (
      <Card className="mt-2">
        <CardContent className="flex flex-col items-center justify-center h-40">
          <p className="text-muted-foreground">No Assessment found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Assessment</TableHead>
          <TableHead>Student</TableHead>
          <TableHead>Test Mark</TableHead>
          <TableHead>Task Mark</TableHead>
          <TableHead>Overall %</TableHead>
          <TableHead>Competency</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((result) => (
          <TableRow key={result.id}>
            <TableCell>
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(result.dateTaken), "dd MMM yyyy")}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(result.dateTaken), "h:mm a")}
              </div>
            </TableCell>
            <TableCell className="font-medium">
              {result.assignmentData?.title || "Unknown Assessment"}
              <div className="text-xs text-muted-foreground">
                {result.assignmentData?.type || "Unknown Type"}
              </div>
            </TableCell>
            <TableCell>
              {result.studentData ? (
                <>
                  {result.studentData.profile.firstName}{" "}
                  {result.studentData.profile.lastName}
                  <div className="text-xs text-muted-foreground">
                    {result.studentData.admissionNumber}
                  </div>
                </>
              ) : (
                "Unknown Student"
              )}
            </TableCell>
            <TableCell>
              {result.testScore !== undefined ? result.testScore : "N/A"}
            </TableCell>
            <TableCell>
              {result.taskScore !== undefined ? result.taskScore : "N/A"}
            </TableCell>
            <TableCell>
              <span
                className={`font-bold ${
                  (result.percent || 0) >= 40
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {result.percent
                  ? `${result.percent}%`
                  : result.scores
                  ? `${result.scores}%`
                  : "N/A"}
              </span>
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={`${
                  (result.percent || 0) >= 40
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : "bg-red-100 text-red-800 hover:bg-red-100"
                }`}
              >
                {(result.percent || 0) >= 40 ? "Competent" : "Not Competent"}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={`
                  ${
                    result.status === "pending" &&
                    "bg-amber-100 text-amber-800 hover:bg-amber-100"
                  }
                  ${
                    result.status === "marked" &&
                    "bg-green-100 text-green-800 hover:bg-green-100"
                  }
                  ${
                    result.status === "submitted" &&
                    "bg-blue-100 text-blue-800 hover:bg-blue-100"
                  }
                `}
              >
                {result.status === "pending" && "Pending"}
                {result.status === "marked" && "Marked"}
                {result.status === "submitted" && "Submitted"}
              </Badge>
            </TableCell>
            <TableCell>
              <Button
                onClick={() => onMarkAssignment(result.id)}
                variant={result.status === "pending" ? "default" : "outline"}
                size="sm"
              >
                {result.status === "pending" ? "Mark" : "View"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
