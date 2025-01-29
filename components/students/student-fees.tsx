import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function FeesCard() {
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
              June 15, 2023
            </div>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="amount">Amount</Label>
            <div id="amount" className="text-sm font-medium">
              $500.00
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
