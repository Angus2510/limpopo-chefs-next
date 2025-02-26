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
import { fetchIntakeGroupsWithPendingAssignments } from "@/lib/actions/assignments/fetchIntakeGroupsWithPendingAssignments";

export default function MarkAssignmentsPage() {
  const { toast } = useToast();
  const [intakeGroups, setIntakeGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntakeGroups();
  }, []);

  const loadIntakeGroups = async () => {
    try {
      const data = await fetchIntakeGroupsWithPendingAssignments();
      console.log("Fetched intake groups:", data);
      setIntakeGroups(data);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ContentLayout title="Mark Assessments">
      {intakeGroups.length === 0 ? (
        <div className="text-center p-8">
          <h3 className="text-lg font-medium">No pending assessments found</h3>
          <p className="text-muted-foreground mt-2">
            There are currently no intake groups with pending assessments to
            mark.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Intake Group</TableHead>
              <TableHead>Course/Outcome</TableHead>
              <TableHead>Pending Assessments</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {intakeGroups.map((group) => (
              <TableRow key={group.id}>
                <TableCell>{group.name}</TableCell>
                <TableCell>{group.course?.title}</TableCell>
                <TableCell>{group.pendingAssignmentsCount}</TableCell>
                <TableCell>
                  <Button asChild>
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
