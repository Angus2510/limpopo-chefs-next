"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import type {
  Student,
  IntakeGroup,
  Campus,
  Qualification,
  Accommodation,
} from "@/types/student";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface EditStudentFormProps {
  student: Student;
  intakeGroups: IntakeGroup[];
  campuses: Campus[];
  accommodations: Accommodation[];
  qualifications: Qualification[];
}

const EditStudentForm: React.FC<EditStudentFormProps> = ({
  student,
  intakeGroups = [],
  campuses = [],
  accommodations = [],
  qualifications = [],
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(
    student.profile?.avatar || null
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const form = useForm({
    defaultValues: {
      admissionNumber: student.admissionNumber || "",
      cityAndGuildNumber: student.profile?.cityAndGuildNumber || "",
      intakeGroup: student.intakeGroup?.[0] || "",
      campus: student.campus?.[0] || "",
      qualification: student.qualification?.[0] || "",
      accommodation: student.accommodation || "",
      firstName: student.profile?.firstName || "",
      middleName: student.profile?.middleName || "",
      lastName: student.profile?.lastName || "",
      idNumber: student.profile?.idNumber || "",
      email: student.email || "",
      mobileNumber: student.profile?.mobileNumber || "",
      gender: student.profile?.gender || "",
      homeLanguage: student.profile?.homeLanguage || "",
      street1: student.profile?.address?.street1 || "",
      street2: student.profile?.address?.street2 || "",
      city: student.profile?.address?.city || "",
      province: student.profile?.address?.province || "",
      country: student.profile?.address?.country || "",
      postalCode: student.profile?.address?.postalCode || "",
      avatar: "", // Handled separately with file input
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create a preview URL for the image
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const values = form.getValues();

      // Create FormData
      const formData = new FormData();

      // Append all form values to FormData
      formData.append("id", student.id);
      formData.append("email", values.email || "");
      formData.append("admissionNumber", values.admissionNumber || "");
      formData.append("firstName", values.firstName || "");
      formData.append("lastName", values.lastName || "");
      formData.append("middleName", values.middleName || "");
      formData.append("idNumber", values.idNumber || "");
      formData.append("gender", values.gender || "");
      formData.append("mobileNumber", values.mobileNumber || "");
      formData.append("homeLanguage", values.homeLanguage || "");
      formData.append("cityAndGuildNumber", values.cityAndGuildNumber || "");

      // Append avatar if selected
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      // References
      if (values.campus) formData.append("campus", values.campus);
      if (values.intakeGroup)
        formData.append("intakeGroup", values.intakeGroup);
      if (values.qualification)
        formData.append("qualification", values.qualification);
      formData.append("accommodation", values.accommodation || "none");

      // Address
      formData.append("street1", values.street1 || "");
      formData.append("street2", values.street2 || "");
      formData.append("city", values.city || "");
      formData.append("province", values.province || "");
      formData.append("country", values.country || "");
      formData.append("postalCode", values.postalCode || "");

      // Send the request
      const response = await fetch("/api/students/updateStudent", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Student updated successfully",
        });

        // Redirect to student view page
        router.push(`/admin/student/studentView/${student.id}`);
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to update student",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Student Information</CardTitle>

              {/* Avatar Upload Section */}
              <div className="flex flex-col items-center space-y-2">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200">
                  {previewImage ? (
                    <Image
                      src={previewImage}
                      alt="Student avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Update Photo
                </Button>
              </div>
            </CardHeader>

            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Basic Information */}
              <FormField
                control={form.control}
                name="admissionNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Admission Number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cityAndGuildNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City And Guild Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City And Guild Number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campus */}
              <FormField
                control={form.control}
                name="campus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campus</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => form.setValue("campus", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Campus" />
                      </SelectTrigger>
                      <SelectContent>
                        {campuses.map((campus) => (
                          <SelectItem key={campus.id} value={campus.id}>
                            {campus.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Intake Group */}
              <FormField
                control={form.control}
                name="intakeGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intake Group</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        form.setValue("intakeGroup", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Intake Group" />
                      </SelectTrigger>
                      <SelectContent>
                        {intakeGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Qualification */}
              <FormField
                control={form.control}
                name="qualification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualification</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        form.setValue("qualification", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        {qualifications.map((qualification) => (
                          <SelectItem
                            key={qualification.id}
                            value={qualification.id}
                          >
                            {qualification.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Accommodation */}
              <FormField
                control={form.control}
                name="accommodation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accommodation</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        form.setValue("accommodation", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Accommodation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Accommodation</SelectItem>
                        {accommodations.map((accommodation) => (
                          <SelectItem
                            key={accommodation.id}
                            value={accommodation.id}
                          >
                            {accommodation.address} - Room{" "}
                            {accommodation.roomNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="Email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </div>

          <div className="space-y-4">
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="First Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Middle Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Last Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ID Number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => form.setValue("gender", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Mobile Number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="homeLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Home Language</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Home Language" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </div>

          <div className="space-y-4">
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="street1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address 1</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Street Address 1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="street2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address 2</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Street Address 2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Province" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Country" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Postal Code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </div>

          <div className="flex justify-between px-5 py-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Student"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default EditStudentForm;
