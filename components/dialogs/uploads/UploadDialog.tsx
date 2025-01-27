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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { uploadLearningMaterial } from "@/lib/actions/uploads/uploadLearningMaterial";

interface LearningMaterialFormValues {
  title: string;
  description: string;
  intakeGroup: string[];
  file: File | null;
}

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  intakeGroups: { id: string; title: string }[];
}

export function UploadDialog({
  isOpen,
  onClose,
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

  const handleIntakeGroupChange = (newGroups: string[]) => {
    setSelectedIntakeGroups(newGroups);
    form.setValue("intakeGroup", newGroups);
  };

  const onSubmit = async (data: LearningMaterialFormValues) => {
    try {
      const formData = new FormData();

      // Append simple fields
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("file", data.file as Blob);

      // Handle intake groups array separately
      data.intakeGroup.forEach((groupId, index) => {
        formData.append(`intakeGroup[${index}]`, groupId);
      });

      // Simulate loading
      setIsLoading(true);
      await uploadLearningMaterial(formData);
      setIsLoading(false);
      form.reset();
      setSelectedIntakeGroups([]);
      onClose();
    } catch (error) {
      console.error("Failed to upload learning material:", error);
      setIsLoading(false);
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

            <FormItem>
              <FormLabel>Intake Group</FormLabel>
              <FormControl>
                <MultiSelect
                  options={intakeGroups.map((group) => ({
                    value: group.id,
                    label: group.title,
                  }))}
                  onValueChange={handleIntakeGroupChange}
                  defaultValue={selectedIntakeGroups}
                  placeholder="Select Intake Groups"
                />
              </FormControl>
              <FormMessage />
            </FormItem>

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
