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
  startDate: Date; // Kept as Date for internal consistency if ever used directly
  endDate: Date; // Kept as Date
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
    // Props receive strings as typical for JSON/API data
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

const daysOfWeek: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // Updated for 7 days
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
    // Initialize days 1-31, actual valid days will be populated by organizeMonthByWeeks
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
        // Create a deep copy to ensure we're not mutating state directly before setAttendanceData
        const newAttendanceData = JSON.parse(JSON.stringify(attendanceData));

        if (!newAttendanceData[selectedYear]) {
          newAttendanceData[selectedYear] = generateEmptyYear(selectedYear);
        }

        if (records && records.length > 0) {
          records.forEach((record) => {
            const date = new Date(record.date);
            const recordYear = date.getFullYear(); // Use year from record
            const month = months[date.getMonth()];
            const day = date.getDate();

            // Ensure year and month structures exist
            if (!newAttendanceData[recordYear]) {
              newAttendanceData[recordYear] = generateEmptyYear(recordYear);
            }
            if (!newAttendanceData[recordYear][month]) {
              newAttendanceData[recordYear][month] = {};
            }
            newAttendanceData[recordYear][month][day] =
              record.status as AttendanceType;
          });
          setAttendanceData(newAttendanceData);
        } else if (!attendanceData[selectedYear]) {
          // If no records, ensure year is initialized
          newAttendanceData[selectedYear] = generateEmptyYear(selectedYear);
          setAttendanceData(newAttendanceData);
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    if (studentId) {
      fetchAttendance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, studentId]); // attendanceData removed to prevent re-fetch loop if not careful

  useEffect(() => {
    if (welRecords && welRecords.length > 0) {
      // Create a deep copy to ensure we're not mutating state directly before setAttendanceData
      const newAttendanceData = JSON.parse(JSON.stringify(attendanceData));

      welRecords.forEach((record) => {
        const startDate = new Date(record.startDate);
        const endDate = new Date(record.endDate);

        for (
          let date = new Date(startDate);
          date <= endDate;
          date.setDate(date.getDate() + 1)
        ) {
          const year = date.getFullYear();
          const month = months[date.getMonth()];
          const day = date.getDate();

          // Apply W.E.L to all days in the range, including weekends
          if (!newAttendanceData[year]) {
            newAttendanceData[year] = generateEmptyYear(year);
          }
          if (!newAttendanceData[year][month]) {
            // Ensure month object exists
            newAttendanceData[year][month] = {};
          }
          newAttendanceData[year][month][day] = "W.E.L";
        }
      });
      setAttendanceData(newAttendanceData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [welRecords]); // attendanceData removed to prevent re-fetch loop if not careful

  const updateAttendance = (
    year: number,
    month: string,
    day: number,
    type: AttendanceType
  ): void => {
    setAttendanceData((prev) => {
      const newPrev = JSON.parse(JSON.stringify(prev)); // Deep copy
      if (!newPrev[year]) {
        newPrev[year] = generateEmptyYear(year);
      }
      if (!newPrev[year][month]) {
        newPrev[year][month] = {};
      }
      newPrev[year][month][day] = type;
      return newPrev;
    });
  };

  const cycleAttendanceType = async (
    year: number,
    month: string,
    day: number
  ): Promise<void> => {
    // Ensure attendanceData for the specific year/month/day exists or is initialized
    const currentType = attendanceData[year]?.[month]?.[day] || null;
    const types: AttendanceType[] = [
      "full",
      "absent",
      "absent with reason",
      "W.E.L",
      "sick",
      null, // Allows cycling back to no status
    ];
    const currentIndex = types.indexOf(currentType);
    const nextType = types[(currentIndex + 1) % types.length];

    if (onAttendanceChange) {
      // Check if onAttendanceChange is provided
      const date = new Date(year, months.indexOf(month), day);
      // For 'null', we might pass an empty string or a specific "cleared" status if backend expects it
      const statusToSend = nextType === null ? "" : nextType; // Adjust if backend expects different for null
      try {
        const success = await onAttendanceChange(date, statusToSend);
        if (success) {
          updateAttendance(year, month, day, nextType);
        }
      } catch (error) {
        console.error(
          "Error updating attendance via onAttendanceChange:",
          error
        );
        // Optionally, revert or handle UI feedback here
      }
    } else {
      // If no onAttendanceChange, update local state directly
      updateAttendance(year, month, day, nextType);
    }
  };

  const getDaysInMonth = (month: string, year: number): number => {
    return new Date(year, months.indexOf(month) + 1, 0).getDate();
  };

  // This function might be unused or need re-evaluation for a Sunday-first calendar.
  // Keeping it as per "do not leave out a single line of code".
  const getDayOfWeek = (year: number, month: string, day: number): number => {
    const date = new Date(year, months.indexOf(month), day);
    const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Original logic: We want 0 = Monday, 1 = Tuesday, ..., 4 = Friday
    // Weekend days should still return their proper position so we can skip them properly
    return dayIndex === 0 ? 6 : dayIndex - 1; // This converts to 0-6 for Mon-Sun (original logic)
  };

  const organizeMonthByWeeks = (
    monthString: string,
    year: number
  ): AttendanceDay[][] => {
    const monthIndex = months.indexOf(monthString);
    if (monthIndex === -1) return [];

    const daysInCurrentMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDayOfMonthDate = new Date(year, monthIndex, 1);
    const firstDayOfWeekOfMonth = firstDayOfMonthDate.getDay(); // 0 (Sun) to 6 (Sat)

    const allWeeks: AttendanceDay[][] = [];
    let currentWeek: AttendanceDay[] = Array(7) // 7 days a week
      .fill(null)
      .map(() => ({ day: null, attendance: null }));

    // Add padding for the first week if the month doesn't start on Sunday
    // `dayCounterInWeek` will start actual day population from `firstDayOfWeekOfMonth`
    let dayCounterInWeek = 0;

    // Fill initial empty cells of the first week
    for (let i = 0; i < firstDayOfWeekOfMonth; i++) {
      // currentWeek[i] is already { day: null, attendance: null }
      dayCounterInWeek++;
    }

    for (let dayOfMonth = 1; dayOfMonth <= daysInCurrentMonth; dayOfMonth++) {
      if (dayCounterInWeek === 7) {
        // New week starts
        allWeeks.push([...currentWeek]);
        currentWeek = Array(7)
          .fill(null)
          .map(() => ({ day: null, attendance: null }));
        dayCounterInWeek = 0; // Reset for Sunday
      }

      currentWeek[dayCounterInWeek] = {
        day: dayOfMonth,
        attendance: attendanceData[year]?.[monthString]?.[dayOfMonth] || null,
      };
      dayCounterInWeek++;
    }

    // Push the last week
    allWeeks.push([...currentWeek]);

    // Ensure the calendar grid always shows 6 weeks for consistent layout
    while (allWeeks.length < 6) {
      allWeeks.push(
        Array(7)
          .fill(null)
          .map(() => ({ day: null, attendance: null }))
      );
    }

    return allWeeks;
  };

  const renderAttendanceCell = (
    dayData: AttendanceDay | null,
    month: string,
    year: number
  ) => {
    if (!dayData || dayData.day === null) {
      // Render an empty placeholder for days outside the month or null days
      return (
        <div className="w-8 h-8 md:w-6 md:h-6 border border-transparent"></div>
      );
    }

    // Ensure attendanceData path exists, default to null if not
    const attendanceStatus =
      attendanceData[year]?.[month]?.[dayData.day] || null;

    const attendanceTypeConfig = attendanceStatus
      ? attendanceTypes.find((t) => t.id === attendanceStatus)
      : null; // No specific config if status is null

    // Default appearance for days with no specific attendance status (null)
    let cellColor = "bg-white hover:bg-gray-100"; // Default for clickable, empty day
    let textColor = "text-gray-700"; // Default text color

    if (attendanceTypeConfig) {
      cellColor = attendanceTypeConfig.color;
      textColor = attendanceTypeConfig.textColor || "text-black"; // Default to black if not specified
    }

    // Check if the day is a weekend (Saturday or Sunday) for styling
    // We need the actual date to determine the day of the week
    const cellDate = new Date(year, months.indexOf(month), dayData.day);
    const dayOfWeekForStyle = cellDate.getDay();
    const isWeekend = dayOfWeekForStyle === 0 || dayOfWeekForStyle === 6;

    if (!attendanceStatus && isWeekend) {
      // Weekend and no specific status
      cellColor = "bg-gray-50"; // Slightly different background for weekends
      textColor = "text-gray-400"; // Dimmer text for weekends
    } else if (!attendanceStatus && !isWeekend) {
      // Weekday and no specific status
      // Use default cellColor and textColor defined above
    }

    return (
      <div
        className={`w-8 h-8 md:w-6 md:h-6 rounded-full flex items-center justify-center text-xs cursor-pointer transition-colors duration-150 ease-in-out
          ${cellColor} ${textColor}
          border ${
            isWeekend && !attendanceStatus
              ? "border-gray-200"
              : "border-gray-300 hover:border-gray-400"
          }`}
        onClick={() => cycleAttendanceType(year, month, dayData.day as number)} // dayData.day is not null here
      >
        {dayData.day}
      </div>
    );
  };

  return (
    <div className="font-sans max-w-full p-5 text-gray-800">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Attendance Calendar</h1>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {attendanceTypes.map(
            (type) =>
              type.id && ( // Only render if type.id is not null
                <div key={type.id} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${type.color}`}></div>
                  <span className="text-sm">{type.label}</span>
                </div>
              )
          )}
          <div className="ml-auto">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="p-2 rounded border border-gray-300 text-sm cursor-pointer"
            >
              <option>All time</option>
              {/* Add more relevant options if needed */}
              <option>This month</option>
              <option>This term</option>
              {[...Array(5)].map((_, i) => {
                const yearOption = currentYear - i;
                return (
                  <option key={yearOption} value={yearOption}>
                    {yearOption}
                  </option>
                );
              })}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="ml-2 p-2 rounded border border-gray-300 text-sm cursor-pointer"
            >
              {[...Array(5)].map((_, i) => {
                const yearOption = new Date().getFullYear() - i;
                return (
                  <option key={yearOption} value={yearOption}>
                    {yearOption}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {[selectedYear, selectedYear - 1]
        .filter((year) => year >= new Date().getFullYear() - 4)
        .map(
          (
            year // Display current and previous year, or more based on selection
          ) => (
            <div
              key={year}
              className="mb-10 p-4 border rounded-lg shadow-sm bg-white"
            >
              <h2 className="text-xl font-bold mb-4 text-center text-primary-600">
                {year}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {months.map((month) => (
                  <div
                    key={`${year}-${month}`}
                    className="mb-4 p-3 border rounded-md bg-gray-50"
                  >
                    <h3 className="text-base font-semibold mb-3 text-center text-gray-700">
                      {month}
                    </h3>
                    <div className="w-full">
                      <div className="grid grid-cols-7 mb-1">
                        {" "}
                        {/* Changed to grid-cols-7 */}
                        {daysOfWeek.map((day) => (
                          <div
                            key={day}
                            className="text-xs text-center font-medium text-gray-500 pb-1"
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                      {organizeMonthByWeeks(month, year).map(
                        (week, weekIndex) => (
                          <div
                            key={weekIndex}
                            className="grid grid-cols-7 gap-0.5 mb-0.5" /* Changed to grid-cols-7, reduced gap */
                          >
                            {week.map((dayData, dayIndex) => (
                              <div
                                key={dayIndex}
                                className="flex justify-center items-center"
                              >
                                {renderAttendanceCell(dayData, month, year)}
                              </div>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
    </div>
  );
};

export default AttendanceCalendar;
