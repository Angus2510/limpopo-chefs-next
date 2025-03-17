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
import { Button } from "@/components/ui/button";
import { DataTableSkeleton } from "@/components/tables/basic/data-table-skeleton";
import { getPayableData } from "@/lib/actions/finance/payableQuery";
import { fetchStudentFinances } from "@/lib/actions/student/fetchStudentFinances";
import { toggleStudentPortal } from "@/lib/actions/student/toggleStudentPortal";
import { useRouter, useSearchParams } from "next/navigation";
import { searchParamsSchema } from "@/types/student/students";
import { format } from "date-fns";
import { Student, StudentFinances } from "@/types/finance/types";
import { useToast } from "@/components/ui/use-toast";

const PayablePage = () => {
  const { toast } = useToast();
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

      const sortedStudents = students.sort((a, b) => {
        const amountA = parseFloat(a.payableAmounts) || 0;
        const amountB = parseFloat(b.payableAmounts) || 0;
        return amountB - amountA;
      });

      setStudents(sortedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch students",
      });
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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch student finances",
      });
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

      if (selectedStudent?.id === studentId) {
        setSelectedStudent((prev) =>
          prev ? { ...prev, profileBlocked: enabled ? "No" : "Yes" } : null
        );
      }
      toast({
        title: "Success",
        description: `Portal access ${enabled ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      console.error("Error toggling portal access:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to toggle portal access",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount: string | number) => {
    const value = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(value);
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

          <div className="space-y-6">
            <div className="w-full">
              {loading ? (
                <DataTableSkeleton
                  columnCount={7}
                  searchableColumnCount={2}
                  filterableColumnCount={1}
                  cellWidths={[
                    "10%", // Student No.
                    "20%", // Name
                    "15%", // Campus
                    "15%", // Balance Due
                    "15%", // Due Date
                    "10%", // Portal Access
                    "15%", // Actions
                  ]}
                />
              ) : (
                <Table className="w-full table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[10%] whitespace-nowrap">
                        Student No.
                      </TableHead>
                      <TableHead className="w-[20%] whitespace-nowrap">
                        Name
                      </TableHead>
                      <TableHead className="w-[15%] whitespace-nowrap">
                        Campus
                      </TableHead>
                      <TableHead className="w-[15%] whitespace-nowrap">
                        Balance Due
                      </TableHead>
                      <TableHead className="w-[15%] whitespace-nowrap">
                        Due Date
                      </TableHead>
                      <TableHead className="w-[10%] whitespace-nowrap">
                        Portal Access
                      </TableHead>
                      <TableHead className="w-[15%] whitespace-nowrap">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow
                        key={student.id}
                        className={`cursor-pointer hover:bg-gray-100 ${
                          parseFloat(student.payableAmounts) > 0
                            ? "bg-red-50"
                            : ""
                        }`}
                        onClick={() => handleStudentSelect(student)}
                      >
                        <TableCell
                          className="truncate"
                          title={student.admissionNumber}
                        >
                          {student.admissionNumber}
                        </TableCell>
                        <TableCell
                          className="truncate"
                          title={`${student.firstName} ${student.lastName}`}
                        >
                          {`${student.firstName} ${student.lastName}`}
                        </TableCell>
                        <TableCell
                          className="truncate"
                          title={student.campuses}
                        >
                          {student.campuses}
                        </TableCell>
                        <TableCell
                          className={`truncate ${
                            parseFloat(student.payableAmounts) > 0
                              ? "text-red-600 font-semibold"
                              : ""
                          }`}
                        >
                          {formatCurrency(student.payableAmounts)}
                        </TableCell>
                        <TableCell className="truncate">
                          {formatDate(student.payableDueDates)}
                        </TableCell>
                        <TableCell
                          className="text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Switch
                            checked={student.profileBlocked === "No"}
                            onCheckedChange={(checked) =>
                              handleTogglePortalAccess(student.id, checked)
                            }
                          />
                        </TableCell>
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/admin/finance/student-balance/${student.id}`
                              )
                            }
                            className="w-full max-w-[120px]"
                          >
                            View Balance
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            {selectedStudent && (
              <div className="col-span-12 lg:col-span-3">
                <Card className="sticky top-4">
                  <CardContent className="p-4">
                    <h2 className="text-xl font-semibold mb-4">
                      Student Details
                    </h2>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <p className="text-sm text-gray-500">Student Number</p>
                        <p className="font-medium break-words">
                          {selectedStudent.admissionNumber}
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium break-words">
                          {`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium break-words">
                          {selectedStudent.email}
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <p className="text-sm text-gray-500">ID Number</p>
                        <p className="font-medium break-words">
                          {selectedStudent.idNumber}
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <p className="text-sm text-gray-500">Campus</p>
                        <p className="font-medium break-words">
                          {selectedStudent.campuses}
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <p className="text-sm text-gray-500">
                          City & Guilds Number
                        </p>
                        <p className="font-medium break-words">
                          {selectedStudent.cityAndGuildNumber}
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <p className="text-sm text-gray-500">Admission Date</p>
                        <p className="font-medium">
                          {formatDate(selectedStudent.admissionDate)}
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <p className="text-sm text-gray-500">
                          Total Balance Due
                        </p>
                        <p className="text-lg font-semibold text-red-600">
                          {formatCurrency(selectedStudent.payableAmounts)}
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
