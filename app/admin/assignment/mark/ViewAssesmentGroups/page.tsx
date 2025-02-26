"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/layout/content-layout";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// You'll need to create this action
async function fetchAssignmentsByGroup(groupId) {
  "use server";

  const prisma = await import("@/lib/db").then((mod) => mod.default);

  // Get group details
  const group = await prisma.intakegroups.findUnique({
    where: { id: groupId },
    select: { title: true },
  });

  // Get assignments for this group
  const assignments = await prisma.assignmentresults.findMany({
    where: {
      intakeGroup: groupId,
      status: "SUBMITTED",
      markedBy: null,
    },
    select: {
      id: true,
      student: true,
      assignment: true,
      dateTaken: true,
      status: true,
    },
  });

  // Get student details for each assignment
  const enrichedAssignments = await Promise.all(
    assignments.map(async (item) => {
      const student = await prisma.students.findUnique({
        where: { id: item.student },
        select: {
          profile: true,
        },
      });

      const assignment = await prisma.assignments.findUnique({
        where: { id: item.assignment },
        select: { title: true },
      });

      return {
        ...item,
        student: {
          firstName: student?.profile?.firstName || "Unknown",
          lastName: student?.profile?.lastName || "Student",
        },
        assignment: {
          title: assignment?.title || "Unknown Assignment",
        },
      };
    })
  );

  return {
    groupName: group?.title || "Unknown Group",
    assignments: enrichedAssignments,
  };
}

export default function GroupAssignmentsPage() {
  const { groupId } = useParams();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, [groupId]);

  const loadAssignments = async () => {
    try {
      const data = await fetchAssignmentsByGroup(groupId);
      console.log("Fetched assignments:", data);
      setAssignments(data.assignments);
      setGroupName(data.groupName);
    } catch (error) {
      console.error("Error loading assignments:", error);
      toast({
        title: "Error",
        description: "Failed to load assignments",
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
    <ContentLayout title={`Mark Assessments - ${groupName}`}>
      <div className="mb-4">
        <Button asChild variant="outline">
          <Link href="/admin/assignment/mark">Back to Groups</Link>
        </Button>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center p-8">
          <h3 className="text-lg font-medium">No pending assignments found</h3>
          <p className="text-muted-foreground mt-2">
            There are currently no pending assignments to mark for this group.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Assessment</TableHead>
              <TableHead>Date Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.student.firstName} {item.student.lastName}
                </TableCell>
                <TableCell>{item.assignment.title}</TableCell>
                <TableCell>
                  {new Date(item.dateTaken).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button asChild>
                    <Link href={`/admin/assignment/mark/student/${item.id}`}>
                      Mark
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
