"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fetchStudentAssignments } from "@/lib/actions/assignments/fetchStudentAssignments";
import { ContentLayout } from "@/components/layout/content-layout";

interface Assignment {
  id: string;
  title: string;
  type: string;
  duration: number;
  availableFrom: Date;
}

export default function StudentAssignmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const data = await fetchStudentAssignments();
      setAssignments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not load assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ContentLayout title="Assignments">
        <div className="flex justify-center items-center h-48">
          Loading assignments...
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Assessments">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Assessments</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Available From</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>{assignment.title}</TableCell>
                <TableCell>{assignment.type}</TableCell>
                <TableCell>
                  {format(new Date(assignment.availableFrom), "PPP")}
                </TableCell>
                <TableCell>
                  {Math.floor(assignment.duration / 60)}h{" "}
                  {assignment.duration % 60}m
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() =>
                      router.push(`/student/assignments/${assignment.id}`)
                    }
                    disabled={new Date() < new Date(assignment.availableFrom)}
                  >
                    Start
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ContentLayout>
  );
}
