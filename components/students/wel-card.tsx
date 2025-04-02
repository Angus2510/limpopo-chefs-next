import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { IdCard, Download } from "lucide-react";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";

interface WelRecord {
  id: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  establishmentName: string;
  establishmentContact: string;
  evaluated: boolean;
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
  wellnessRecords: WelRecord[];
}

export default function WelHoursCard({
  studentData,
  wellnessRecords,
}: WelHoursCardProps) {
  const router = useRouter();
  const [totalHours, setTotalHours] = useState(0);
  const maxHours = 2000;

  useEffect(() => {
    if (wellnessRecords && wellnessRecords.length > 0) {
      const total = wellnessRecords.reduce(
        (sum, record) => sum + record.totalHours,
        0
      );
      setTotalHours(total);
    }
  }, [wellnessRecords]);

  const progressPercentage = (totalHours / maxHours) * 100;
  const remainingHours = maxHours - totalHours;

  const evaluatedHours = wellnessRecords
    .filter((record) => record.evaluated)
    .reduce((sum, record) => sum + record.totalHours, 0);

  const pendingHours = wellnessRecords
    .filter((record) => !record.evaluated)
    .reduce((sum, record) => sum + record.totalHours, 0);

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
            <span>{totalHours} hours completed</span>
            <span>{remainingHours} remaining</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-sm flex justify-between">
            <span>Total Progress</span>
            <span className="font-medium">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Target: {maxHours} hours
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm flex justify-between">
            <span>Evaluated Hours:</span>
            <span className="font-medium text-green-600">{evaluatedHours}</span>
          </div>
          {pendingHours > 0 && (
            <div className="text-sm flex justify-between">
              <span>Pending Evaluation:</span>
              <span className="font-medium text-yellow-600">
                {pendingHours}
              </span>
            </div>
          )}
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
