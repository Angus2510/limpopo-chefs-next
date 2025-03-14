"use client";
import { ContentLayout } from "@/components/layout/content-layout";
import { Card, CardContent } from "@/components/ui/card";
import * as React from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { DataTableSkeleton } from "@/components/tables/basic/data-table-skeleton";
import { getPayableData } from "@/lib/actions/finance/payableQuery";
import { fetchStudentFinances } from "@/lib/actions/student/fetchStudentFinances";
import { toggleStudentPortal } from "@/lib/actions/student/toggleStudentPortal";
import { useRouter, useSearchParams } from "next/navigation";
import { searchParamsSchema } from "@/types/student/students";

interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  campuses: string;
  idNumber: string;
  profileBlocked: string;
  payableAmounts: string;
  payableDueDates: string;
  cityAndGuildNumber: string;
  admissionDate: string;
}

interface StudentFinances {
  collectedFees: Array<{
    id: string;
    balance: string;
    credit?: number | null;
    debit?: number | null;
    description: string;
    transactionDate?: Date;
  }>;
  payableFees: Array<{
    id: string;
    amount: number;
    arrears: number;
    dueDate?: Date;
  }>;
}

const PayablePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudentFinances, setSelectedStudentFinances] =
    useState<StudentFinances | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async (query: string = "") => {
    setLoading(true);
    try {
      const searchObject = {
        search: query,
        page: 1,
        per_page: 100,
        sort: "admissionNumber.asc",
      };

      const validatedParams = searchParamsSchema.parse(searchObject);
      const { students } = await getPayableData(validatedParams);
      setStudents(students);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const initialSearch = searchParams.get("search") || "";
    setSearchQuery(initialSearch);
    fetchStudents(initialSearch);
  }, [searchParams]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }

    router.push(`?${params.toString()}`);
    fetchStudents(query);
  };

  const handleStudentSelect = async (student: Student) => {
    setSelectedStudent(student);
    try {
      const finances = await fetchStudentFinances(student.id);
      setSelectedStudentFinances(finances);
    } catch (error) {
      console.error("Error fetching student finances:", error);
    }
  };

  const handleTogglePortalAccess = async (
    studentId: string,
    enabled: boolean
  ) => {
    try {
      await toggleStudentPortal(studentId, enabled);
      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId
            ? { ...student, profileBlocked: enabled ? "No" : "Yes" }
            : student
        )
      );
    } catch (error) {
      console.error("Error toggling portal access:", error);
    }
  };

  const calculateTotalBalance = (finances: StudentFinances | null) => {
    if (!finances?.payableFees) return 0;
    return finances.payableFees.reduce((sum, fee) => sum + fee.amount, 0);
  };

  return (
    <ContentLayout title="Student Payment Management">
      <Card className="rounded-lg border-none">
        <CardContent className="p-6">
          <div className="mb-6">
            <Input
              type="search"
              placeholder="Search by name, student number or campus..."
              value={searchQuery}
              onChange={handleSearch}
              className="max-w-md"
            />
            {loading && (
              <p className="mt-2 text-sm text-gray-500">Searching...</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {loading ? (
                <DataTableSkeleton
                  columnCount={6}
                  searchableColumnCount={2}
                  filterableColumnCount={1}
                  cellWidths={[
                    "10rem",
                    "15rem",
                    "12rem",
                    "12rem",
                    "12rem",
                    "8rem",
                  ]}
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student No.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Campus</TableHead>
                        <TableHead>Balance Due</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Portal Access</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow
                          key={student.id}
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={() => handleStudentSelect(student)}
                        >
                          <TableCell>{student.admissionNumber}</TableCell>
                          <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                          <TableCell>{student.campuses}</TableCell>
                          <TableCell>R{student.payableAmounts}</TableCell>
                          <TableCell>{student.payableDueDates}</TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Switch
                              checked={student.profileBlocked === "No"}
                              onCheckedChange={(checked) =>
                                handleTogglePortalAccess(student.id, checked)
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {selectedStudent && (
              <div className="md:col-span-1">
                <Card className="sticky top-4">
                  <CardContent className="p-4">
                    <h2 className="text-xl font-semibold mb-4">
                      Student Details
                    </h2>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <p className="text-sm text-gray-500">Student Number</p>
                        <p className="font-medium">
                          {selectedStudent.admissionNumber}
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">
                          {`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedStudent.email}</p>
                      </div>
                      <div className="grid gap-2">
                        <p className="text-sm text-gray-500">ID Number</p>
                        <p className="font-medium">
                          {selectedStudent.idNumber}
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <p className="text-sm text-gray-500">Campus</p>
                        <p className="font-medium">
                          {selectedStudent.campuses}
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <p className="text-sm text-gray-500">
                          City & Guilds Number
                        </p>
                        <p className="font-medium">
                          {selectedStudent.cityAndGuildNumber}
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <p className="text-sm text-gray-500">Admission Date</p>
                        <p className="font-medium">
                          {selectedStudent.admissionDate}
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <p className="text-sm text-gray-500">
                          Total Balance Due
                        </p>
                        <p className="text-lg font-semibold text-red-600">
                          R{calculateTotalBalance(selectedStudentFinances)}
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <p className="text-sm text-gray-500">Portal Access</p>
                        <Switch
                          checked={selectedStudent.profileBlocked === "No"}
                          onCheckedChange={(checked) =>
                            handleTogglePortalAccess(
                              selectedStudent.id,
                              checked
                            )
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </ContentLayout>
  );
};

export default PayablePage;
