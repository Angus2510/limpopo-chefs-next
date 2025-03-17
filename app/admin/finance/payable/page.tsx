"use client";

import { ContentLayout } from "@/components/layout/content-layout";
import { Card, CardContent } from "@/components/ui/card";
import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTableSkeleton } from "@/components/tables/basic/data-table-skeleton";
import { getPayableData } from "@/lib/actions/finance/payableQuery";
import { toggleStudentPortal } from "@/lib/actions/student/toggleStudentPortal";
import { useRouter, useSearchParams } from "next/navigation";
import {
  searchParamsSchema,
  type GetPayableSchema,
} from "@/types/payable/payable";
import { format } from "date-fns";
import type { Student } from "@/types/finance/types";
import { useToast } from "@/components/ui/use-toast";

// Pagination constants
const PAGE_SIZES = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 25;

const PayablePage = () => {
  // State management
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTimeout = useRef<NodeJS.Timeout>();

  // Basic state
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pageCount, setPageCount] = useState(0);

  // Fetch students function
  const fetchStudents = useCallback(
    async (query: string = "") => {
      setLoading(true);
      try {
        const searchObject = {
          search: query,
          page: pageIndex + 1,
          per_page: pageSize,
          sort: "admissionNumber.asc",
          email: undefined,
          campusTitles: undefined,
          intakeGroupTitles: undefined,
        };

        const validatedParams = searchParamsSchema.parse(searchObject);
        const { students, pageCount: totalPages } = await getPayableData(
          validatedParams
        );

        const sortedStudents = students.sort((a, b) => {
          const amountA = parseFloat(a.payableAmounts) || 0;
          const amountB = parseFloat(b.payableAmounts) || 0;
          return amountB - amountA;
        });

        setStudents(sortedStudents);
        setPageCount(totalPages);
      } catch (error) {
        console.error("Error fetching students:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch students",
        });
      } finally {
        setLoading(false);
      }
    },
    [pageIndex, pageSize, toast]
  );

  // Search handler with debounce
  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      setPageIndex(0);

      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      searchTimeout.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
          params.set("search", query);
        } else {
          params.delete("search");
        }
        params.set("page", "1");
        router.push(`?${params.toString()}`);
        fetchStudents(query);
      }, 300);
    },
    [searchParams, router, fetchStudents]
  );

  // Pagination handlers
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPageIndex(newPage);
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", (newPage + 1).toString());
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      setPageSize(newSize);
      setPageIndex(0);
      const params = new URLSearchParams(searchParams.toString());
      params.set("per_page", newSize.toString());
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Student selection handler
  const handleStudentSelect = useCallback(
    (student: Student) => {
      router.push(`/admin/finance/student-balance/${student.id}`);
    },
    [router]
  );

  // Portal access toggle handler
  const handleTogglePortalAccess = useCallback(
    async (studentId: string, enabled: boolean) => {
      try {
        await toggleStudentPortal(studentId, enabled);
        setStudents((prev) =>
          prev.map((student) =>
            student.id === studentId
              ? { ...student, profileBlocked: enabled ? "No" : "Yes" }
              : student
          )
        );

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
    },
    [toast]
  );

  // Utility functions
  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch (error) {
      return dateString;
    }
  }, []);

  const formatCurrency = useCallback((amount: string | number) => {
    const value = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(value);
  }, []);

  // Initial data fetch
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1") - 1;
    const size = parseInt(
      searchParams.get("per_page") || DEFAULT_PAGE_SIZE.toString()
    );
    const initialSearch = searchParams.get("search") || "";

    setPageIndex(page);
    setPageSize(size);
    setSearchQuery(initialSearch);
    fetchStudents(initialSearch);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchParams, fetchStudents]);

  return (
    <ContentLayout title="Student Finances">
      <Card className="rounded-lg border-none">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Input
                type="search"
                placeholder="Search by name, student number, or campus..."
                value={searchQuery}
                onChange={handleSearch}
                className="max-w-sm"
              />
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => handlePageSizeChange(Number(value))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size} rows
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <DataTableSkeleton
              columnCount={7}
              searchableColumnCount={2}
              filterableColumnCount={2}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Campus</TableHead>
                    <TableHead>Amount Due</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Portal Access</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow
                      key={student.id}
                      className={
                        parseFloat(student.payableAmounts) > 0
                          ? "text-red-600"
                          : ""
                      }
                    >
                      <TableCell>{student.admissionNumber}</TableCell>
                      <TableCell>
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell>{student.campuses}</TableCell>
                      <TableCell>
                        {formatCurrency(student.payableAmounts)}
                      </TableCell>
                      <TableCell>
                        {student.payableDueDates
                          ? formatDate(student.payableDueDates)
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={student.profileBlocked === "No"}
                          onCheckedChange={(checked) =>
                            handleTogglePortalAccess(student.id, checked)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStudentSelect(student)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pageIndex - 1)}
                    disabled={pageIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pageIndex + 1)}
                    disabled={pageIndex >= pageCount - 1}
                  >
                    Next
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Page {pageIndex + 1} of {pageCount}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </ContentLayout>
  );
};

export default PayablePage;
