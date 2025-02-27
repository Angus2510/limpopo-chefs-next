"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/layout/content-layout";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";
import { Loader2, AlertCircle, Clock } from "lucide-react";

// Updated interface to include assignment counts and dates
interface AssignmentCounts {
  total: number;
  pending: number;
  marked: number;
  submitted: number;
  byStatus: Record<string, number>;
  newestDate?: string | Date | null;
  groupTitle?: string;
}

interface IntakeGroup {
  id: string;
  title: string;
  pendingAssignmentsCount?: number;
  assignmentCounts?: AssignmentCounts;
  outcome?: string[];
}

export default function MarkAssignmentsPage() {
  const { toast } = useToast();
  const [intakeGroups, setIntakeGroups] = useState<IntakeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllIntakeGroups();
  }, []);

  const loadAllIntakeGroups = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all intake groups
      const groups = await getAllIntakeGroups();
      console.log(`Fetched ${groups.length} intake groups`);

      // We'll now fetch assignment counts for each group
      const groupsWithCounts = await Promise.all(
        groups.map(async (group) => {
          try {
            // Get assignment counts for this group
            const counts = await getAssignmentCounts(group.id);
            return {
              ...group,
              pendingAssignmentsCount: counts.pending || 0,
              assignmentCounts: counts,
            };
          } catch (error) {
            console.error(`Error getting count for ${group.title}:`, error);
            return {
              ...group,
              pendingAssignmentsCount: 0,
              assignmentCounts: {
                total: 0,
                pending: 0,
                marked: 0,
                submitted: 0,
                byStatus: {},
              },
            };
          }
        })
      );

      // Sort: 1. Groups with pending first, 2. Then by newest date
      const sortedGroups = [...groupsWithCounts].sort((a, b) => {
        // First priority: Groups with pending assignments go to the top
        if (
          (a.pendingAssignmentsCount || 0) > 0 &&
          (b.pendingAssignmentsCount || 0) === 0
        ) {
          return -1; // a comes first
        }
        if (
          (a.pendingAssignmentsCount || 0) === 0 &&
          (b.pendingAssignmentsCount || 0) > 0
        ) {
          return 1; // b comes first
        }

        // Second priority: Sort by newest assignment date
        const aDate = a.assignmentCounts?.newestDate
          ? new Date(a.assignmentCounts.newestDate)
          : new Date(0);

        const bDate = b.assignmentCounts?.newestDate
          ? new Date(b.assignmentCounts.newestDate)
          : new Date(0);

        return bDate.getTime() - aDate.getTime(); // Newest first
      });

      console.log(`Sorted ${sortedGroups.length} groups`);
      setIntakeGroups(sortedGroups);
    } catch (error) {
      console.error("Error loading intake groups:", error);
      setError("Failed to load intake groups. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load intake groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Updated function to get all assignment counts
  const getAssignmentCounts = async (
    groupId: string
  ): Promise<AssignmentCounts> => {
    try {
      const response = await fetch(
        `/api/assignments/pending-count?groupId=${groupId}`
      );

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(
        `Error fetching assignment counts for group ${groupId}:`,
        error
      );
      return {
        total: 0,
        pending: 0,
        marked: 0,
        submitted: 0,
        byStatus: {},
      };
    }
  };

  // Format date to relative time (e.g., "2 days ago")
  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return "No activity yet";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      // Calculate time difference
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return `${diffSecs} seconds ago`;
      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays < 30) return `${diffDays} days ago`;

      // If more than a month, show actual date
      return date.toLocaleDateString();
    } catch (error) {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <ContentLayout title="Mark Assessments">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
          <span>Loading intake groups...</span>
        </div>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout title="Mark Assessments">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => loadAllIntakeGroups()}
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
    <ContentLayout title="Mark Assessments">
      {intakeGroups.length === 0 ? (
        <div className="text-center p-8">
          <h3 className="text-lg font-medium">No intake groups found</h3>
          <p className="text-muted-foreground mt-2">
            There are currently no intake groups in the system.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Intake Group</TableHead>
              <TableHead>Assessment Status</TableHead>
              <TableHead>Latest Activity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {intakeGroups.map((group) => (
              <TableRow
                key={group.id}
                // Highlight rows with pending assignments
                className={group.pendingAssignmentsCount ? "bg-amber-50" : ""}
              >
                <TableCell className="font-medium">{group.title}</TableCell>
                <TableCell>
                  {!group.assignmentCounts ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex gap-2 flex-wrap">
                        {group.assignmentCounts.pending > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            {group.assignmentCounts.pending} pending
                          </span>
                        )}
                        {group.assignmentCounts.marked > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {group.assignmentCounts.marked} marked
                          </span>
                        )}
                        {group.assignmentCounts.submitted > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {group.assignmentCounts.submitted} submitted
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {group.assignmentCounts.total} total assessments
                      </p>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                    {formatDate(group.assignmentCounts?.newestDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    asChild
                    variant={
                      group.pendingAssignmentsCount > 0 ? "default" : "outline"
                    }
                    className={
                      group.pendingAssignmentsCount > 0 ? "font-medium" : ""
                    }
                  >
                    <Link href={`/admin/assignment/mark/group/${group.id}`}>
                      View Assignments
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </ContentLayout>
  );
}
