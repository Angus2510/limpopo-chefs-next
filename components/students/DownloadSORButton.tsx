"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DownloadSORButtonProps {
  studentData: any;
}

export function DownloadSORButton({ studentData }: DownloadSORButtonProps) {
  const handleDownload = () => {
    try {
      const doc = new jsPDF();

      // Add header
      doc.setFontSize(20);
      doc.text("Statement of Results", 105, 15, { align: "center" });

      // Add student info
      doc.setFontSize(12);
      doc.text(
        `Student Name: ${studentData.student.profile.firstName} ${studentData.student.profile.lastName}`,
        20,
        30
      );
      doc.text(`Student Number: ${studentData.student.studentNumber}`, 20, 40);
      doc.text(
        `Program: ${studentData.student.qualificationTitle || "Not Specified"}`,
        20,
        50
      );

      // Add results table
      if (studentData.results?.length > 0) {
        autoTable(doc, {
          startY: 60,
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
        doc.text("No results available", 20, 60);
      }

      // Add footer
      const today = new Date().toLocaleDateString();
      doc.text(`Generated on: ${today}`, 20, doc.internal.pageSize.height - 20);

      // Save the PDF
      doc.save(`SOR-${studentData.student.studentNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Add error handling here if needed
    }
  };

  return (
    <Button onClick={handleDownload} className="flex items-center gap-2 ">
      <Download className="h-4 w-4" />
      Download SOR
    </Button>
  );
}
