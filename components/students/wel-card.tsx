import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { IdCard } from "lucide-react";
import { Card, CardTitle, CardHeader } from "@/components/ui/card";

export default function WelHoursCard() {
  const [welHours, setWelHours] = useState(850); // Example value
  const maxHours = 2000;

  return (
    <Card className="bg-white shadow-lg  p-6 w-80 flex flex-col items-center h-fit">
      <CardHeader>
        <CardTitle>WEL Hours</CardTitle>
      </CardHeader>
      <Progress
        value={(welHours / maxHours) * 100}
        className="w-full h-4 mb-3"
      />
      <p className="text-gray-600 text-sm mb-4">
        {welHours} / {maxHours}
      </p>
      <Button className="w-full">Download SOR</Button>
    </Card>
  );
}
