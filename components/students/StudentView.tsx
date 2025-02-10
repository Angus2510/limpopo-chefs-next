import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ContentLayout } from "@/components/layout/content-layout";

const StudentView = ({
  student,
  welRecords,
  finances,
  documents,
  guardians,
  attendances,
}) => {
  return (
    <ContentLayout title={"Student Profile"}>
      <div className="container mx-auto p-4 space-y-4">
        {/* Header Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                {student.firstName} {student.lastName}
              </CardTitle>
              <div className="flex space-x-2">
                <Badge variant="outline">{student.admissionNumber}</Badge>
                <Badge variant={student.active ? "success" : "destructive"}>
                  {student.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            {student.avatar && (
              <Image
                src={student.avatar}
                alt="Student"
                className="w-20 h-20 rounded-full"
              />
            )}
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="academics">Academics</TabsTrigger>
            <TabsTrigger value="finances">Finances</TabsTrigger>
            <TabsTrigger value="documents">Legal Documents</TabsTrigger>
            <TabsTrigger value="guardians">Guardians</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardContent className="grid md:grid-cols-2 gap-4 pt-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-500">Date of Birth:</span>
                    <span>{student.dateOfBirth}</span>
                    <span className="text-gray-500">Gender:</span>
                    <span>{student.gender}</span>
                    <span className="text-gray-500">Mobile:</span>
                    <span>{student.mobileNumber}</span>
                    <span className="text-gray-500">Email:</span>
                    <span>{student.email}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Academic Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-500">Admission Date:</span>
                    <span>{student.admissionDate}</span>
                    <span className="text-gray-500">Campus:</span>
                    <span>{student.campus}</span>
                    <span className="text-gray-500">Intake Groups:</span>
                    <span>{student.intakeGroup}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academics Tab */}
          <TabsContent value="academics">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Qualifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {student.qualification?.map((qual, index) => (
                        <Badge key={index} variant="secondary">
                          {qual}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Current Result</h3>
                    <p>
                      {student.currentResult || "No current result available"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Finances Tab */}
          <TabsContent value="finances">
            <Card>
              <CardContent className="pt-6">
                {finances ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Collected Fees</h3>
                      {finances.collectedFees?.map((fee, index) => (
                        <div key={index} className="p-2 border rounded mb-2">
                          <p className="font-medium">{fee.description}</p>
                          <p className="text-gray-500">Amount: {fee.amount}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Payable Fees</h3>
                      {finances.payableFees?.map((fee, index) => (
                        <div key={index} className="p-2 border rounded mb-2">
                          <p className="font-medium">{fee.description}</p>
                          <p className="text-gray-500">Amount: {fee.amount}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p>No financial records available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">General Documents</h3>
                    <div className="grid gap-2">
                      {documents?.map((doc, index) => (
                        <div key={index} className="p-2 border rounded">
                          <h4 className="font-medium">{doc.title}</h4>
                          <p className="text-sm text-gray-500">
                            {doc.description}
                          </p>
                          <a
                            href={doc.documentUrl}
                            className="text-blue-500 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Document
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guardians Tab */}
          <TabsContent value="guardians">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4">
                  {guardians?.map((guardian, index) => (
                    <div key={index} className="p-4 border rounded">
                      <div className="grid md:grid-cols-2 gap-2">
                        <div>
                          <h4 className="font-medium">
                            {guardian.firstName} {guardian.lastName}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {guardian.relation}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p>Email: {guardian.email}</p>
                          <p>Mobile: {guardian.mobileNumber}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card>
              <CardContent className="pt-6">
                {attendances?.length > 0 ? (
                  <div className="space-y-4">
                    {attendances.map((attendance, index) => (
                      <div key={index} className="p-2 border rounded">
                        <p className="font-medium">
                          Date:{" "}
                          {new Date(
                            attendance.attendanceDate
                          ).toLocaleDateString()}
                        </p>
                        <p>Type: {attendance.type}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No attendance records available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ContentLayout>
  );
};

export default StudentView;
