"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import UploadDocumentDialog from "@/components/dialogs/uploads/UploadDocumentDialog";
import { Trash2 } from "lucide-react";
import { deleteDocument } from "@/lib/actions/documents/deleteDocument";

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

// Add these types at the top of StudentView.tsx
interface CollectedFee {
  id: string;
  balance: string;
  credit?: number | null;
  debit?: number | null;
  description: string;
  transactionDate?: Date;
}

interface PayableFee {
  id: string;
  amount: number;
  arrears: number;
  dueDate?: Date;
}

interface StudentFinances {
  collectedFees?: CollectedFee[];
  payableFees?: PayableFee[];
}

// Update the StudentViewProps interface
interface StudentViewProps {
  data: {
    student: any;
    guardians: any[];
    results?: any[];
    wellnessRecords?: any[];
    finances?: StudentFinances;
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
  console.log(
    "INCOMING RAW RESULTS DATA:",
    JSON.stringify(results.slice(0, 1), null, 2)
  );
  // Debug received results

  useEffect(() => {
    console.log("Results data received in StudentView:", results?.length || 0);
    if (results && results.length > 0) {
      const firstResult = results[0];

      // Log EXACTLY what properties are available
      console.log(
        "First result EXACT properties:",
        JSON.stringify(Object.keys(firstResult))
      );
      console.log(
        "First result complete data:",
        JSON.stringify(firstResult, null, 2)
      );

      // Log each property individually to see what's there
      console.log("assignmentTitle property:", firstResult.assignmentTitle);
      console.log("assignment property:", firstResult.assignment);
      console.log("assignmentId property:", firstResult.assignmentId);
    }
  }, [results]);

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
                    unoptimized={true}
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
                          Assessment
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
                      {results.map((result, index) => {
                        // Log each result to see what properties are available
                        console.log(`Result ${index} data:`, {
                          id: result.id,
                          assignment: result.assignment, // This should have the title
                          type: typeof result.assignment,
                          properties: Object.keys(result),
                        });

                        return (
                          <tr key={result.id || index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {formatDate(result.dateTaken)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {result.assignments?.title ||
                                "Unknown Assignment"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {/* More flexible percent handling */}
                              {result.percent !== null &&
                              result.percent !== undefined &&
                              result.percent !== 0
                                ? `${result.percent}%`
                                : result.scores !== null &&
                                  result.scores !== undefined
                                ? `${result.scores}%`
                                : "No score"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {result.status || "Pending"}
                            </td>
                          </tr>
                        );
                      })}
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
              <div className="space-y-6">
                {/* Payable Fees */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Payable Fees</h3>
                  {finances?.payableFees && finances.payableFees.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Due Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Arrears
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {finances.payableFees.map((fee) => (
                            <tr key={fee.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {formatDate(fee.dueDate)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                R {fee.amount.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                R {fee.arrears.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No payable fees found</p>
                  )}
                </div>

                {/* Collected Fees */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Payment History
                  </h3>
                  {finances?.collectedFees &&
                  finances.collectedFees.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Credit
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Debit
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Balance
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {finances.collectedFees.map((fee) => (
                            <tr key={fee.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {formatDate(fee.transactionDate)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {fee.description}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {fee.credit
                                  ? `R ${Number(fee.credit).toFixed(2)}`
                                  : "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {fee.debit
                                  ? `R ${Number(fee.debit).toFixed(2)}`
                                  : "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                R {fee.balance}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No payment history found</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Documents</CardTitle>
              <UploadDocumentDialog
                studentId={student.id}
                onUploadComplete={() => {
                  // You can implement a refresh function here
                  router.refresh();
                }}
              />
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="general">
                    <AccordionTrigger>General Documents</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {documents
                          .filter((doc) => doc.category === "general")
                          .map((doc) => (
                            <li
                              key={doc.id}
                              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-xl">📄</span>
                                <div>
                                  <p className="font-medium">{doc.title}</p>
                                  <p className="text-sm text-gray-500">
                                    {doc.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-500">
                                  {formatDate(doc.uploadDate)}
                                </span>
                                <div className="flex items-center gap-2">
                                  <a
                                    href={doc.filePath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    View
                                  </a>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-800"
                                    onClick={async () => {
                                      if (
                                        confirm(
                                          "Are you sure you want to delete this document?"
                                        )
                                      ) {
                                        try {
                                          await deleteDocument(doc.id);
                                          toast({
                                            title: "Success",
                                            description:
                                              "Document deleted successfully",
                                          });
                                          router.refresh();
                                        } catch (error) {
                                          toast({
                                            title: "Error",
                                            description:
                                              "Failed to delete document",
                                            variant: "destructive",
                                          });
                                        }
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="legal">
                    <AccordionTrigger>Legal Documents</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {documents
                          .filter((doc) => doc.category === "legal")
                          .map((doc) => (
                            <li
                              key={doc.id}
                              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-xl">⚖️</span>
                                <div>
                                  <p className="font-medium">{doc.title}</p>
                                  <p className="text-sm text-gray-500">
                                    {doc.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-500">
                                  {formatDate(doc.uploadDate)}
                                </span>
                                <div className="flex items-center gap-2">
                                  <a
                                    href={doc.filePath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    View
                                  </a>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-800"
                                    onClick={async () => {
                                      if (
                                        confirm(
                                          "Are you sure you want to delete this document?"
                                        )
                                      ) {
                                        try {
                                          await deleteDocument(doc.id);
                                          toast({
                                            title: "Success",
                                            description:
                                              "Document deleted successfully",
                                          });
                                          router.refresh();
                                        } catch (error) {
                                          toast({
                                            title: "Error",
                                            description:
                                              "Failed to delete document",
                                            variant: "destructive",
                                          });
                                        }
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
