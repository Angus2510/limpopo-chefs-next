"use client";

import { use } from "react";
import { ContentLayout } from "@/components/layout/content-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { fetchStudentFinances } from "@/lib/actions/student/fetchStudentFinances";
import { fetchStudentData } from "@/lib/actions/student/fetchStudentData";
import { updateStudentBalance } from "@/lib/actions/finance/updateStudentBalance";
import { PaginationControls } from "@/components/tables/basic/PaginationControls";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import BackButton from "@/components/common/BackButton";

interface FinanceTransaction {
  id: string;
  balance: string;
  credit?: number;
  debit?: number;
  description: string;
  transactionDate: Date;
}

interface Student {
  id: string;
  admissionNumber: string;
  email: string;
  idNumber: string;
  active: boolean;
  campusTitle?: string;
  qualificationTitle?: string;
  intakeGroupTitle?: string;
  profile: {
    firstName: string;
    lastName: string;
    cityAndGuildNumber?: string;
    admissionDate?: string;
  };
}

interface StudentResponse {
  student: Student;
  finances: {
    collectedFees: FinanceTransaction[];
  };
}

const INITIAL_TRANSACTION = {
  description: "",
  balance: "0",
  credit: 0,
  debit: 0,
  transactionDate: new Date(),
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function StudentBalancePage({
  params: paramsPromise,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const params = use(paramsPromise);
  const { studentId } = params;

  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [newTransaction, setNewTransaction] =
    useState<Partial<FinanceTransaction>>(INITIAL_TRANSACTION);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const formatCurrency = useCallback((amount: number | string) => {
    const value = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(value);
  }, []);

  const calculatedBalance = useMemo(() => {
    return transactions.reduce((acc, fee) => {
      const creditAmount = fee.credit || 0;
      const debitAmount = fee.debit || 0;
      return acc + creditAmount - debitAmount;
    }, 0);
  }, [transactions]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "transactionDate",
        header: "Date",
        cell: (info: any) => format(new Date(info.getValue()), "dd MMM yyyy"),
      },
      {
        accessorKey: "description",
        header: "Description",
      },
      {
        accessorKey: "credit",
        header: "Credit",
        cell: (info: any) =>
          info.getValue() ? formatCurrency(info.getValue()) : "-",
      },
      {
        accessorKey: "debit",
        header: "Debit",
        cell: (info: any) =>
          info.getValue() ? formatCurrency(info.getValue()) : "-",
      },
      {
        accessorKey: "balance",
        header: "Balance",
        cell: (info: any) => formatCurrency(info.getValue()),
      },
      {
        id: "actions",
        header: "Actions",
        cell: (info: any) => (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteTransaction(info.row.original.id)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "..." : "Delete"}
          </Button>
        ),
      },
    ],
    [isSubmitting, formatCurrency]
  );

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      const newState = updater(table.getState().pagination);
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
    pageCount: Math.ceil(transactions.length / pageSize),
  });

  const fetchStudentDataById = useCallback(async () => {
    try {
      console.log("Fetching student data for ID:", studentId);
      const response = (await fetchStudentData(studentId)) as StudentResponse;
      console.log("Received student data:", response);

      if (response?.student) {
        setStudent(response.student);

        // If finances data is available in the response, use it
        if (response.finances?.collectedFees) {
          setTransactions(response.finances.collectedFees);
          const newBalance = response.finances.collectedFees.reduce(
            (acc, fee) => {
              const creditAmount = fee.credit || 0;
              const debitAmount = fee.debit || 0;
              return acc + creditAmount - debitAmount;
            },
            0
          );
          setTotalBalance(newBalance);
        }
      } else {
        throw new Error("Invalid student data structure");
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch student data",
      });
    }
  }, [studentId, toast]);

  const fetchTransactionsData = useCallback(async () => {
    try {
      const { collectedFees } = await fetchStudentFinances(studentId);
      if (Array.isArray(collectedFees)) {
        setTransactions(collectedFees);
        const newBalance = collectedFees.reduce((acc, fee) => {
          const creditAmount = fee.credit || 0;
          const debitAmount = fee.debit || 0;
          return acc + creditAmount - debitAmount;
        }, 0);
        setTotalBalance(newBalance);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch transactions",
      });
    }
  }, [studentId, toast]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await fetchStudentDataById();
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load data",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchStudentDataById, toast]);

  const handleAddTransaction = async () => {
    try {
      if (
        !newTransaction.description ||
        (!newTransaction.credit && !newTransaction.debit)
      ) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields",
        });
        return;
      }

      setIsSubmitting(true);

      await updateStudentBalance(studentId, {
        description: newTransaction.description,
        credit: newTransaction.credit,
        debit: newTransaction.debit,
        transactionDate: newTransaction.transactionDate || new Date(),
      });

      await fetchTransactionsData();
      setNewTransaction(INITIAL_TRANSACTION);

      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add transaction",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      setIsSubmitting(true);
      // TODO: Implement deletion logic here
      await fetchTransactionsData();
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete transaction",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ContentLayout title="Loading Student Data...">
        <Card className="rounded-lg border-none">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </CardContent>
        </Card>
      </ContentLayout>
    );
  }

  if (!student || !student.profile) {
    return (
      <ContentLayout title="Error Loading Student">
        <Card className="rounded-lg border-none">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-red-600">Error</h2>
              <p>Unable to load student information. Please try again later.</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout
      title={`Balance Sheet - ${student.profile.firstName} ${student.profile.lastName}`}
    >
      <BackButton />
      <Card className="rounded-lg border-none">
        <CardContent className="p-6">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Student Information</h2>
              <div className="space-y-2">
                <p className="text-gray-600">
                  Student Number: {student.admissionNumber}
                </p>
                <p className="text-gray-600">Email: {student.email}</p>
                <p className="text-gray-600">ID Number: {student.idNumber}</p>
                <p className="text-gray-600">
                  Campus: {student.campusTitle || "N/A"}
                </p>
                <p className="text-gray-600">
                  Intake Group: {student.intakeGroupTitle || "N/A"}
                </p>
                <p className="text-gray-600">
                  Qualification: {student.qualificationTitle || "N/A"}
                </p>
                <p className="text-gray-600">
                  C&G Number: {student.profile.cityAndGuildNumber || "N/A"}
                </p>
                <p className="text-gray-600">
                  Admission Date:{" "}
                  {student.profile.admissionDate
                    ? format(
                        new Date(student.profile.admissionDate),
                        "dd MMM yyyy"
                      )
                    : "N/A"}
                </p>
                <p className="text-xl font-bold text-red-600">
                  Current Balance: {formatCurrency(totalBalance)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Date</TableHead>
                  <TableHead className="w-[300px]">Description</TableHead>
                  <TableHead className="w-[150px]">Credit</TableHead>
                  <TableHead className="w-[150px]">Debit</TableHead>
                  <TableHead className="w-[150px]">Balance</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Input
                      type="date"
                      value={format(
                        newTransaction.transactionDate || new Date(),
                        "yyyy-MM-dd"
                      )}
                      onChange={(e) =>
                        setNewTransaction((prev) => ({
                          ...prev,
                          transactionDate: new Date(e.target.value),
                        }))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={newTransaction.description}
                      onChange={(e) =>
                        setNewTransaction((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Enter description"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={newTransaction.credit}
                      onChange={(e) =>
                        setNewTransaction((prev) => ({
                          ...prev,
                          credit: parseFloat(e.target.value) || 0,
                          debit: 0,
                        }))
                      }
                      placeholder="Credit amount"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={newTransaction.debit}
                      onChange={(e) =>
                        setNewTransaction((prev) => ({
                          ...prev,
                          debit: parseFloat(e.target.value) || 0,
                          credit: 0,
                        }))
                      }
                      placeholder="Debit amount"
                    />
                  </TableCell>
                  <TableCell>
                    {formatCurrency(
                      (newTransaction.credit || 0) - (newTransaction.debit || 0)
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={handleAddTransaction}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Adding..." : "Add"}
                    </Button>
                  </TableCell>
                </TableRow>

                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <PaginationControls
              table={table}
              pageIndex={pageIndex}
              pageCount={Math.ceil(transactions.length / pageSize)}
              setPageIndex={setPageIndex}
              setPageSize={setPageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          </div>
        </CardContent>
      </Card>
    </ContentLayout>
  );
}
