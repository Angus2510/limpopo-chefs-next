"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/formatDate";

interface FinancesTabProps {
  finances: {
    collectedFees?: Array<{
      id: string;
      balance: string;
      credit?: number;
      debit?: number;
      description: string;
      transactionDate?: Date;
    }>;
    payableFees?: Array<{
      id: string;
      amount: number;
      arrears: number;
      dueDate?: Date;
      description?: string;
    }>;
  };
}

export function FinancesTab({ finances }: FinancesTabProps) {
  const { collectedFees = [], payableFees = [] } = finances;

  return (
    <div className="space-y-6">
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
          {collectedFees.length > 0 ? (
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
                  {collectedFees.map((fee) => (
                    <tr key={fee.id}>
                      <td className="px-6 py-4 text-sm">
                        {formatDate(fee.transactionDate)}
                      </td>
                      <td className="px-6 py-4 text-sm">{fee.description}</td>
                      <td className="px-6 py-4 text-sm">
                        R {fee.credit?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        R {fee.debit?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-4 text-sm">R {fee.balance}</td>
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
