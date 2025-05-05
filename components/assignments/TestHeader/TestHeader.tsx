import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TestHeaderProps {
  timeDisplay: number;
  onSubmit: () => void;
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
export function TestHeader({ timeDisplay, onSubmit }: TestHeaderProps) {
  return (
    <Card className="bg-primary/5">
      <CardContent className="py-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Time Remaining:</p>
            <p className="text-2xl font-bold">{formatTime(timeDisplay)}</p>
          </div>
          <Button onClick={onSubmit} variant="destructive">
            Submit Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
