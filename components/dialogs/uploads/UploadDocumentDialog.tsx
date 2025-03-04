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

const documentTypes = ["pdf", "doc", "docx", "xls", "xlsx"] as const;
type DocumentType = (typeof documentTypes)[number];

const documentTitles = [
  "Student Application Check List",
  "Application Form",
  "Uniform Order Sheet",
  "Accommodation Application",
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
] as const;

const formSchema = z.object({
  title: z.enum([...documentTitles] as [string, ...string[]]),
  description: z.string().optional(),
  category: z.enum(["general", "legal"]),
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
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  });

  const onSubmit = async (values: FormData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", values.file[0]);
      formData.append("title", values.title);
      formData.append("description", values.description || "");
      formData.append("category", values.category);
      formData.append("studentId", studentId);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      setOpen(false);
      form.reset();
      onUploadComplete();
    } catch (error) {
      console.error("Error during upload:", error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept={documentTypes.map((type) => `.${type}`).join(",")}
                      onChange={(e) => onChange(e.target.files)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
