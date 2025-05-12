"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { learningMaterialSchema } from "@/schemas/uploads/addLearningMaterialSchema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ButtonLoading } from "@/components/common/ButtonLoading";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MultiSelect } from "@/components/common/multiselect";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { uploadLearningMaterial } from "@/lib/actions/uploads/uploadLearningMaterial";
import { toast } from "@/components/ui/use-toast";

interface LearningMaterialFormValues {
  title: string;
  description: string;
  intakeGroup: string[];
  file: File | null;
}

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  intakeGroups: { id: string; title: string }[];
}

export function UploadDialog({
  isOpen,
  onClose,
  onSuccess,
  intakeGroups,
}: UploadDialogProps) {
  const form = useForm<LearningMaterialFormValues>({
    resolver: zodResolver(learningMaterialSchema),
    defaultValues: {
      title: "",
      description: "",
      intakeGroup: [],
      file: null,
    },
  });

  const [selectedIntakeGroups, setSelectedIntakeGroups] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleIntakeGroupChange = (newGroups: string[]) => {
    setSelectedIntakeGroups(newGroups);
    form.setValue("intakeGroup", newGroups);
  };

  const onSubmit = async (values: LearningMaterialFormValues) => {
    try {
      setIsLoading(true);
      const file = values.file;

      if (!file) {
        throw new Error("No file selected");
      }

      console.log("Starting upload process with values:", {
        title: values.title,
        description: values.description,
        intakeGroups: values.intakeGroup,
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
      });

      // First Phase: Get presigned URL
      const presignedUrlData = new FormData();
      presignedUrlData.append("title", values.title);
      presignedUrlData.append("description", values.description || "");
      values.intakeGroup.forEach((group, index) => {
        presignedUrlData.append(`intakeGroup[${index}]`, group);
      });
      presignedUrlData.append("fileType", file.type);
      presignedUrlData.append("fileName", file.name);

      console.log("Requesting presigned URL...");
      const urlResult = await uploadLearningMaterial(presignedUrlData);
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
      const uploadResponse = await fetch(urlResult.presignedUrl, {
        method: "PUT",
        body: file,
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
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      // Third Phase: Save metadata
      console.log("Saving metadata...");
      const metadataFormData = new FormData();
      metadataFormData.append("title", values.title);
      metadataFormData.append("description", values.description || "");
      values.intakeGroup.forEach((group, index) => {
        metadataFormData.append(`intakeGroup[${index}]`, group);
      });
      metadataFormData.append("filePath", urlResult.filePath);
      metadataFormData.append("isMetadataOnly", "true");

      const metadataResult = await uploadLearningMaterial(metadataFormData);
      console.log("Metadata save result:", metadataResult);

      if (!metadataResult.success) {
        throw new Error(metadataResult.error || "Failed to save metadata");
      }

      console.log("Upload process completed successfully");
      toast({
        title: "Success",
        description: "Learning material uploaded successfully",
      });

      onSuccess();
      onClose();
      form.reset();
      setSelectedIntakeGroups([]);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload material",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Upload Learning Material</DialogTitle>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="intakeGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intake Groups</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={intakeGroups.map((group) => ({
                        value: group.id,
                        label: group.title,
                      }))}
                      onValueChange={(values) => {
                        handleIntakeGroupChange(values);
                        field.onChange(values);
                      }}
                      defaultValue={selectedIntakeGroups}
                      placeholder="Select Intake Groups"
                      modalPopover={true}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            <div className="flex justify-end">
              <ButtonLoading isLoading={isLoading}>
                {isLoading ? "Uploading..." : "Upload"}
              </ButtonLoading>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
