"use client";
import { GraduateSelectionForm } from "@/components/graduate/GraduateSelectionForm";
import { ContentLayout } from "@/components/layout/content-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchStudentData } from "@/lib/actions/student/fetchStudentData";
import { getStudentsByIntakeAndCampus } from "@/lib/actions/student/getStudentsByIntakeAndCampus";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function BulkSORPage() {
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectionComplete = async (selection: {
    intakeGroupId: string[];
    campusId: string;
  }) => {
    setIsLoading(true);
    try {
      const students = await getStudentsByIntakeAndCampus(
        selection.intakeGroupId,
        selection.campusId
      );
      setSelectedStudents(students);
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Error loading students:", error);
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === selectedStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectedStudents.map((student) => student.id)));
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(studentId)) {
      newSelectedIds.delete(studentId);
    } else {
      newSelectedIds.add(studentId);
    }
    setSelectedIds(newSelectedIds);
  };

  const handleBulkDownload = async () => {
    if (selectedIds.size === 0) {
      toast({
        title: "No students selected",
        description: "Please select at least one student to download SOR.",
        variant: "default",
      });
      return;
    }

    setIsLoading(true);
    const errors: string[] = [];
    const successfulDownloads = new Set<string>();

    try {
      for (const studentId of selectedIds) {
        const student = selectedStudents.find((s) => s.id === studentId);
        if (!student) continue;

        try {
          // Try to fetch student data, if it fails we'll use the basic student info
          let studentData;
          try {
            studentData = await fetchStudentData(studentId);
          } catch (fetchError) {
            console.error(
              `Error fetching extended data for ${student.admissionNumber}:`,
              fetchError
            );
          }

          // Use available data, fallback to basic student info if fetch failed
          const studentProfile = {
            firstName: student.name,
            lastName: student.surname,
            studentNumber: student.admissionNumber,
            qualificationTitle:
              studentData?.student?.qualificationTitle || "Not Specified",
          };

          const doc = new jsPDF();

          try {
            // Add logo
            const logoPath = "/img/logo.png";
            doc.addImage(logoPath, "PNG", 20, 10, 40, 40);

            // Add watermark
            const watermark = "LIMPOPO CHEFS ACADEMY OFFICIAL DOCUMENT";
            doc.setFontSize(30);
            doc.setTextColor(230, 230, 230);
            doc.text(watermark, 105, doc.internal.pageSize.height / 2, {
              align: "center",
              angle: 45,
            });

            // Reset text color and add header
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(20);
            doc.text("STATEMENT OF RESULTS", 105, 35, { align: "center" });

            // Add student details
            doc.setFontSize(12);
            const printDate = new Date().toLocaleDateString();
            doc.text(`Date of Print: ${printDate}`, 20, 70);
            doc.text(`Student Number: ${studentProfile.studentNumber}`, 20, 80);
            doc.text("STUDENT DETAILS", 20, 95);
            doc.text(
              `Full Names: ${studentProfile.firstName} ${studentProfile.lastName}`,
              20,
              105
            );

            // Add qualification title
            doc.setFontSize(16);
            doc.text("OCCUPATIONAL CERTIFICATE:", 105, 45, {
              align: "center",
            });
            doc.text(studentProfile.qualificationTitle, 105, 55, {
              align: "center",
            });

            // Add results table if available
            if (studentData?.results?.length > 0) {
              autoTable(doc, {
                startY: 170,
                head: [["Date", "Assessment", "Score", "Status"]],
                body: studentData.results.map((result: any) => [
                  new Date(result.dateTaken).toLocaleDateString(),
                  result.assignments?.title || "N/A",
                  `${result.percent}%`,
                  result.status,
                ]),
                styles: { fontSize: 10 },
                headStyles: { fillColor: [41, 128, 185] },
              });
            } else {
              doc.text("No results available", 20, 170);
            }

            // Save the PDF
            doc.save(`SOR-${studentProfile.studentNumber}.pdf`);
            successfulDownloads.add(studentId);

            // Add delay between downloads
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (pdfError) {
            errors.push(
              `Error generating PDF for ${student.admissionNumber}: ${pdfError.message}`
            );
            console.error(`PDF generation error:`, pdfError);
            continue;
          }
        } catch (error) {
          errors.push(
            `Error processing student ${student.admissionNumber}: ${error.message}`
          );
          console.error(`Processing error:`, error);
          continue;
        }
      }

      // Show final status
      if (successfulDownloads.size > 0) {
        toast({
          title: errors.length > 0 ? "Completed with warnings" : "Success",
          description: `Successfully generated ${
            successfulDownloads.size
          } SOR(s)${
            errors.length > 0 ? `, encountered ${errors.length} error(s)` : ""
          }`,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to generate any SORs. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Critical error in bulk download:", error);
      toast({
        title: "Error",
        description: "A critical error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ContentLayout title="Bulk Statement of Results">
      <div className="w-full p-4 space-y-6">
        <GraduateSelectionForm onSelectionComplete={handleSelectionComplete} />

        {selectedStudents.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-x-4 flex items-center">
                <h3 className="text-lg font-semibold">
                  Selected: {selectedIds.size} of {selectedStudents.length}
                </h3>
                <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                  {selectedIds.size === selectedStudents.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>
              <Button
                onClick={handleBulkDownload}
                disabled={isLoading || selectedIds.size === 0}
              >
                {isLoading
                  ? "Processing..."
                  : `Download ${selectedIds.size} SORs`}
              </Button>
            </div>

            <div className="border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Select
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Student Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Surname
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Checkbox
                          checked={selectedIds.has(student.id)}
                          onCheckedChange={() =>
                            toggleStudentSelection(student.id)
                          }
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.admissionNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.surname}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ContentLayout>
  );
}
