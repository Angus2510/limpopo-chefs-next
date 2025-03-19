"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";

// Define the form schema
const formSchema = z.object({
  roleName: z
    .string()
    .min(2, "Role name must be at least 2 characters")
    .max(50, "Role name must be less than 50 characters"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(500, "Description must be less than 500 characters"),
  permissions: z.array(
    z.object({
      page: z.string().min(1, "Page name is required"),
      actions: z.object({
        view: z.boolean().default(false),
        edit: z.boolean().default(false),
        upload: z.boolean().default(false),
      }),
    })
  ),
});

// Create a server action to save the role
async function createRole(data) {
  try {
    const response = await fetch("/api/roles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create role");
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      error.message || "An error occurred while creating the role"
    );
  }
}

// Common pages for permissions
const commonPages = [
  "Dashboard",
  "Students",
  "Assignments",
  "Attendance",
  "Results",
  "Learning Materials",
  "Events",
  "Finance",
  "Settings",
];

export default function AddRolePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roleName: "",
      description: "",
      permissions: [
        { page: "", actions: { view: false, edit: false, upload: false } },
      ],
    },
  });

  // Setup field array for dynamic permissions
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "permissions",
  });

  async function onSubmit(data) {
    setIsSubmitting(true);

    try {
      await createRole({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        v: 0,
      });

      toast({
        title: "Success",
        description: `Role "${data.roleName}" has been created successfully`,
      });

      router.push("/admin/settings/roles");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create role",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Role</h1>
          <p className="text-muted-foreground">
            Create a new role with specific permissions
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/settings/roles")}
        >
          Back to Roles
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="roleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Administrator" {...field} />
                      </FormControl>
                      <FormDescription>
                        A unique name for this role
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the purpose and scope of this role"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Permissions</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        page: "",
                        actions: { view: false, edit: false, upload: false },
                      })
                    }
                    className="flex items-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Permission
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <Card key={field.id} className="relative">
                    <CardContent className="pt-6">
                      <div className="absolute top-2 right-2">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <FormField
                          control={form.control}
                          name={`permissions.${index}.page`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Page/Module*</FormLabel>
                              <FormControl>
                                <Input
                                  list="common-pages"
                                  placeholder="e.g., Dashboard, Students, etc."
                                  {...field}
                                />
                              </FormControl>
                              <datalist id="common-pages">
                                {commonPages.map((page) => (
                                  <option key={page} value={page} />
                                ))}
                              </datalist>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex flex-wrap gap-6">
                        <FormField
                          control={form.control}
                          name={`permissions.${index}.actions.view`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                View
                              </FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`permissions.${index}.actions.edit`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Edit
                              </FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`permissions.${index}.actions.upload`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Upload
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/settings/roles")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Role"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
