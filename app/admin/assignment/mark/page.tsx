"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/layout/content-layout";
import { SelectionForm } from "@/components/results/SelectionForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, Search, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AssignmentResult {
  id: string;
  assignment: string;
  assignmentData: {
    id: string;
    title: string;
    type: string;
    outcome: string[];
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

export default function MarkAssignmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<AssignmentResult[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("dateTaken-desc");
  const [selectedFilters, setSelectedFilters] = useState<{
    intakeGroupId: string[];
    campusId: string;
    outcomeId: string;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const groupId = params.get("groupId");
    const campusId = params.get("campusId");
    const outcomeId = params.get("outcomeId");
    const search = params.get("search");
    const sort = params.get("sort");

    // If we have the required filter parameters
    if (groupId && campusId && outcomeId) {
      // Set the filters
      const filters = {
        intakeGroupId: [groupId],
        campusId,
        outcomeId,
      };
      setSelectedFilters(filters);

      // Load the assignments with these filters
      handleSelectionComplete(filters);
    }

    // Set search and sort if they exist
    if (search) setSearchQuery(search);
    if (sort) setSortBy(sort);
  }, []);

  const handleSelectionComplete = async (selection: {
    intakeGroupId: string[];
    campusId: string;
    outcomeId: string;
  }) => {
    setSelectedFilters(selection);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/assignments/results?groupId=${selection.intakeGroupId[0]}&outcomeId=${selection.outcomeId}&campusId=${selection.campusId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch assignments");
      }

      console.log("API Response:", data);

      if (data.results.length === 0) {
        console.log("Debug info:", data.debug);
        toast({
          title: "No Results Found",
          description: `No assignments found for ${
            data.debug?.outcomeTitle || "selected outcome"
          }`,
          variant: "destructive",
        });
      }

      setAssignments(data.results);

      // Update URL with selected filters (new code)
      const url = new URL(window.location.href);
      url.searchParams.set("groupId", selection.intakeGroupId[0]);
      url.searchParams.set("campusId", selection.campusId);
      url.searchParams.set("outcomeId", selection.outcomeId);
      window.history.replaceState({}, "", url.toString());
    } catch (error) {
      console.error("Error loading assignments:", error);
      setError("Failed to load assignments. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  // Filter and sort assignments
  const filteredAssignments = assignments
    .filter((assignment) => {
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          assignment.assignmentData?.title
            .toLowerCase()
            .includes(searchLower) ||
          assignment.studentData?.profile.firstName
            .toLowerCase()
            .includes(searchLower) ||
          assignment.studentData?.profile.lastName
            .toLowerCase()
            .includes(searchLower) ||
          assignment.studentData?.admissionNumber
            .toLowerCase()
            .includes(searchLower)
        );
      }
      return true;
    })
    .sort((a, b) => {
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

  return (
    <ContentLayout title="Mark Assessments">
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={() => router.push("/admin/assignment/mark/individual")}
        >
          Search Individual Student Marks
        </Button>
      </div>
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="text-lg font-medium mb-4">Select Filters</h2>
          <SelectionForm onSelectionComplete={handleSelectionComplete} />
          {selectedFilters && (
            <div className="flex items-center justify-end mt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedFilters(null);
                  setAssignments([]);
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {selectedFilters && (
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assignments or students"
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => {
                    const newQuery = e.target.value;
                    setSearchQuery(newQuery);

                    // Update URL with search parameter
                    const url = new URL(window.location.href);
                    if (newQuery) {
                      url.searchParams.set("search", newQuery);
                    } else {
                      url.searchParams.delete("search");
                    }
                    window.history.replaceState({}, "", url.toString());
                  }}
                />
              </div>
            </div>

            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value);

                // Update URL with sort parameter
                const url = new URL(window.location.href);
                url.searchParams.set("sort", value);
                window.history.replaceState({}, "", url.toString());
              }}
            >
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
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
            <span>Loading assignments...</span>
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : selectedFilters ? (
          filteredAssignments.length > 0 ? (
            <AssignmentsTable
              assignments={filteredAssignments}
              onMarkAssignment={(id) =>
                router.push(`/admin/assignment/mark/${id}`)
              }
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-40">
                <p className="text-muted-foreground">No assignments found</p>
              </CardContent>
            </Card>
          )
        ) : (
          <div className="text-center p-8">
            <h3 className="text-lg font-medium">Select Filters to Load Data</h3>
            <p className="text-muted-foreground mt-2">
              Please select your filters above to view assignments.
            </p>
          </div>
        )}
      </div>
    </ContentLayout>
  );
}

function AssignmentsTable({
  assignments,
  onMarkAssignment,
}: {
  assignments: AssignmentResult[];
  onMarkAssignment: (id: string) => void;
}) {
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
            <TableCell>{result.testScore ?? "N/A"}</TableCell>
            <TableCell>{result.taskScore ?? "N/A"}</TableCell>
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
                className={`
                  ${
                    result.status === "pending" && "bg-amber-100 text-amber-800"
                  }
                  ${result.status === "marked" && "bg-green-100 text-green-800"}
                  ${
                    result.status === "submitted" && "bg-blue-100 text-blue-800"
                  }
                `}
              >
                {result.status}
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
