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

      // Add logo
      // Note: You'll need to replace with your actual logo path
      const logoPath = "/img/logo.png";
      doc.addImage(logoPath, "PNG", 20, 10, 40, 40);

      // Add watermark on each page
      const watermark = "LIMPOPO CHEFS ACADEMY OFFICIAL DOCUMENT";
      doc.setFontSize(30);
      doc.setTextColor(230, 230, 230);
      doc.text(watermark, 105, doc.internal.pageSize.height / 2, {
        align: "center",
        angle: 45,
      });

      // Reset text color for regular content
      doc.setTextColor(0, 0, 0);

      // Add header
      doc.setFontSize(20);
      doc.text("STATEMENT OF RESULTS", 105, 35, { align: "center" });

      // Add qualification title
      doc.setFontSize(16);
      doc.text("OCCUPATIONAL CERTIFICATE:", 105, 45, { align: "center" });
      doc.text(
        studentData.student.qualificationTitle || "Not Specified",
        105,
        55,
        { align: "center" }
      );

      // Add document info
      doc.setFontSize(12);
      const printDate = new Date().toLocaleDateString();
      doc.text(`Date of Print: ${printDate}`, 20, 70);
      doc.text(`Student Number: ${studentData.student.studentNumber}`, 20, 80);

      // Add student details
      doc.text("STUDENT DETAILS", 20, 95);
      doc.text(
        `Full Names: ${studentData.student.profile.firstName} ${studentData.student.profile.lastName}`,
        20,
        105
      );

      // Add school details
      doc.text("INSTITUTION DETAILS", 20, 120);
      doc.text("School: Limpopo Chefs Academy", 20, 130);
      doc.text("Campus: [Campus Name]", 20, 140); // Replace with actual campus

      // Add certification statement
      doc.setFontSize(11);
      const statement =
        "This certifies that the above student has achieved the below results for the academic year as of date of print of this statement of results.";
      doc.text(statement, 20, 155, { maxWidth: 170 });

      // Add results table
      if (studentData.results?.length > 0) {
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

      // Add security features
      const securityText =
        "This document contains security features. A valid statement must have a watermark and unique identifier.";
      doc.setFontSize(8);
      doc.text(securityText, 20, doc.internal.pageSize.height - 25);

      // Add unique identifier
      const uniqueId = `REF: ${Date.now()}-${
        studentData.student.studentNumber
      }`;
      doc.text(uniqueId, 20, doc.internal.pageSize.height - 20);

      // Add QR Code (if you want to add one)
      // You'll need to implement QR code generation separately
      // doc.addImage(qrCodeData, 'PNG', 160, doc.internal.pageSize.height - 30, 20, 20);

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
