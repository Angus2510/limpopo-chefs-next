"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import Link from "next/link";
import { deleteAssignment } from "@/lib/actions/assignments/deleteAssignments";
import { toast } from "@/components/ui/use-toast";
import { Assignment } from "@/types/assignments";

interface AssignmentsListProps {
  assignments: Assignment[];
}

export default function AssignmentsList({ assignments }: AssignmentsListProps) {
  // Add loading state
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    setIsDeleting(id);
    try {
      await deleteAssignment(id);
      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  if (!assignments.length) {
    return (
      <div className="text-center py-6 text-gray-500">No assignments found</div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Available From</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((assignment) => (
          <TableRow key={assignment.id}>
            <TableCell className="font-medium">{assignment.title}</TableCell>
            <TableCell>{assignment.type}</TableCell>
            <TableCell>
              {format(new Date(assignment.availableFrom), "PPP")}
            </TableCell>
            <TableCell>{assignment.duration} minutes</TableCell>
            <TableCell className="text-right space-x-2">
              <Link href={`/admin/assignments/${assignment.id}`}>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </Link>
              <Link href={`/admin/assignments/${assignment.id}/edit`}>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(assignment.id)}
                disabled={isDeleting === assignment.id}
              >
                {isDeleting === assignment.id ? "Deleting..." : "Delete"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
