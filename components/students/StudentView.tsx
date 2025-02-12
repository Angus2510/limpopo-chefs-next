import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

// Define a type for the data shape returned from fetchStudentData.
// (Adjust the types below if needed to match your actual schema.)
interface StudentViewProps {
  data: {
    student: {
      id: string;
      admissionNumber: string;
      email: string;
      profile: {
        firstName: string;
        middleName: string;
        lastName: string;
        dateOfBirth: string;
        gender: string;
        idNumber: string;
        mobileNumber: string;
        admissionDate: string;
        cityAndGuildNumber: string;
        homeLanguage: string;
      };
      inactiveReason?: string;
      campus: string; // Already joined string
      intakeGroup: string[]; // Array of titles
      qualification: string[]; // Expected to be an array
      avatarUrl?: string;
    };
    results: Array<{
      assignment: string;
      dateTaken: Date;
      scores?: number;
      moderatedscores?: number;
      percent?: number;
      status: string;
    }>;
    wellnessRecords: Array<{
      establishmentName: string;
      establishmentContact: string;
      startDate: Date;
      endDate: Date;
      totalHours: number;
      evaluated: boolean;
    }>;
    finances: {
      collectedFees: Array<{
        description: string;
        credit?: number;
        debit?: number;
        balance: string;
        transactionDate?: Date;
      }>;
      payableFees: Array<{
        amount: number;
        arrears: number;
        dueDate?: Date;
      }>;
    };
    documents: Array<{
      id: string;
      title: string;
      description: string;
      documentUrl: string;
      uploadDate?: Date;
    }>;
    // Optionally, if you later decide to use learningMaterials or events:
    learningMaterials?: any[];
    events?: any[];
  };
}

export default function StudentView({ data }: StudentViewProps) {
  // Destructure the data returned from fetchStudentData
  const { student, results, wellnessRecords, finances, documents } = data;

  return (
    <div className="container mx-auto p-4">
      {/* Student Header Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            {student.avatarUrl ? (
              <Image
                src={student.avatarUrl}
                alt={`${student.profile.firstName} ${student.profile.lastName}`}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200" />
            )}
            <div>
              <CardTitle>
                {student.profile.firstName} {student.profile.middleName}{" "}
                {student.profile.lastName}
              </CardTitle>
              <p className="text-sm text-gray-500">
                Student ID: {student.admissionNumber}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="wel">WEL Records</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Basic Details</h3>
                  <p>Date of Birth: {student.profile.dateOfBirth}</p>
                  <p>Gender: {student.profile.gender}</p>
                  <p>ID Number: {student.profile.idNumber}</p>
                  <p>Mobile: {student.profile.mobileNumber}</p>
                  <p>Email: {student.email}</p>
                  <p>Home Language: {student.profile.homeLanguage}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Academic Details</h3>
                  <p>Admission Date: {student.profile.admissionDate}</p>
                  <p>
                    City & Guild Number: {student.profile.cityAndGuildNumber}
                  </p>
                  <p>
                    Status: {student.inactiveReason ? "Inactive" : "Active"}
                  </p>
                  <p>Campus: {student.campus}</p>
                  <p>
                    Qualifications:{" "}
                    {Array.isArray(student.qualification)
                      ? student.qualification.join(", ")
                      : student.qualification || "N/A"}
                  </p>
                  <p>
                    Intake Groups:{" "}
                    {Array.isArray(student.intakeGroup)
                      ? student.intakeGroup.join(", ")
                      : student.intakeGroup || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Assignment</th>
                      <th className="text-left p-2">Score</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">
                          {new Date(result.dateTaken).toLocaleDateString()}
                        </td>
                        <td className="p-2">{result.assignment}</td>
                        <td className="p-2">
                          {result.percent !== undefined
                            ? `${result.percent}%`
                            : "N/A"}
                        </td>
                        <td className="p-2">{result.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WEL Records Tab */}
        <TabsContent value="wel">
          <Card>
            <CardHeader>
              <CardTitle>WEL Records</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {wellnessRecords.map((record, index) => (
                  <div key={index} className="mb-4 p-4 border rounded">
                    <h3 className="font-semibold">
                      {record.establishmentName}
                    </h3>
                    <p>Contact: {record.establishmentContact}</p>
                    <p>
                      Period: {new Date(record.startDate).toLocaleDateString()}{" "}
                      - {new Date(record.endDate).toLocaleDateString()}
                    </p>
                    <p>Total Hours: {record.totalHours}</p>
                    <p>Evaluated: {record.evaluated ? "Yes" : "No"}</p>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finances Tab */}
        <TabsContent value="finances">
          <Card>
            <CardHeader>
              <CardTitle>Financial Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-4">Fee Collection History</h3>
                  <ScrollArea className="h-[300px]">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Description</th>
                          <th className="text-right p-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {finances?.collectedFees.map((fee, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">
                              {fee.transactionDate &&
                                new Date(
                                  fee.transactionDate
                                ).toLocaleDateString()}
                            </td>
                            <td className="p-2">{fee.description}</td>
                            <td className="p-2 text-right">
                              {fee.credit
                                ? `+${fee.credit}`
                                : fee.debit
                                ? `-${fee.debit}`
                                : "0"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Payable Fees</h3>
                  <ScrollArea className="h-[300px]">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left p-2">Due Date</th>
                          <th className="text-right p-2">Amount</th>
                          <th className="text-right p-2">Arrears</th>
                        </tr>
                      </thead>
                      <tbody>
                        {finances?.payableFees.map((fee, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">
                              {fee.dueDate &&
                                new Date(fee.dueDate).toLocaleDateString()}
                            </td>
                            <td className="p-2 text-right">{fee.amount}</td>
                            <td className="p-2 text-right">{fee.arrears}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </div>
              </div>
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
              <ScrollArea className="h-[400px]">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Title</th>
                      <th className="text-left p-2">Description</th>
                      <th className="text-left p-2">Upload Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{doc.title}</td>
                        <td className="p-2">{doc.description}</td>
                        <td className="p-2">
                          {doc.uploadDate &&
                            new Date(doc.uploadDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
