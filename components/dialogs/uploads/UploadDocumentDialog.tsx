"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { uploadDocument } from "@/lib/actions/uploads/uploadDocuments";
import { useRouter } from "next/navigation";

const documentTypes = ["pdf", "doc", "docx", "xls", "xlsx", "jpg"] as const;
type DocumentType = (typeof documentTypes)[number];

const documentTitles = [
  "Student Application Check List",
  "Application Form",
  "Uniform Order Sheet",
  "Student Study Agreement",
  "Accommodation Agreement",
  "Accommodation Inspection",
  "Health Questionnaire",
  "Learner Code of Conduct",
  "Proof of Address",
  "Matric Certificate",
  "Plagiarism Policy",
  "Substance Abuse Policy",
  "Acknowledgement of Receipt",
  "LCA POPI Act",
  "LCA Chefs Oath",
  "Other Qualification",
  "Certified ID Copy: Parent/Guardian",
  "Certified ID Copy: Student",
  "Device Policy",
  "Re-assessment Policy",
  "Popi Act Concent Form",
  "Notice of Assessment (NOA)",
  "Notice of Re Assessment (NORA)",
] as const;

const formSchema = z.object({
  title: z.enum([...documentTitles] as [string, ...string[]]),
  description: z.string().optional(),
  category: z.enum(["general", "legal", "other"]), // Add "other" here
  file: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, "A file is required")
    .refine((files) => {
      if (!files?.[0]) return false;
      const extension = files[0].name.split(".").pop()?.toLowerCase();
      return extension
        ? documentTypes.includes(extension as DocumentType)
        : false;
    }, `Only ${documentTypes.join(", ")} files are allowed`),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  studentId: string;
  onUploadComplete: () => void;
}

export default function UploadDocumentDialog({
  studentId,
  onUploadComplete,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: undefined,
      description: "",
      category: undefined,
      file: undefined,
    },
  });

  const onSubmit = async (values: FormData) => {
    try {
      setLoading(true);
      const file = values.file[0];

      console.log("Starting upload process with values:", {
        title: values.title,
        category: values.category,
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
      });

      // First Phase: Get presigned URL
      const presignedUrlData = new FormData();
      presignedUrlData.append("title", values.title);
      presignedUrlData.append("category", values.category);
      presignedUrlData.append("studentId", studentId);
      presignedUrlData.append("fileType", file.type);
      presignedUrlData.append("fileName", file.name);

      console.log("Requesting presigned URL...");
      const urlResult = await uploadDocument(presignedUrlData);
      console.log("Presigned URL response:", urlResult);

      if (
        !urlResult.success ||
        !urlResult.presignedUrl ||
        !urlResult.filePath
      ) {
        throw new Error(urlResult.error || "Failed to get upload URL");
      }

      // Second Phase: Direct S3 Upload
      console.log("Starting direct S3 upload...");

      try {
        // Create a blob with the correct content type
        const blob = new Blob([await file.arrayBuffer()], { type: file.type });

        const uploadResponse = await fetch(urlResult.presignedUrl, {
          method: "PUT",
          body: blob,
          headers: {
            "Content-Type": file.type,
          },
          mode: "cors",
          credentials: "omit",
        });

        console.log("S3 Upload Response:", {
          status: uploadResponse.status,
          ok: uploadResponse.ok,
          statusText: uploadResponse.statusText,
        });

        if (!uploadResponse.ok) {
          throw new Error(
            `Upload failed with status: ${uploadResponse.status} - ${uploadResponse.statusText}`
          );
        }

        console.log("S3 upload successful");
      } catch (uploadError) {
        console.error("S3 upload error:", uploadError);
        throw new Error(
          uploadError instanceof Error
            ? uploadError.message
            : "Failed to upload to S3"
        );
      }

      // Third Phase: Save metadata
      console.log("Saving metadata...");
      const metadataFormData = new FormData();
      metadataFormData.append("title", values.title);
      metadataFormData.append("description", values.description || "");
      metadataFormData.append("category", values.category);
      metadataFormData.append("studentId", studentId);
      metadataFormData.append("documentUrl", urlResult.filePath);
      metadataFormData.append("isMetadataOnly", "true");

      const metadataResult = await uploadDocument(metadataFormData);
      console.log("Metadata save result:", metadataResult);

      if (!metadataResult.success) {
        throw new Error(
          metadataResult.error || "Failed to save document metadata"
        );
      }

      console.log("Upload process completed successfully");
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      setOpen(false);
      form.reset();
      onUploadComplete();
      router.refresh();
    } catch (error) {
      console.error("Upload error details:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Upload Document</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {documentTitles.map((title) => (
                        <SelectItem key={title} value={title}>
                          {title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="other">Other Documents</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept={documentTypes.map((type) => `.${type}`).join(",")}
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files?.length) {
                          onChange(files);
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
