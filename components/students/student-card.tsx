import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StudentCard() {
  return (
    <Card className="w-[350px] h-fit">
      <CardHeader className="flex justify-between items-start">
        <Avatar className="h-28 w-28">
          <AvatarImage
            src="/placeholder.svg?height=56&width=56"
            alt="Student"
          />
          <AvatarFallback>ST</AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex">
            <span className="font-semibold w-32">Name:</span>
            <span>John Doe</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">Campus:</span>
            <span>Main Campus</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">Student number:</span>
            <span>12345678</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">Email address:</span>
            <span>john.doe@university.edu</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
