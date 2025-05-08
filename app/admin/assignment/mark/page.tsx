"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/layout/content-layout";
import Link from "next/link";
import { SelectionForm } from "@/components/results/SelectionForm";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<{
    intakeGroupId: string[];
    campusId: string;
    outcomeId: string;
  } | null>(null);

  const handleSelectionComplete = async (selection: {
    intakeGroupId: string[];
    campusId: string;
    outcomeId: string;
  }) => {
    setSelectedFilters(selection);
    setLoading(true);
    setError(null);

    try {
      const groups = await getAllIntakeGroups();
      const filteredGroups = groups.filter((group) =>
        selection.intakeGroupId.includes(group.id)
      );

      const groupsWithCounts = await Promise.all(
        filteredGroups.map(async (group) => {
          try {
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

      const sortedGroups = sortGroups(groupsWithCounts);
      setIntakeGroups(sortedGroups);
    } catch (error) {
      console.error("Error loading filtered groups:", error);
      setError("Failed to load filtered groups. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load filtered groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sortGroups = (groups: IntakeGroup[]) => {
    return [...groups].sort((a, b) => {
      if (
        (a.pendingAssignmentsCount || 0) > 0 &&
        (b.pendingAssignmentsCount || 0) === 0
      ) {
        return -1;
      }
      if (
        (a.pendingAssignmentsCount || 0) === 0 &&
        (b.pendingAssignmentsCount || 0) > 0
      ) {
        return 1;
      }

      const aDate = a.assignmentCounts?.newestDate
        ? new Date(a.assignmentCounts.newestDate)
        : new Date(0);
      const bDate = b.assignmentCounts?.newestDate
        ? new Date(b.assignmentCounts.newestDate)
        : new Date(0);

      return bDate.getTime() - aDate.getTime();
    });
  };

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

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return "No activity yet";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

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

      return date.toLocaleDateString();
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <ContentLayout title="Mark Assessments">
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
                  setIntakeGroups([]);
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {!selectedFilters ? (
          <div className="text-center p-8">
            <h3 className="text-lg font-medium">Select Filters to Load Data</h3>
            <p className="text-muted-foreground mt-2">
              Please select your filters above to view the relevant assignments.
            </p>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
            <span>Loading intake groups...</span>
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
        ) : (
          <>
            {intakeGroups.length === 0 ? (
              <div className="text-center p-8">
                <h3 className="text-lg font-medium">No intake groups found</h3>
                <p className="text-muted-foreground mt-2">
                  No groups match your selected filters.
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
                      className={
                        group.pendingAssignmentsCount ? "bg-amber-50" : ""
                      }
                    >
                      <TableCell className="font-medium">
                        {group.title}
                      </TableCell>
                      <TableCell>
                        {!group.assignmentCounts ? (
                          <span className="text-muted-foreground">
                            Loading...
                          </span>
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
                            group.pendingAssignmentsCount > 0
                              ? "default"
                              : "outline"
                          }
                          className={
                            group.pendingAssignmentsCount > 0
                              ? "font-medium"
                              : ""
                          }
                        >
                          <Link
                            href={`/admin/assignment/mark/group/${group.id}`}
                          >
                            View Assessments
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </div>
    </ContentLayout>
  );
}
