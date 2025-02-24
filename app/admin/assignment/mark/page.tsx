"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/layout/content-layout";
import { fetchUnmarkedAssignments } from "@/lib/actions/assignments/fetchUnmarkedAssignments";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default function MarkAssignmentsPage() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const data = await fetchUnmarkedAssignments();
      console.log("Fetched data:", data);
      setAssignments(data);
    } catch (error) {
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
    <ContentLayout title="Mark Assignments">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Assignment</TableHead>
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
                  <Link href={`/admin/assignment/mark/${item.id}`}>Mark</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ContentLayout>
  );
}
