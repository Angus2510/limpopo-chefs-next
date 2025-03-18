"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/formatDate";
import { useMemo } from "react";

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
}

export function FinancesTab({ finances }: FinancesTabProps) {
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

  return (
    <div className="space-y-6">
      {/* Balance Summary */}
      <Card
        className={`${
          Number(currentBalance) < 0 ? "border-red-500" : "border-green-500"
        } border-2`}
      >
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
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

      {/* Payable Fees Section */}
      <Card>
        <CardHeader>
          <CardTitle>Payable Fees</CardTitle>
        </CardHeader>
        <CardContent>
          {payableFees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Arrears
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payableFees.map((fee) => (
                    <tr key={fee.id}>
                      <td className="px-6 py-4 text-sm">
                        {fee.description || "Fee"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        R {fee.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        R {fee.arrears.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {formatDate(fee.dueDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No payable fees</p>
          )}
        </CardContent>
      </Card>

      {/* Collected Fees Section */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
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
                        {fee.debit ? `R ${Number(fee.debit).toFixed(2)}` : "-"}
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
    </div>
  );
}
