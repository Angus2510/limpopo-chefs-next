"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/formatDate";
import { useMemo, useState } from "react";
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
  balance: string; // This seems to be the running balance from DB, we calculate our own
  credit?: number | null | string; // Allow string for parsing flexibility
  debit?: number | null | string; // Allow string for parsing flexibility
  description: string;
  transactionDate?: Date;
  calculatedBalance?: string; // For our internally calculated running balance
}

interface PayableFee {
  id: string;
  amount: number | string;
  arrears: number | string;
  dueDate?: Date;
  description?: string;
}

interface FinancesTabProps {
  finances: {
    collectedFees?: Array<CollectedFee>;
    payableFees?: Array<PayableFee>;
  };
  studentId: string;
  student: Student;
}

export function FinancesTab({
  finances,
  studentId,
  student,
}: FinancesTabProps) {
  const { collectedFees = [], payableFees = [] } = finances;
  const [showDebug, setShowDebug] = useState(false);

  // Calculate total payable (what student owes)
  const totalPayable = useMemo(() => {
    if (!payableFees || payableFees.length === 0) return 0;

    return payableFees.reduce((sum, fee) => {
      const amount =
        typeof fee.amount === "number"
          ? fee.amount
          : parseFloat(fee.amount?.toString().replace(/[^0-9.-]+/g, "") || "0");
      return sum + amount;
    }, 0);
  }, [payableFees]);

  // Calculate the earliest due date from payable fees
  const earliestDueDate = useMemo(() => {
    if (!payableFees || payableFees.length === 0) {
      return null;
    }

    let earliest: Date | null = null;
    for (const fee of payableFees) {
      if (fee.dueDate) {
        const currentDueDate = new Date(fee.dueDate);
        if (!earliest || currentDueDate < earliest) {
          earliest = currentDueDate;
        }
      }
    }
    return earliest;
  }, [payableFees]);

  // Calculate running balance and sort transactions by date
  const processedFees = useMemo(() => {
    const fees = [...collectedFees];

    fees.sort((a, b) => {
      const dateA = a.transactionDate
        ? new Date(a.transactionDate).getTime()
        : 0;
      const dateB = b.transactionDate
        ? new Date(b.transactionDate).getTime()
        : 0;
      return dateA - dateB;
    });

    let runningBalance = 0;
    return fees.map((fee) => {
      const creditAmount = fee.credit
        ? typeof fee.credit === "number"
          ? fee.credit
          : parseFloat(fee.credit.toString().replace(/[^0-9.-]+/g, "") || "0")
        : 0;
      const debitAmount = fee.debit
        ? typeof fee.debit === "number"
          ? fee.debit
          : parseFloat(fee.debit.toString().replace(/[^0-9.-]+/g, "") || "0")
        : 0;

      runningBalance += creditAmount - debitAmount;

      return {
        ...fee,
        calculatedBalance: runningBalance.toFixed(2),
      };
    });
  }, [collectedFees]);

  // Calculate total collected from transactions
  const totalCollected = useMemo(() => {
    return processedFees.reduce((sum, fee) => {
      const creditAmount = fee.credit
        ? typeof fee.credit === "number"
          ? fee.credit
          : parseFloat(fee.credit.toString().replace(/[^0-9.-]+/g, "") || "0")
        : 0;
      // Assuming debits in collectedFees are charges against the student, reducing the "collected" amount if it's a refund or reversal.
      // If debits are new charges that should *increase* what's effectively collected (e.g. shop purchases on account), this logic might differ.
      // Standard interpretation: sum of credits (payments) - sum of debits (refunds/reversals of payments).
      const debitAmount = fee.debit
        ? typeof fee.debit === "number"
          ? fee.debit
          : parseFloat(fee.debit.toString().replace(/[^0-9.-]+/g, "") || "0")
        : 0;
      return sum + creditAmount - debitAmount;
    }, 0);
  }, [processedFees]);

  // This is the actual net balance: what the student has paid vs what they owe overall.
  const netOverallBalance = totalCollected - totalPayable;
  const formattedNetOverallBalance = netOverallBalance.toFixed(2);

  // outstandingAmountDisplay is the total amount of fees assigned to be paid
  const outstandingAmountDisplay = useMemo(() => {
    // Calculate total payable - MAKE IT MATCH payableQuery.ts
    const totalPayable = payableFees.reduce((sum, fee) => {
      const amount =
        typeof fee.amount === "number"
          ? fee.amount
          : parseFloat(fee.amount?.toString() || "0");
      return sum + amount;
    }, 0);

    return totalPayable.toFixed(2); // Just show the total payable amount
  }, [payableFees]);

  const handleViewBalance = () => {
    const studentWithFinances = {
      ...student,
      finances: {
        collectedFees,
        payableFees,
        processedFees,
        totalPayable: totalPayable.toFixed(2),
        totalCollected: totalCollected.toFixed(2),
        netOverallBalance: formattedNetOverallBalance,
        outstandingAmountDisplay: outstandingAmountDisplay, // Add this for context on the next page if needed
      },
    };

    sessionStorage.setItem(
      "currentStudentDetails",
      JSON.stringify(studentWithFinances)
    );
    console.log(
      "Stored student data for navigation (FinancesTab):",
      studentWithFinances
    );
  };

  return (
    <div className="space-y-6">
      {/* Outstanding Amount Card */}
      <Card
        className={`${
          Number(outstandingAmountDisplay) > 0
            ? "border-red-500"
            : "border-green-500"
        } border-2`}
      >
        <CardHeader>
          <CardTitle>Outstanding Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-2xl font-bold ${
              Number(outstandingAmountDisplay) > 0
                ? "text-red-500"
                : "text-green-500"
            }`}
          >
            R {outstandingAmountDisplay}
          </p>
          {earliestDueDate && (
            <p className="text-sm text-gray-500 mt-1">
              Due by: {formatDate(earliestDueDate)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Collected Fees Section - Statement of Account */}
      <Link
        href={`/admin/finance/student-balance/${studentId}`}
        onClick={handleViewBalance}
        className="block"
      >
        <Card className="transition-all hover:shadow-md cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Statement of Account</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1">
              <span>View Details & Transactions</span>
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
                        Debit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Credit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Running Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processedFees.map((fee) => (
                      <tr key={fee.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {fee.transactionDate
                            ? formatDate(fee.transactionDate)
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {fee.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {fee.debit && Number(fee.debit) !== 0
                            ? `R ${Number(fee.debit).toFixed(2)}`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {fee.credit && Number(fee.credit) !== 0
                            ? `R ${Number(fee.credit).toFixed(2)}`
                            : "-"}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
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
              <p className="text-gray-500">
                No payment history or transactions available.
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
