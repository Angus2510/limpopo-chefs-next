"use client";

import { useState } from "react";
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
import { Assignment } from "@/types/assignments/assignments";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface AssignmentsListProps {
  assignments: Assignment[];
}

export default function AssignmentsList({ assignments }: AssignmentsListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assessment?")) return;

    setIsDeleting(id);
    try {
      await deleteAssignment(id);
      toast({
        title: "Success",
        description: "Assessment deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete assessment",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  // Filter assignments based on search term
  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assignment.outcome &&
        assignment.outcome.some((outcome) =>
          outcome.toLowerCase().includes(searchTerm.toLowerCase())
        ))
  );

  // Sort assignments by creation date (newest first)
  const sortedAssignments = [...filteredAssignments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredAssignments.length}{" "}
          {filteredAssignments.length === 1 ? "assessment" : "assessments"}{" "}
          found
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Available From</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAssignments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No assignments found matching your search.
              </TableCell>
            </TableRow>
          ) : (
            sortedAssignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">
                  {assignment.title}
                </TableCell>
                <TableCell className="capitalize">{assignment.type}</TableCell>
                <TableCell>
                  {format(new Date(assignment.createdAt), "PPP")}
                </TableCell>
                <TableCell>{assignment.duration} minutes</TableCell>
                <TableCell>
                  {format(new Date(assignment.availableFrom), "PPP")}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/admin/assignment/${assignment.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                  <Link href={`/admin/assignment/edit/${assignment.id}`}>
                    <Button variant="outline" size="sm">
                      Clone
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
