import React from "react";
import { Download, File, Loader2, BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Material {
  id: string;
  title: string;
  description?: string;
  fileType?: string;
  uploadDate?: string;
  moduleNumber?: number;
  fileKey: string;
  fileName: string;
}

interface Student {
  intakeGroup: string;
}

interface StudentMaterialsCardProps {
  learningMaterials: Material[];
  student: Student;
}

const StudentMaterialsCard: React.FC<StudentMaterialsCardProps> = ({
  learningMaterials,
  student,
}) => {
  const [downloadingId, setDownloadingId] = React.useState(null);

  const handleDownload = async (material: Material) => {
    try {
      // Log the fileKey and fileName to verify they're correct
      console.log(
        "Sending fileKey:",
        material.fileKey,
        "fileName:",
        material.fileName
      );

      const response = await fetch("/api/materials/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileKey: material.fileKey, // Pass the fileKey here
          fileName: material.fileName, // Pass the fileName here
        }),
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const { signedUrl } = await response.json();

      // Create a temporary link and trigger the download
      const link = document.createElement("a");
      link.href = signedUrl;
      link.setAttribute("download", material.fileName); // Using the correct fileName
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  if (!learningMaterials?.length) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No learning materials are currently available for your intake group:{" "}
            {student.intakeGroup}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Learning Materials
          </CardTitle>
          <CardDescription>
            Materials for Intake Group: {student.intakeGroup}
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          {learningMaterials.map((material) => (
            <div
              key={material.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/10 transition-colors"
            >
              <div className="flex items-start gap-4">
                <File className="h-8 w-8 text-primary" />
                <div>
                  <h4 className="font-medium">{material.title}</h4>
                  {material.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {material.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2 text-xs text-gray-500">
                    {material.fileType && (
                      <span className="px-2 py-1 rounded-full bg-primary/10">
                        {material.fileType}
                      </span>
                    )}
                    {material.uploadDate && (
                      <span className="px-2 py-1 rounded-full bg-primary/10">
                        Added:{" "}
                        {new Date(material.uploadDate).toLocaleDateString()}
                      </span>
                    )}
                    {material.moduleNumber && (
                      <span className="px-2 py-1 rounded-full bg-primary/10">
                        Module {material.moduleNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownload(material)}
                disabled={downloadingId === material.id}
              >
                {downloadingId === material.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </>
                )}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentMaterialsCard;
