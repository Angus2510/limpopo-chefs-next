"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface Student {
  id: string;
  admissionNumber: string;
  firstName: string | undefined;
  lastName: string | undefined;
  campus: string;
}

export function FilteredArrearsTable({ students }: { students: Student[] }) {
  const [filter, setFilter] = useState("");

  const filteredStudents = students.filter((student) =>
    Object.values(student).some((value) =>
      String(value).toLowerCase().includes(filter.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by student number, name or campus..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-sm"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student Number</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Campus</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents.map((student) => (
            <TableRow key={student.id} className="text-red-600">
              <TableCell>{student.admissionNumber}</TableCell>
              <TableCell>
                {student.firstName} {student.lastName}
              </TableCell>
              <TableCell>{student.campus}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
