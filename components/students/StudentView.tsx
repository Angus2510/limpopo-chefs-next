"use client";
import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define prop type for the component
interface StudentViewProps {
  data: {
    student: any;
    guardians: any[];
    results?: any[];
    wellnessRecords?: any[];
    finances?: {
      collectedFees?: any[];
      payableFees?: any[];
    };
    documents?: any[];
  };
}

// Pure presentation component - receives all data via props
const StudentView = ({ data }: StudentViewProps) => {
  const {
    student,
    guardians = [],
    results = [],
    wellnessRecords = [],
    finances = {},
    documents = [],
  } = data;
  const { profile = {} } = student || {};
  const { address = {} } = profile;

  // Format dates
  const formatDate = (date: string | Date) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "PPP");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar/Photo */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 relative rounded-md overflow-hidden border">
                {student?.avatarUrl ? (
                  <Image
                    src={student.avatarUrl}
                    alt={`${profile?.firstName || ""} ${
                      profile?.lastName || ""
                    }`}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-3xl">
                      {profile?.firstName?.[0] || ""}
                      {profile?.lastName?.[0] || ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p>
                  {profile?.firstName || ""} {profile?.middleName || ""}{" "}
                  {profile?.lastName || ""}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">ID Number</h3>
                <p>{profile?.idNumber || "N/A"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Date of Birth
                </h3>
                <p>{formatDate(profile?.dateOfBirth)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                <p>{profile?.gender || "N/A"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p>{student?.email || "N/A"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Mobile Number
                </h3>
                <p>{profile?.mobileNumber || "N/A"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Admission Number
                </h3>
                <p>{student?.admissionNumber || "N/A"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Admission Date
                </h3>
                <p>{formatDate(profile?.admissionDate)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Campus</h3>
              <p>{student?.campusTitle || "N/A"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Qualification
              </h3>
              <p>{student?.qualificationTitle || "N/A"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Intake Group
              </h3>
              <p>{student?.intakeGroupTitle || "N/A"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p>{student?.active ? "Active" : "Inactive"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                City & Guild Number
              </h3>
              <p>{profile?.cityAndGuildNumber || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{address?.street1 || "N/A"}</p>
          {address?.street2 && <p>{address.street2}</p>}
          <p>
            {[address?.city, address?.province, address?.postalCode]
              .filter(Boolean)
              .join(", ")}
          </p>
          <p>{address?.country || "N/A"}</p>
        </CardContent>
      </Card>

      {/* Guardians */}
      <Card>
        <CardHeader>
          <CardTitle>Guardian Information</CardTitle>
        </CardHeader>
        <CardContent>
          {guardians && guardians.length > 0 ? (
            <div className="space-y-6">
              {guardians.map((guardian, index) => (
                <div
                  key={guardian.id || index}
                  className="border-t pt-4 first:border-0 first:pt-0"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Name
                      </h3>
                      <p>
                        {guardian.firstName || ""} {guardian.lastName || ""}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Relationship
                      </h3>
                      <p>{guardian.relation || "N/A"}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Email
                      </h3>
                      <p>{guardian.email || "N/A"}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Phone
                      </h3>
                      <p>{guardian.mobileNumber || "N/A"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No guardians listed</p>
          )}
        </CardContent>
      </Card>

      {/* Results, Finances, Documents in Tabs */}
      <Tabs defaultValue="results">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Results Tab */}
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Academic Results</CardTitle>
            </CardHeader>
            <CardContent>
              {results && results.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assignment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.map((result, index) => (
                        <tr key={result.id || index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {formatDate(result.dateTaken)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {result.assignment || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {result.percent || 0}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {result.status || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No results available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finances Tab */}
        <TabsContent value="finances">
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Implement finances view here */}
              <p className="text-gray-500">
                Financial records will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <ul className="space-y-2">
                  {documents.map((doc, index) => (
                    <li key={doc.id || index} className="flex items-center">
                      <span className="mr-2">📄</span>
                      <span>
                        {doc.title || doc.filename || `Document ${index + 1}`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No documents available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentView;
