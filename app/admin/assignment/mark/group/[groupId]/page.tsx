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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  ClipboardCheck,
  Clock,
  Filter,
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
  assignmentData?: {
    title: string;
    type: string;
    outcome: string[];
  };
  student: string;
  studentData?: {
    admissionNumber: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  status: string;
  dateTaken: string;
  scores?: number;
  percent?: number;
  markedBy?: string;
}

export default function GroupAssignmentMarkPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;

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

    try {
      setLoading(true);
      setError(null);

      // First get the group name
      const groupResponse = await fetch(`/api/intake-groups/${groupId}`);
      if (!groupResponse.ok) {
        throw new Error(`Failed to fetch group info: ${groupResponse.status}`);
      }

      const groupData = await groupResponse.json();
      setGroupName(groupData.title);

      // Then get all assignments for this group
      const resultsResponse = await fetch(
        `/api/assignments/results?groupId=${groupId}`
      );
      if (!resultsResponse.ok) {
        throw new Error(
          `Failed to fetch assignments: ${resultsResponse.status}`
        );
      }

      const resultsData = await resultsResponse.json();
      setAssignments(resultsData);
    } catch (error) {
      console.error("Error loading assignment data:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
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
          <span>Loading assignment data...</span>
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
                Error Loading Assignments
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
    <ContentLayout title={`Assignments for ${groupName}`}>
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
              All Assignments ({assignments.length})
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
                placeholder="Search assignments or students"
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
                  Assignment Title (A-Z)
                </SelectItem>
                <SelectItem value="title-desc">
                  Assignment Title (Z-A)
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
          <p className="text-muted-foreground">No assignments found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Assignment</TableHead>
          <TableHead>Student</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date Taken</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((result) => (
          <TableRow key={result.id}>
            <TableCell className="font-medium">
              {result.assignmentData?.title || "Unknown Assignment"}
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
              {result.status === "pending" && (
                <Badge
                  variant="outline"
                  className="bg-amber-100 text-amber-800 hover:bg-amber-100"
                >
                  Pending
                </Badge>
              )}
              {result.status === "marked" && (
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 hover:bg-green-100"
                >
                  Marked
                </Badge>
              )}
              {result.status === "submitted" && (
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-100"
                >
                  Submitted
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(result.dateTaken), "dd MMM yyyy")}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(result.dateTaken), "h:mm a")}
              </div>
            </TableCell>
            <TableCell>
              {result.scores !== undefined && result.percent !== undefined ? (
                <span>
                  {result.scores} / {result.percent}%
                </span>
              ) : (
                <span className="text-muted-foreground">Not marked</span>
              )}
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
