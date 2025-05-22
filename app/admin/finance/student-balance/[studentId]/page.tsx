"use client";

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
import { fetchStudentData as fetchStudentDetails } from "@/lib/actions/student/fetchStudentData";
import { useParams } from "next/navigation";

import {
  updateStudentBalance,
  deleteTransaction,
  editTransaction,
} from "@/lib/actions/finance/updateStudentBalance";
import { PaginationControls } from "@/components/tables/basic/PaginationControls";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import BackButton from "@/components/common/BackButton";

interface FinanceTransaction {
  id: string;
  balance: string;
  credit?: number | { [key: string]: any };
  debit?: number | { [key: string]: any };
  description: string;
  transactionDate?: Date;
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

export default function StudentBalancePage() {
  // Get params from the URL using the useParams hook
  const params = useParams();
  const studentId = params.studentId as string;
  const { toast } = useToast();

  // State Management
  const [student, setStudent] = useState<Student | null>(null);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [newTransaction, setNewTransaction] =
    useState<Partial<FinanceTransaction>>(INITIAL_TRANSACTION);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] =
    useState<Partial<FinanceTransaction>>(INITIAL_TRANSACTION);

  useEffect(() => {
    // Try to get stored student details
    if (loading && studentId) {
      try {
        const storedStudentJSON = sessionStorage.getItem(
          "currentStudentDetails"
        );
        if (storedStudentJSON) {
          const storedStudent = JSON.parse(storedStudentJSON);
          if (storedStudent.id === studentId) {
            console.log("Using stored student data:", storedStudent);
            setStudent(storedStudent);

            // If you also stored finance data, you could use that too
            if (storedStudent.finances?.collectedFees) {
              setTransactions(storedStudent.finances.collectedFees);

              // Calculate total balance
              const balance = storedStudent.finances.collectedFees.reduce(
                (acc, fee) => {
                  const credit = Number(fee.credit) || 0;
                  const debit = Number(fee.debit) || 0;
                  return acc + credit - debit;
                },
                0
              );

              setTotalBalance(balance);
              setLoading(false); // Skip the API call entirely if we have complete data
            }
          }
        }
      } catch (error) {
        console.error("Error retrieving stored student data:", error);
      }
    }
  }, [studentId, loading]);
  // Fetch student data
  const fetchStudentData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch student data
      const studentResponse = await fetchStudentDetails(studentId);
      if (!studentResponse || !studentResponse.student) {
        throw new Error("Failed to fetch student data");
      }
      setStudent(studentResponse.student);

      // Fetch finances
      const financesResponse = await fetchStudentFinances(studentId);

      // Only work with collectedFees, ignore payableFees for balance calculations
      const collectedFees = financesResponse?.collectedFees || [];
      setTransactions(collectedFees);

      // Calculate running balance from transactions only
      const runningBalance = collectedFees.reduce((acc, fee) => {
        const credit = Number(fee.credit) || 0;
        const debit = Number(fee.debit) || 0;
        return acc + credit - debit;
      }, 0);

      // Set total balance to just the running transaction balance
      setTotalBalance(runningBalance);
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch student data",
      });
    } finally {
      setLoading(false);
    }
  }, [studentId, toast]);

  // Format currency helper
  const formatCurrency = useCallback((amount: number | string) => {
    const value = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(value);
  }, []);

  // Handle adding new transaction
  const handleAddTransaction = async () => {
    try {
      if (!newTransaction.description) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Description is required",
        });
        return;
      }

      if (!newTransaction.credit && !newTransaction.debit) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Either credit or debit amount is required",
        });
        return;
      }

      setIsSubmitting(true);

      // Format the data to match the schema
      const transactionData = {
        description: newTransaction.description,
        credit: newTransaction.credit ? Number(newTransaction.credit) : null,
        debit: newTransaction.debit ? Number(newTransaction.debit) : null,
        transactionDate: newTransaction.transactionDate || new Date(),
      };

      console.log("Sending transaction data:", transactionData);

      const result = await updateStudentBalance(studentId, transactionData);

      if (result.success) {
        await fetchStudentData();
        setNewTransaction(INITIAL_TRANSACTION);
        toast({
          title: "Success",
          description: "Transaction added successfully",
        });
      } else {
        throw new Error(result.error || "Failed to add transaction");
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add transaction",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  // Handle edit transaction
  const handleStartEdit = useCallback((transaction: FinanceTransaction) => {
    setEditingId(transaction.id);
    setEditForm({
      description: transaction.description,
      credit: transaction.credit,
      debit: transaction.debit,
      transactionDate: transaction.transactionDate,
    });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditForm(INITIAL_TRANSACTION);
  }, []);

  const handleSaveEdit = useCallback(
    async (transactionId: string) => {
      try {
        if (!editForm.description || (!editForm.credit && !editForm.debit)) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please fill in all required fields",
          });
          return;
        }

        setIsSubmitting(true);
        await editTransaction(studentId, transactionId, {
          description: editForm.description,
          credit: editForm.credit,
          debit: editForm.debit,
          transactionDate: editForm.transactionDate || new Date(),
        });

        await fetchStudentData();
        setEditingId(null);
        setEditForm(INITIAL_TRANSACTION);
        toast({
          title: "Success",
          description: "Transaction updated successfully",
        });
      } catch (error) {
        console.error("Error updating transaction:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update transaction",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [studentId, editForm, toast, fetchStudentData]
  );

  // Handle delete transaction
  const handleDeleteTransaction = useCallback(
    async (transactionId: string) => {
      if (!confirm("Are you sure you want to delete this transaction?")) {
        return;
      }

      try {
        setIsSubmitting(true);
        await deleteTransaction(studentId, transactionId);
        await fetchStudentData();
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
    },
    [studentId, toast, fetchStudentData]
  );

  // Handle form input changes
  const handleNewTransactionChange = useCallback(
    (field: keyof FinanceTransaction, value: any) => {
      setNewTransaction((prev) => ({
        ...prev,
        [field]: value,
        // Clear opposite field when credit/debit is entered
        ...(field === "credit"
          ? { debit: 0 }
          : field === "debit"
          ? { credit: 0 }
          : {}),
      }));
    },
    []
  );

  const handleEditFormChange = useCallback(
    (field: keyof FinanceTransaction, value: any) => {
      setEditForm((prev) => ({
        ...prev,
        [field]: value,
        // Clear opposite field when credit/debit is entered
        ...(field === "credit"
          ? { debit: 0 }
          : field === "debit"
          ? { credit: 0 }
          : {}),
      }));
    },
    []
  );

  // Pagination handlers
  const handlePageChange = useCallback((newPage: number) => {
    setPageIndex(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPageIndex(0); // Reset to first page when changing page size
  }, []);

  // Columns with debit and credit swapped
  const columns = useMemo<ColumnDef<FinanceTransaction>[]>(
    () => [
      {
        accessorKey: "transactionDate",
        header: "Date",
        cell: (info) => {
          const value = info.getValue() as Date;
          if (editingId === info.row.original.id) {
            return (
              <Input
                type="date"
                value={format(
                  editForm.transactionDate || new Date(),
                  "yyyy-MM-dd"
                )}
                onChange={(e) =>
                  handleEditFormChange(
                    "transactionDate",
                    new Date(e.target.value)
                  )
                }
              />
            );
          }
          return format(new Date(value), "dd MMM yyyy");
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: (info) => {
          if (editingId === info.row.original.id) {
            return (
              <Input
                value={editForm.description}
                onChange={(e) =>
                  handleEditFormChange("description", e.target.value)
                }
                placeholder="Enter description"
              />
            );
          }
          return info.getValue() as string;
        },
      },
      // SWAPPED: Debit now comes before Credit
      {
        accessorKey: "debit",
        header: "Debit",
        cell: (info) => {
          if (editingId === info.row.original.id) {
            return (
              <Input
                type="number"
                value={editForm.debit || ""}
                onChange={(e) =>
                  handleEditFormChange(
                    "debit",
                    e.target.value ? parseFloat(e.target.value) : 0
                  )
                }
                placeholder="Enter debit amount"
              />
            );
          }
          const value = info.getValue();
          return value ? formatCurrency(value as number) : "-";
        },
      },
      {
        accessorKey: "credit",
        header: "Credit",
        cell: (info) => {
          if (editingId === info.row.original.id) {
            return (
              <Input
                type="number"
                value={editForm.credit || ""}
                onChange={(e) =>
                  handleEditFormChange(
                    "credit",
                    e.target.value ? parseFloat(e.target.value) : 0
                  )
                }
                placeholder="Enter credit amount"
              />
            );
          }
          const value = info.getValue();
          return value ? formatCurrency(value as number) : "-";
        },
      },
      {
        accessorKey: "balance",
        header: "Balance",
        cell: (info) => formatCurrency(info.getValue() as string),
      },
      {
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="space-x-2">
            {editingId === info.row.original.id ? (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleSaveEdit(info.row.original.id)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleStartEdit(info.row.original)}
                  disabled={isSubmitting}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteTransaction(info.row.original.id)}
                  disabled={isSubmitting}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        ),
      },
    ],
    [
      editingId,
      editForm,
      isSubmitting,
      formatCurrency,
      handleEditFormChange,
      handleSaveEdit,
      handleCancelEdit,
      handleStartEdit,
      handleDeleteTransaction,
    ]
  );

  // Table configuration
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
      const newState = updater({
        pageIndex,
        pageSize,
      });
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
    pageCount: Math.ceil(transactions.length / pageSize),
    manualPagination: true,
  });

  return (
    <ContentLayout
      title={`Student Balance - ${student?.profile.firstName} ${student?.profile.lastName}`}
    >
      <BackButton />
      <Card className="rounded-lg border-none">
        <CardContent className="p-6">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Student Information</h3>
                  <p>Admission Number: {student?.admissionNumber}</p>
                  <p>Course: {student?.qualificationTitle}</p>
                  <p>Campus: {student?.campusTitle}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-semibold">Balance Summary</h3>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalBalance)}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
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
                            handleNewTransactionChange(
                              "transactionDate",
                              new Date(e.target.value)
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Description"
                          value={newTransaction.description}
                          onChange={(e) =>
                            handleNewTransactionChange(
                              "description",
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                      {/* Swapped order of debit and credit inputs */}
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Debit amount"
                          value={newTransaction.debit || ""}
                          onChange={(e) => {
                            const value = e.target.value
                              ? parseFloat(e.target.value)
                              : 0;
                            handleNewTransactionChange("debit", value);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Credit amount"
                          value={newTransaction.credit || ""}
                          onChange={(e) => {
                            const value = e.target.value
                              ? parseFloat(e.target.value)
                              : 0;
                            handleNewTransactionChange("credit", value);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {formatCurrency(
                          (newTransaction.credit || 0) -
                            (newTransaction.debit || 0)
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={handleAddTransaction}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Adding..." : "Add Transaction"}
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
            </>
          )}
        </CardContent>
      </Card>
    </ContentLayout>
  );
}
