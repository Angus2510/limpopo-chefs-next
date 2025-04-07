import React, { useState, useEffect } from "react";
import { getStudentAttendance } from "@/lib/actions/attendance/getStudentAttendance";

type AttendanceType =
  | "full"
  | "absent"
  | "absent with reason"
  | "W.E.L"
  | "sick"
  | null;

interface AttendanceDay {
  day: number | null;
  attendance: AttendanceType;
}

interface AttendanceRecord {
  [year: number]: {
    [month: string]: {
      [day: number]: AttendanceType;
    };
  };
}

interface WelRecord {
  startDate: Date;
  endDate: Date;
  establishmentName: string;
}

interface AttendanceTypeConfig {
  id: AttendanceType;
  label: string;
  color: string;
  textColor?: string;
}

interface AttendanceCalendarProps {
  studentId: string;
  onAttendanceChange?: (date: Date, status: string) => Promise<boolean>;
  welRecords?: {
    startDate: string;
    endDate: string;
    establishmentName: string;
  }[];
}

const attendanceTypes: AttendanceTypeConfig[] = [
  {
    id: "full",
    label: "Full day",
    color: "bg-primary-500",
    textColor: "text-white",
  },
  {
    id: "absent",
    label: "Absent",
    color: "bg-red-500",
    textColor: "text-white",
  },
  {
    id: "absent with reason",
    label: "Absent with reason",
    color: "bg-yellow-500",
    textColor: "text-black",
  },
  {
    id: "W.E.L",
    label: "W.E.L",
    color: "bg-gray-300",
    textColor: "text-black",
  },
  {
    id: "sick",
    label: "Sick leave",
    color: "bg-white border border-gray-300",
    textColor: "text-black",
  },
];

const daysOfWeek: string[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const months: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const generateEmptyYear = (
  year: number
): { [month: string]: { [day: number]: AttendanceType } } => {
  const yearData: { [month: string]: { [day: number]: AttendanceType } } = {};
  months.forEach((month) => {
    yearData[month] = {};
    for (let day = 1; day <= 31; day++) {
      yearData[month][day] = null;
    }
  });
  return yearData;
};

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  studentId,
  onAttendanceChange,
  welRecords = [],
}) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [timeFilter, setTimeFilter] = useState<string>("All time");
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord>({
    [currentYear]: generateEmptyYear(currentYear),
    [currentYear - 1]: generateEmptyYear(currentYear - 1),
  });

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const records = await getStudentAttendance(studentId, selectedYear);
        if (records && records.length > 0) {
          const newAttendanceData = { ...attendanceData };

          if (!newAttendanceData[selectedYear]) {
            newAttendanceData[selectedYear] = generateEmptyYear(selectedYear);
          }

          records.forEach((record) => {
            const date = new Date(record.date);
            const month = months[date.getMonth()];
            const day = date.getDate();
            newAttendanceData[selectedYear][month][day] = record.status;
          });

          setAttendanceData(newAttendanceData);
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    if (studentId) {
      fetchAttendance();
    }
  }, [selectedYear, studentId]);

  useEffect(() => {
    if (welRecords && welRecords.length > 0) {
      const newAttendanceData = { ...attendanceData };

      welRecords.forEach((record) => {
        const startDate = new Date(record.startDate);
        const endDate = new Date(record.endDate);

        // Loop through each day between start and end dates
        for (
          let date = new Date(startDate);
          date <= endDate;
          date.setDate(date.getDate() + 1)
        ) {
          const year = date.getFullYear();
          const month = months[date.getMonth()];
          const day = date.getDate();

          // Only update weekdays
          const dayOfWeek = date.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            if (!newAttendanceData[year]) {
              newAttendanceData[year] = generateEmptyYear(year);
            }
            newAttendanceData[year][month][day] = "W.E.L";
          }
        }
      });

      setAttendanceData(newAttendanceData);
    }
  }, [welRecords]);

  const updateAttendance = (
    year: number,
    month: string,
    day: number,
    type: AttendanceType
  ): void => {
    setAttendanceData((prev) => ({
      ...prev,
      [year]: {
        ...prev[year],
        [month]: {
          ...prev[year][month],
          [day]: type,
        },
      },
    }));
  };

  const cycleAttendanceType = async (
    year: number,
    month: string,
    day: number
  ): Promise<void> => {
    const currentType = attendanceData[year][month][day];
    const types: AttendanceType[] = [
      "full",
      "absent",
      "absent with reason",
      "W.E.L",
      "sick",
      null,
    ];
    const currentIndex = types.indexOf(currentType);
    const nextType = types[(currentIndex + 1) % types.length];

    if (nextType && onAttendanceChange) {
      const date = new Date(year, months.indexOf(month), day);
      const success = await onAttendanceChange(date, nextType);
      if (success) {
        updateAttendance(year, month, day, nextType);
      }
    } else {
      updateAttendance(year, month, day, nextType);
    }
  };

  // ... keep all existing helper functions ...
  const getDaysInMonth = (month: string, year: number): number => {
    return new Date(year, months.indexOf(month) + 1, 0).getDate();
  };

  const getDayOfWeek = (year: number, month: string, day: number): number => {
    const date = new Date(year, months.indexOf(month), day);
    const dayIndex = date.getDay();
    return dayIndex === 0 ? 6 : dayIndex - 1;
  };

  const organizeMonthByWeeks = (
    month: string,
    year: number
  ): AttendanceDay[][] => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDayOfWeek = getDayOfWeek(year, month, 1);
    const weeks: AttendanceDay[][] = [];
    let currentWeek: AttendanceDay[] = Array(5).fill({
      day: null,
      attendance: null,
    });

    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek[i] = { day: null, attendance: null };
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = getDayOfWeek(year, month, day);
      if (dayOfWeek >= 5) continue;

      if (dayOfWeek === 0 && day > 1) {
        weeks.push([...currentWeek]);
        currentWeek = Array(5).fill({ day: null, attendance: null });
      }

      currentWeek[dayOfWeek] = {
        day,
        attendance: attendanceData[year][month][day],
      };

      if (day === daysInMonth) {
        weeks.push([...currentWeek]);
      }
    }

    return weeks;
  };

  const renderAttendanceCell = (
    dayData: AttendanceDay | null,
    month: string,
    year: number
  ) => {
    if (!dayData || dayData.day === null) {
      return <div className="w-8 h-8 md:w-6 md:h-6"></div>;
    }

    const attendance = attendanceData[year][month][dayData.day];
    const attendanceType = attendance
      ? attendanceTypes.find((t) => t.id === attendance)
      : { id: null, color: "bg-gray-100", textColor: "text-gray-400" };

    return (
      <div
        className={`w-8 h-8 md:w-6 md:h-6 rounded-full flex items-center justify-center text-xs cursor-pointer ${
          attendanceType?.color
        } ${attendanceType?.textColor || ""}`}
        onClick={() => cycleAttendanceType(year, month, dayData.day)}
      >
        {dayData.day}
      </div>
    );
  };

  // Keep the existing return JSX
  return (
    <div className="font-sans max-w-full p-5 text-gray-800">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Attendance Calendar</h1>
        <div className="flex flex-wrap items-center gap-4">
          {attendanceTypes.map((type) => (
            <div key={type.id} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${type.color}`}></div>
              <span className="text-sm">{type.label}</span>
            </div>
          ))}
          <div className="ml-auto">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="p-2 rounded border border-gray-300 text-sm cursor-pointer"
            >
              <option>All time</option>
              <option>This month</option>
              <option>This term</option>
            </select>
          </div>
        </div>
      </div>

      {[selectedYear, selectedYear - 1].map((year) => (
        <div key={year} className="mb-10">
          <h2 className="text-xl font-bold mb-4">{year}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {months.map((month) => (
              <div key={`${year}-${month}`} className="mb-4">
                <h3 className="text-base font-medium mb-2">{month}</h3>
                <div className="w-full">
                  <div className="grid grid-cols-5 mb-1">
                    {daysOfWeek.map((day) => (
                      <div
                        key={day}
                        className="text-xs text-center text-gray-500"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  {organizeMonthByWeeks(month, year).map((week, weekIndex) => (
                    <div
                      key={weekIndex}
                      className="grid grid-cols-5 gap-1 mb-1"
                    >
                      {week.map((day, dayIndex) => (
                        <div key={dayIndex} className="flex justify-center">
                          {renderAttendanceCell(day, month, year)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttendanceCalendar;
