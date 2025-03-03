import React from "react";
import { Download, File, Loader2, BookOpen, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Material {
  id: string;
  title: string;
  description?: string;
  fileType?: string;
  uploadDate?: string;
  moduleNumber?: number;
  filePath: string;
}

interface Student {
  intakeGroup: string;
  intakeGroupTitle?: string; // Added title property
}

interface StudentMaterialsCardProps {
  learningMaterials: Material[];
  student: Student;
}

// Helper function to extract file name from filePath.
const getFileNameFromPath = (filePath: string): string => {
  return filePath.split("/").pop() || "downloaded-file";
};

const StudentMaterialsCard: React.FC<StudentMaterialsCardProps> = ({
  learningMaterials,
  student,
}) => {
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  // Handle the file download
  const handleDownload = async (material: Material) => {
    try {
      console.log("Material object:", material);

      const fileKey = material.filePath;
      const fileName = getFileNameFromPath(material.filePath);

      if (!fileKey || !fileName) {
        throw new Error(
          `Missing fileKey or fileName. Received fileKey: ${fileKey}, fileName: ${fileName}`
        );
      }

      const response = await fetch("/api/materials/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileKey,
          fileName,
        }),
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const { signedUrl } = await response.json();

      // Create a temporary link and trigger the download.
      const link = document.createElement("a");
      link.href = signedUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle the file viewing
  const handleView = async (material: Material) => {
    try {
      console.log("Material object:", material);

      const fileKey = material.filePath;

      if (!fileKey) {
        throw new Error(`Missing fileKey. Received: ${fileKey}`);
      }

      // Assuming the URL to view is built from your backend route
      const url = `/api/admin/learning-materials/view?documentId=${material.id}`;

      // Open the file in a new window (tab)
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error viewing file:", error);
    }
  };

  if (!learningMaterials?.length) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No learning materials are currently available for your intake group:{" "}
            {student.intakeGroupTitle || student.intakeGroup}
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
            Materials for Intake Group:{" "}
            {student.intakeGroupTitle || student.intakeGroup}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="grid gap-4 pr-4">
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

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleView(material)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
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
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentMaterialsCard;
