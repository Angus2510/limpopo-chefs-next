"use client";

import { useEffect, useState } from "react";
import { fetchStudentWelRecords } from "@/lib/actions/student/fetchStudentWelRecords";
import { Card } from "@/components/ui/card";

interface WelRecord {
  id: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  establishmentName: string;
  establishmentContact: string;
  evaluated: boolean;
}

interface StudentWelRecordsProps {
  studentId: string;
}

export function StudentWelRecords({ studentId }: StudentWelRecordsProps) {
  const [records, setRecords] = useState<WelRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true);
      try {
        const data = await fetchStudentWelRecords(studentId);
        setRecords(data);
      } catch (error) {
        console.error("Error loading WEL records:", error);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      loadRecords();
    }
  }, [studentId]);

  if (loading) {
    return <div>Loading WEL records...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Previous WEL Records</h3>
      {records.length === 0 ? (
        <p className="text-gray-500">No WEL records found</p>
      ) : (
        <div className="grid gap-4">
          {records.map((record) => (
            <Card key={record.id} className="p-4">
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="font-medium">
                    {record.establishmentName}
                  </span>
                  <span className="text-sm text-gray-500">
                    {record.totalHours} hours
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(record.startDate).toLocaleDateString()} -{" "}
                  {new Date(record.endDate).toLocaleDateString()}
                </div>
                <div className="text-sm">
                  Contact: {record.establishmentContact}
                </div>
                <div className="text-sm">
                  Status:{" "}
                  <span
                    className={
                      record.evaluated ? "text-green-600" : "text-yellow-600"
                    }
                  >
                    {record.evaluated ? "Evaluated" : "Pending Evaluation"}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
