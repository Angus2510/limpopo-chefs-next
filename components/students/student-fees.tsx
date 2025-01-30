import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface Finance {
  id: string;
  student: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: "PAID" | "PENDING" | "OVERDUE";
  description?: string;
}

interface Student {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface FeesCardProps {
  studentData: Student;
  finances: Finance | null;
}

export function FeesCard({ studentData, finances }: FeesCardProps) {
  // Format currency with proper locale and currency symbol
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get status color based on payment status
  const getStatusColor = (status: Finance["status"]) => {
    switch (status) {
      case "PAID":
        return "text-green-600";
      case "OVERDUE":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  if (!finances) {
    return (
      <Card className="w-[250px] h-fit">
        <CardHeader>
          <CardTitle>Fees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No fee information available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[250px] h-fit">
      <CardHeader>
        <CardTitle>Fees</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="dueDate">Due Date</Label>
            <div id="dueDate" className="text-sm font-medium">
              {formatDate(finances.dueDate)}
            </div>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="amount">Amount</Label>
            <div id="amount" className="text-sm font-medium">
              {formatCurrency(finances.amount, finances.currency)}
            </div>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <div
              id="status"
              className={`text-sm font-medium ${getStatusColor(
                finances.status
              )}`}
            >
              {finances.status}
            </div>
          </div>
          {finances.description && (
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <div id="description" className="text-sm text-muted-foreground">
                {finances.description}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
