"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/formatDate";
import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Student {
  id: string;
  admissionNumber?: string;
  email?: string;
  idNumber?: string;
  active?: boolean;
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

interface CollectedFee {
  id: string;
  balance: string;
  credit?: number | null;
  debit?: number | null;
  description: string;
  transactionDate?: Date;
}

interface PayableFee {
  id: string;
  amount: number;
  arrears: number;
  dueDate?: Date;
  description?: string;
}

interface FinancesTabProps {
  finances: {
    collectedFees?: Array<CollectedFee>;
    payableFees?: Array<PayableFee>;
  };
  studentId: string;
  student: Student; // Added student prop
}

export function FinancesTab({
  finances,
  studentId,
  student,
}: FinancesTabProps) {
  const { collectedFees = [], payableFees = [] } = finances;

  // Calculate running balance and sort transactions by date
  const processedFees = useMemo(() => {
    // Make a copy to avoid modifying the original data
    const fees = [...collectedFees];

    // Sort by transaction date (oldest first)
    fees.sort((a, b) => {
      const dateA = a.transactionDate
        ? new Date(a.transactionDate).getTime()
        : 0;
      const dateB = b.transactionDate
        ? new Date(b.transactionDate).getTime()
        : 0;
      return dateA - dateB;
    });

    // Calculate running balance
    let runningBalance = 0;
    return fees.map((fee) => {
      // Add credits, subtract debits
      const creditAmount = fee.credit ? Number(fee.credit) : 0;
      const debitAmount = fee.debit ? Number(fee.debit) : 0;

      runningBalance += creditAmount - debitAmount;

      return {
        ...fee,
        calculatedBalance: runningBalance.toFixed(2),
      };
    });
  }, [collectedFees]);

  // For total balance display
  const currentBalance =
    processedFees.length > 0
      ? processedFees[processedFees.length - 1].calculatedBalance
      : "0.00";

  // New function to handle storing student data before navigation
  const handleViewBalance = () => {
    // Store complete student data and finances in sessionStorage
    const studentWithFinances = {
      ...student,
      finances: {
        collectedFees,
        processedFees, // Include the processed fees with calculated balances
      },
    };

    sessionStorage.setItem(
      "currentStudentDetails",
      JSON.stringify(studentWithFinances)
    );
    console.log("Stored student data for navigation:", studentId);
  };

  return (
    <div className="space-y-6">
      {/* Balance Summary */}
      <Card
        className={`${
          Number(currentBalance) < 0 ? "border-red-500" : "border-green-500"
        } border-2`}
      >
        <CardHeader>
          <CardTitle>Outstanding Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-2xl font-bold ${
              Number(currentBalance) < 0 ? "text-red-500" : "text-green-500"
            }`}
          >
            R {currentBalance}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {Number(currentBalance) < 0
              ? "Outstanding balance due"
              : Number(currentBalance) > 0
              ? "Credit balance"
              : "Balanced account"}
          </p>
        </CardContent>
      </Card>

      {/* Collected Fees Section - Now Clickable with data storage */}
      <Link
        href={`/admin/finance/student-balance/${studentId}`}
        onClick={handleViewBalance}
        className="block"
      >
        <Card className="transition-all hover:shadow-md cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Statement of Account</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1">
              <span>View Details</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {processedFees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Credit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Debit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processedFees.map((fee) => (
                      <tr key={fee.id}>
                        <td className="px-6 py-4 text-sm">
                          {formatDate(fee.transactionDate)}
                        </td>
                        <td className="px-6 py-4 text-sm">{fee.description}</td>
                        <td className="px-6 py-4 text-sm text-green-600">
                          {fee.credit
                            ? `R ${Number(fee.credit).toFixed(2)}`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-red-600">
                          {fee.debit
                            ? `R ${Number(fee.debit).toFixed(2)}`
                            : "-"}
                        </td>
                        <td
                          className={`px-6 py-4 text-sm font-medium ${
                            Number(fee.calculatedBalance) < 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          R {fee.calculatedBalance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No payment history available</p>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
