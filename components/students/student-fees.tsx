"use client";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { fetchStudentFinances } from "@/lib/actions/student/fetchStudentFinances";
import { ScrollArea } from "@/components/ui/scroll-area";

const formatCurrency = (amount: number | string) => {
  const numberAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(numberAmount);
};

interface Student {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface FeesCardProps {
  studentData: Student;
}

export function FeesCard({ studentData }: FeesCardProps) {
  const [finances, setFinances] = React.useState<
    Awaited<ReturnType<typeof fetchStudentFinances>>
  >({
    collectedFees: [],
    payableFees: [],
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    if (!studentData?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchStudentFinances(studentData.id);
      console.log("Fetched finances for student:", studentData.id, data);
      setFinances(data);
    } catch (err) {
      console.error("Error fetching finances:", err);
      setError(err instanceof Error ? err.message : "Failed to load finances");
    } finally {
      setLoading(false);
    }
  }, [studentData?.id]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderCard = (children: React.ReactNode) => (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle>Student Fees</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  if (loading) {
    return renderCard(
      <div className="text-sm text-muted-foreground">Loading fees...</div>
    );
  }

  if (error) {
    return renderCard(
      <div className="text-sm text-red-500">Error: {error}</div>
    );
  }

  if (!finances?.collectedFees?.length && !finances?.payableFees?.length) {
    return renderCard(
      <div className="text-sm text-muted-foreground">
        No fee information available
      </div>
    );
  }

  return renderCard(
    <ScrollArea className="h-[200px]">
      <div className="grid w-full items-center gap-6 pr-4">
        {finances.collectedFees && finances.collectedFees.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Recent Transactions</h3>
            {finances.collectedFees.map((fee) => (
              <div key={fee.id} className="border-b pb-4 last:border-b-0">
                <div className="flex flex-col space-y-1.5">
                  <Label>Description</Label>
                  <div className="text-sm font-medium">{fee.description}</div>
                </div>
                {fee.transactionDate && (
                  <div className="flex flex-col space-y-1.5">
                    <Label>Date</Label>
                    <div className="text-sm">
                      {new Date(fee.transactionDate).toLocaleDateString(
                        "en-ZA"
                      )}
                    </div>
                  </div>
                )}
                <div className="flex flex-col space-y-1.5">
                  <Label>Amount</Label>
                  <div className="text-sm font-medium">
                    {fee.debit ? (
                      <span className="text-red-600">
                        -{formatCurrency(fee.debit)}
                      </span>
                    ) : fee.credit ? (
                      <span className="text-green-600">
                        +{formatCurrency(fee.credit)}
                      </span>
                    ) : (
                      formatCurrency(fee.balance)
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {finances.payableFees && finances.payableFees.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Outstanding Fees</h3>
            {finances.payableFees.map((fee) => (
              <div key={fee.id} className="border-b pb-4 last:border-b-0">
                {fee.dueDate && (
                  <div className="flex flex-col space-y-1.5">
                    <Label>Due Date</Label>
                    <div className="text-sm">
                      {new Date(fee.dueDate).toLocaleDateString("en-ZA")}
                    </div>
                  </div>
                )}
                <div className="flex flex-col space-y-1.5">
                  <Label>Amount Due</Label>
                  <div className="text-sm font-medium">
                    {formatCurrency(fee.amount)}
                  </div>
                </div>
                {fee.arrears > 0 && (
                  <div className="flex flex-col space-y-1.5">
                    <Label>Arrears</Label>
                    <div className="text-sm font-medium text-red-600">
                      {formatCurrency(fee.arrears)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
