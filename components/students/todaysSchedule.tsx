import * as React from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample schedule data
const scheduleData = [
  { time: "09:00 AM", event: "Team Stand-up Meeting" },
  { time: "10:30 AM", event: "Client Presentation" },
  { time: "12:00 PM", event: "Lunch Break" },
  { time: "02:00 PM", event: "Project Planning Session" },
  { time: "04:30 PM", event: "Code Review" },
  { time: "06:00 PM", event: "End of Day" },
];

export function TodaysSchedule() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Todays Schedule</CardTitle>
        <CardDescription>Your daily agenda at a glance.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {scheduleData.map((item, index) => (
            <li key={index} className="flex flex-col">
              <span className="font-medium text-sm text-primary">
                {item.time}
              </span>
              <span className="text-sm">{item.event}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Updated: {new Date().toLocaleString()}
      </CardFooter>
    </Card>
  );
}
