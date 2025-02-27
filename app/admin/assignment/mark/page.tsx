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
import { Loader2 } from "lucide-react";

// Updated interface to include assignment counts
interface AssignmentCounts {
  total: number;
  pending: number;
  marked: number;
  submitted: number;
  byStatus: Record<string, number>;
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

  useEffect(() => {
    loadAllIntakeGroups();
  }, []);

  const loadAllIntakeGroups = async () => {
    try {
      // Get all intake groups
      const groups = await getAllIntakeGroups();

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

      setIntakeGroups(groupsWithCounts);
    } catch (error) {
      console.error("Error loading intake groups:", error);
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
        return {
          total: 0,
          pending: 0,
          marked: 0,
          submitted: 0,
          byStatus: {},
        };
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2">Loading intake groups...</span>
      </div>
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
              <TableHead>Assignment Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {intakeGroups.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-medium">{group.title}</TableCell>
                <TableCell>
                  {!group.assignmentCounts ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex gap-2">
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
                        {group.assignmentCounts.total} total assignments
                      </p>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    asChild
                    variant={
                      group.pendingAssignmentsCount > 0 ? "default" : "outline"
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
