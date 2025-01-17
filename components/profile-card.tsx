import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";

export function ProfileCard() {
  return (
    <Card className="w-[350px]">
      <CardHeader className="relative h-24">
        <Avatar className="absolute top-4 right-4 h-16 w-16">
          <AvatarImage
            src="/placeholder.svg?height=64&width=64"
            alt="Profile picture"
          />
          <AvatarFallback>UN</AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">User Name</h2>
          <p className="text-sm text-muted-foreground">
            Student Number: ST12345
          </p>
          <p className="text-sm text-muted-foreground">
            Email: user@example.com
          </p>
          <p className="text-sm text-muted-foreground">Campus: Main Campus</p>
        </div>
      </CardContent>
    </Card>
  );
}
