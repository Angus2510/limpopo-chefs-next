// components/AttendanceCalendar.tsx
import React, { useState } from "react";

type AttendanceType = "full" | "half" | "lesson" | "sick" | null;

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

interface AttendanceTypeConfig {
  id: AttendanceType;
  label: string;
  color: string;
  textColor?: string;
}

const attendanceTypes: AttendanceTypeConfig[] = [
  { id: "full", label: "Full day", color: "bg-black", textColor: "text-white" },
  {
    id: "half",
    label: "Half day",
    color: "bg-gray-500",
    textColor: "text-white",
  },
  {
    id: "lesson",
    label: "One lesson",
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

// Sample data structure
const generateEmptyYear = (
  year: number
): { [month: string]: { [day: number]: AttendanceType } } => {
  const yearData: { [month: string]: { [day: number]: AttendanceType } } = {};
  months.forEach((month) => {
    yearData[month] = {};
    // Generate 31 days per month (we'll handle actual days when rendering)
    for (let day = 1; day <= 31; day++) {
      yearData[month][day] = null; // null means no attendance recorded
    }
  });
  return yearData;
};

const AttendanceCalendar: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [timeFilter, setTimeFilter] = useState<string>("All time");

  // Sample data - in a real app, this would come from your database
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord>({
    [currentYear]: generateEmptyYear(currentYear),
    [currentYear - 1]: generateEmptyYear(currentYear - 1),
  });

  // Function to update attendance
  const updateAttendance = (
    year: number,
    month: string,
    day: number,
    type: AttendanceType
  ): void => {
    const newData = { ...attendanceData };
    newData[year][month][day] = type;
    setAttendanceData(newData);
  };

  // Function to cycle through attendance types on click
  const cycleAttendanceType = (
    year: number,
    month: string,
    day: number
  ): void => {
    const currentType = attendanceData[year][month][day];
    let nextType: AttendanceType;

    switch (currentType) {
      case null:
        nextType = "full";
        break;
      case "full":
        nextType = "half";
        break;
      case "half":
        nextType = "lesson";
        break;
      case "lesson":
        nextType = "sick";
        break;
      case "sick":
        nextType = null;
        break;
      default:
        nextType = "full";
    }

    updateAttendance(year, month, day, nextType);
  };

  // Function to get days in a month
  const getDaysInMonth = (month: string, year: number): number => {
    return new Date(year, months.indexOf(month) + 1, 0).getDate();
  };

  // Function to get the day of week for a specific date
  const getDayOfWeek = (year: number, month: string, day: number): number => {
    const date = new Date(year, months.indexOf(month), day);
    const dayIndex = date.getDay();
    // Convert from 0-6 (Sunday-Saturday) to 1-5 (Monday-Friday)
    return dayIndex === 0 ? 6 : dayIndex - 1;
  };

  // Organize days into weeks for display
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

    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek[i] = { day: null, attendance: null };
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = getDayOfWeek(year, month, day);

      // Skip weekends (5 and 6 are Saturday and Sunday)
      if (dayOfWeek >= 5) continue;

      // If we've filled a week, start a new one
      if (dayOfWeek === 0 && day > 1) {
        weeks.push([...currentWeek]);
        currentWeek = Array(5).fill({ day: null, attendance: null });
      }

      currentWeek[dayOfWeek] = {
        day,
        attendance: attendanceData[year][month][day],
      };

      // If it's the last day, add the final week
      if (day === daysInMonth) {
        weeks.push([...currentWeek]);
      }
    }

    return weeks;
  };

  // Render the attendance cell
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

  return (
    <div className="font-sans max-w-full p-5 text-gray-800">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">
          Child&apos;s Attendance and Success
        </h1>
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
