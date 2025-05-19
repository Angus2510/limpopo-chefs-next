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
  intakeGroupTitle?: string; // Updated to reflect the actual data property
}

interface WelHoursCardProps {
  studentData: Student;
  wellnessRecords: WelRecord[];
}

// This helper function is local to WelHoursCard and uses keyword checking
// based on the student's intake string, mimicking resultsSetup.ts logic style.
const getWelMaxHoursForIntake = (intakeString?: string): number => {
  console.log(
    "[WelHoursCard] getWelMaxHoursForIntake received intakeString:",
    intakeString
  );
  if (!intakeString || intakeString.trim() === "") {
    console.log(
      "[WelHoursCard] Intake string is empty or undefined, returning 0 hours."
    );
    return 0;
  }

  const upperIntake = intakeString.trim().toUpperCase();
  console.log(
    "[WelHoursCard] Processing upperIntake for WEL hours:",
    upperIntake
  );

  // Order of checks:
  // OCG has specific hours (2700).
  // Diploma and Pastry (900).
  // Certificate or Cook (750).
  // Award (200).

  if (upperIntake.includes("OCG")) {
    console.log("[WelHoursCard] Matched OCG, returning 2700 hours.");
    return 2700;
  }
  // Note: If an intake could be "OCG Cook" and "Cook" alone means 750,
  // the "OCG" check coming first ensures 2700 for "OCG Cook".

  if (upperIntake.includes("DIPLOMA")) {
    console.log("[WelHoursCard] Matched DIPLOMA, returning 900 hours.");
    return 900;
  }
  if (upperIntake.includes("PASTRY")) {
    console.log("[WelHoursCard] Matched PASTRY, returning 900 hours.");
    return 900;
  }
  if (upperIntake.includes("CERTIFICATE") || upperIntake.includes("COOK")) {
    console.log(
      "[WelHoursCard] Matched CERTIFICATE or COOK, returning 750 hours."
    );
    return 750;
  }
  if (upperIntake.includes("AWARD")) {
    console.log("[WelHoursCard] Matched AWARD, returning 200 hours.");
    return 200;
  }

  console.log(
    "[WelHoursCard] No WEL hour keywords matched for upperIntake:",
    upperIntake,
    "- returning 0 hours."
  );
  return 0; // Fallback default if no specific group is matched
};

export default function WelHoursCard({
  studentData,
  wellnessRecords,
}: WelHoursCardProps) {
  const router = useRouter();
  const [totalHours, setTotalHours] = useState(0);

  // Determine maxHours based on the student's intake group using the local helper function
  // CORRECTED: Using studentData?.intakeGroupTitle
  const maxHours = getWelMaxHoursForIntake(studentData?.intakeGroupTitle);

  useEffect(() => {
    if (wellnessRecords && wellnessRecords.length > 0) {
      const total = wellnessRecords.reduce(
        (sum, record) => sum + record.totalHours,
        0
      );
      setTotalHours(total);
    } else {
      setTotalHours(0); // Reset if no records
    }
  }, [wellnessRecords]);

  const progressPercentage = maxHours > 0 ? (totalHours / maxHours) * 100 : 0;
  const remainingHours = maxHours - totalHours;

  const evaluatedHours = wellnessRecords
    .filter((record) => record.evaluated)
    .reduce((sum, record) => sum + record.totalHours, 0);

  const pendingHours = wellnessRecords
    .filter((record) => !record.evaluated)
    .reduce((sum, record) => sum + record.totalHours, 0);

  const handleDownloadSOR = async () => {
    if (studentData?.id) {
      try {
        router.push(`/student/sor/${studentData.id}`);
      } catch (error) {
        console.error("Error navigating to SOR:", error);
      }
    } else {
      console.error("Student ID is undefined, cannot navigate to SOR.");
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
            <span>
              {remainingHours >= 0
                ? `${remainingHours} remaining`
                : `0 remaining`}
            </span>
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
          disabled={!studentData?.id}
        >
          <Download className="h-4 w-4" />
          View SOR
        </Button>
      </CardContent>
    </Card>
  );
}
