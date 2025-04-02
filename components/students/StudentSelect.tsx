"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { getStudentsData } from "@/lib/actions/student/studentsQuery";
import { useDebounce } from "@/hooks/useDebounce";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
}

interface StudentSelectProps {
  onStudentSelect: (student: Student | null) => void;
}

export function StudentSelect({ onStudentSelect }: StudentSelectProps) {
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const searchStudents = async () => {
      if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { students } = await getStudentsData({
          search: debouncedSearchQuery,
          page: 1,
          per_page: 5,
          sort: "admissionNumber.asc",
        });

        const formattedStudents = students.map((student) => ({
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          admissionNumber: student.admissionNumber,
        }));

        setSearchResults(formattedStudents);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchStudents();
  }, [debouncedSearchQuery]);

  return (
    <div className="w-full space-y-4">
      <Input
        type="search"
        placeholder="Search by name or admission number..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />

      {(searchResults.length > 0 || isSearching) && (
        <div className="w-full bg-white border border-gray-200 rounded-md shadow-lg">
          {isSearching ? (
            <div className="p-4 text-sm text-gray-500">Searching...</div>
          ) : (
            <div className="p-2 space-y-1">
              {searchResults.map((student) => (
                <button
                  key={student.id}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md transition-colors"
                  onClick={() => {
                    onStudentSelect(student);
                    setSearchResults([]);
                    setSearchQuery("");
                  }}
                >
                  <div className="font-medium">
                    {student.firstName} {student.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {student.admissionNumber}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
