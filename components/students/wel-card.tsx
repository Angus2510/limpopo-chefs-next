import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { IdCard, Download } from "lucide-react";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";

interface WellnessRecord {
  id: string;
  student: string;
  hours: number;
  date: string;
  activity: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  description?: string;
}

interface Student {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface WelHoursCardProps {
  studentData: Student;
  wellnessRecords: WellnessRecord[];
}

export default function WelHoursCard({
  studentData,
  wellnessRecords,
}: WelHoursCardProps) {
  const router = useRouter();
  const [totalHours, setTotalHours] = useState(0);
  const [approvedHours, setApprovedHours] = useState(0);
  const [pendingHours, setPendingHours] = useState(0);
  const maxHours = 2000;

  useEffect(() => {
    if (wellnessRecords) {
      const approved = wellnessRecords
        .filter((record) => record.status === "APPROVED")
        .reduce((sum, record) => sum + record.hours, 0);

      const pending = wellnessRecords
        .filter((record) => record.status === "PENDING")
        .reduce((sum, record) => sum + record.hours, 0);

      setApprovedHours(approved);
      setPendingHours(pending);
      setTotalHours(approved);
    }
  }, [wellnessRecords]);

  const progressPercentage = (totalHours / maxHours) * 100;
  const remainingHours = maxHours - totalHours;

  const handleDownloadSOR = async () => {
    try {
      router.push(`/student/sor/${studentData.id}`);
    } catch (error) {
      console.error("Error navigating to SOR:", error);
    }
  };

  return (
    <Card className="bg-white shadow-lg w-80 h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IdCard className="h-5 w-5" />
          WEL Hours
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-4" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{totalHours.toFixed(1)} hours completed</span>
            <span>{remainingHours.toFixed(1)} remaining</span>
          </div>
        </div>

        {pendingHours > 0 && (
          <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
            {pendingHours.toFixed(1)} hours pending approval
          </div>
        )}

        <div className="space-y-1">
          <div className="text-sm flex justify-between">
            <span>Total Progress</span>
            <span className="font-medium">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Target: {maxHours} hours
          </div>
        </div>

        <Button
          className="w-full flex items-center gap-2"
          onClick={handleDownloadSOR}
        >
          <Download className="h-4 w-4" />
          View SOR
        </Button>
      </CardContent>
    </Card>
  );
}
