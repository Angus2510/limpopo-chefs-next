"use client";

import React, { useState } from "react";
import { ContentLayout } from "@/components/layout/content-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getStudentsData } from "@/lib/actions/student/studentsQuery";
import WelHoursForm from "@/components/wels/WelHoursForm";
import { StudentWelRecords } from "@/components/wels/StudentWelRecords";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
}

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { students } = await getStudentsData({
        search: query,
        page: 1,
        per_page: 5,
      });

      setSearchResults(students);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setSearchResults([]);
    setSearchQuery("");
  };

  return (
    <ContentLayout title="Student WEL Hours">
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Search for Student</h2>
            <div className="relative">
              <Input
                type="search"
                placeholder="Search by name or admission number..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />

              {(searchResults.length > 0 || isSearching) && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                  {isSearching ? (
                    <div className="p-4 text-sm text-gray-500">
                      Searching...
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-auto">
                      {searchResults.map((student) => (
                        <button
                          key={student.id}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => handleStudentSelect(student)}
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
          </CardContent>
        </Card>

        {selectedStudent && (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">
                    Selected Student: {selectedStudent.firstName}{" "}
                    {selectedStudent.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Admission Number: {selectedStudent.admissionNumber}
                  </p>
                </div>
                <StudentWelRecords studentId={selectedStudent.id} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <WelHoursForm studentId={selectedStudent.id} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ContentLayout>
  );
}
