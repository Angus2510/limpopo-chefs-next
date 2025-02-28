"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editStudentFormSchema } from "@/schemas/student/editStudentFormSchema";
import type {
  Student,
  IntakeGroup,
  Campus,
  Qualification,
  Accommodation,
  Guardian,
} from "@/types/student";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/common/DatePicker";
import Image from "next/image";
import { updateStudent } from "@/lib/actions/student/editStudent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
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
import { useRouter } from "next/navigation";

interface EditStudentFormProps {
  student: Student;
  intakeGroups: IntakeGroup[];
  campuses: Campus[];
  accommodations: Accommodation[];
  qualifications: Qualification[];
  guardians: Guardian[];
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
  const [updateResult, setUpdateResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const router = useRouter();

  // Verify toast provider is available
  useEffect(() => {
    if (toast) {
      console.log("Toast provider is available");
    } else {
      console.error("Toast provider is NOT available");
    }
  }, [toast]);

  // Log the incoming student data to verify what we're receiving
  console.log("Received student data:", student);

  type FormData = {
    admissionNumber: string;
    cityAndGuildNumber: string;
    intakeGroup: string;
    campus: string;
    qualification: string;
    accommodation: string;
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth?: Date;
    idNumber: string;
    email: string;
    mobileNumber: string;
    gender: string;
    homeLanguage: string;
    admissionDate?: Date;
    address: {
      street1: string;
      street2: string;
      city: string;
      province: string;
      country: string;
      postalCode: string;
    };
    guardians: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      relation: string;
    }[];
    avatar?: File;
  };

  const form = useForm<FormData>({
    resolver: zodResolver(editStudentFormSchema),
    defaultValues: {
      // Basic Information
      admissionNumber: student.admissionNumber,
      cityAndGuildNumber: student.profile?.cityAndGuildNumber || "",
      // Arrays - ensure we're getting the first item if it exists
      intakeGroup: student.intakeGroup?.[0] || "",
      campus: student.campus?.[0] || "",
      qualification: student.qualification?.[0] || "",
      accommodation: student.accommodation || "",
      // Profile Information
      firstName: student.profile?.firstName || "",
      middleName: student.profile?.middleName || "",
      lastName: student.profile?.lastName || "",
      dateOfBirth: student.profile?.dateOfBirth
        ? new Date(student.profile.dateOfBirth)
        : undefined,
      idNumber: student.profile?.idNumber || "",
      email: student.email || "",
      mobileNumber: student.profile?.mobileNumber || "",
      gender: student.profile?.gender || "",
      homeLanguage: student.profile?.homeLanguage || "",
      // Dates
      admissionDate: student.profile?.admissionDate
        ? new Date(student.profile.admissionDate)
        : undefined,
      // Address
      address: {
        street1: student.profile?.address?.street1 || "",
        street2: student.profile?.address?.street2 || "",
        city: student.profile?.address?.city || "",
        province: student.profile?.address?.province || "",
        country: student.profile?.address?.country || "",
        postalCode: student.profile?.address?.postalCode || "",
      },
      // Guardians
      guardians:
        student.guardians?.map((guardian) => ({
          id: guardian.id,
          firstName: guardian.firstName,
          lastName: guardian.lastName,
          email: guardian.email,
          phoneNumber: guardian.mobileNumber,
          relation: guardian.relation,
        })) || [],
    },
  });

  // Guardian fields management
  const {
    fields: guardianFields,
    append: addGuardian,
    remove: removeGuardian,
  } = useFieldArray({
    control: form.control,
    name: "guardians",
  });

  // Avatar preview state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    student.avatarUrl || null
  );

  // Handle image changes with validation
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please upload a valid image file (JPG, PNG, or GIF)",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    form.setValue("avatar", file);
  };

  // Improved form submission handler with better toast handling
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setUpdateResult(null);
      console.log("Form submission started", data);

      // Format dates for ISO string
      if (data.admissionDate) {
        data.admissionDate = data.admissionDate.toISOString();
      }
      if (data.dateOfBirth) {
        data.dateOfBirth = data.dateOfBirth.toISOString();
      }

      // First show a processing toast to provide immediate feedback
      toast({
        title: "Processing",
        description: "Updating student information...",
        duration: 3000, // 3 seconds
      });
      console.log("Processing toast shown");

      // Create FormData object
      const formData = new FormData();
      formData.append("id", student.id);

      // Basic student information
      formData.append("admissionNumber", data.admissionNumber || "");
      formData.append("email", data.email || "");
      formData.append("campus", data.campus || "");
      formData.append("intakeGroup", data.intakeGroup || "");
      formData.append("qualification", data.qualification || "");
      formData.append("accommodation", data.accommodation || "");

      // Profile fields
      formData.append("firstName", data.firstName || "");
      formData.append("middleName", data.middleName || "");
      formData.append("lastName", data.lastName || "");
      formData.append("idNumber", data.idNumber || "");
      formData.append("dateOfBirth", data.dateOfBirth?.toString() || "");
      formData.append("gender", data.gender || "");
      formData.append("homeLanguage", data.homeLanguage || "");
      formData.append("mobileNumber", data.mobileNumber || "");
      formData.append("cityAndGuildNumber", data.cityAndGuildNumber || "");
      formData.append("admissionDate", data.admissionDate?.toString() || "");

      // Address fields
      formData.append("street1", data.address.street1 || "");
      formData.append("street2", data.address.street2 || "");
      formData.append("city", data.address.city || "");
      formData.append("province", data.address.province || "");
      formData.append("country", data.address.country || "");
      formData.append("postalCode", data.address.postalCode || "");

      // Guardians
      if (data.guardians && data.guardians.length > 0) {
        data.guardians.forEach((guardian, index) => {
          if (guardian.id) {
            formData.append(`guardians[${index}].id`, guardian.id);
          }
          formData.append(
            `guardians[${index}].firstName`,
            guardian.firstName || ""
          );
          formData.append(
            `guardians[${index}].lastName`,
            guardian.lastName || ""
          );
          formData.append(`guardians[${index}].email`, guardian.email || "");
          formData.append(
            `guardians[${index}].phoneNumber`,
            guardian.phoneNumber || ""
          );
          formData.append(
            `guardians[${index}].relation`,
            guardian.relation || ""
          );
        });
      }

      // Avatar
      if (data.avatar && data.avatar instanceof File) {
        formData.append("avatar", data.avatar);
      }

      // Call server action with extended timeout
      console.log("Calling updateStudent...");
      const result = await updateStudent(formData);
      console.log("Update result:", result);

      if (result && result.success) {
        console.log("Update successful");

        // Show success message
        setUpdateResult({
          success: true,
          message: "Student information updated successfully!",
        });

        // Show success toast with longer duration
        toast({
          title: "Success",
          description: "Student updated successfully",
          duration: 5000, // 5 seconds
        });
        console.log("Success toast shown");

        // Force redirect after a short delay to ensure toast is visible
        console.log("Setting up redirect");
        setTimeout(() => {
          console.log("Executing redirect now");
          window.location.href = `/admin/student/studentView/${student.id}`;
        }, 1500); // 1.5 seconds
      } else {
        console.error("Update failed:", result?.error);

        // Show error message
        setUpdateResult({
          success: false,
          message: result?.error || "Failed to update student information",
        });

        toast({
          title: "Error",
          description: result?.error || "Failed to update student",
          variant: "destructive",
          duration: 5000, // 5 seconds
        });
      }
    } catch (error) {
      console.error("Error updating student:", error);

      setUpdateResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });

      toast({
        title: "Error",
        description: "Failed to update student information",
        variant: "destructive",
        duration: 5000, // 5 seconds
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  function onChangeIntakeGroup(value: string): void {
    form.setValue("intakeGroup", value);
  }

  function onChangeCampus(value: string): void {
    form.setValue("campus", value);
  }

  function onChangeQualification(value: string): void {
    form.setValue("qualification", value);
  }

  function onChangeAccommodation(value: string): void {
    form.setValue("accommodation", value);
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {updateResult && (
            <div
              className={`p-4 rounded-md ${
                updateResult.success
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {updateResult.message}
            </div>
          )}

          <div className="space-y-4">
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <FormLabel>City And Guild Registration Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City And Guild Number" />
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
                    <FormLabel>Intake Group</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={onChangeIntakeGroup}
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="campus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campus</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={onChangeCampus}
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="qualification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualification</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={onChangeQualification}
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accommodation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accommodation</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={onChangeAccommodation}
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
                              {accommodation.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="admissionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Date</FormLabel>
                    <DatePicker
                      control={form.control}
                      name="admissionDate"
                      label="Admission Date"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </div>
          <div className="space-y-4">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
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
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <DatePicker
                      control={form.control}
                      name="dateOfBirth"
                      label="Date of Birth"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>ID/Passport Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ID/Passport Number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) =>
                          form.setValue("gender", value)
                        }
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <div className="flex justify-center space-y-2">
              <Label htmlFor="avatar">Profile Picture</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-gray-200">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar preview"
                      layout="fill"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-50">
                      <span className="text-sm text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500">
                    Max file size: 5MB. Supported formats: JPG, PNG, GIF
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address.street1"
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
                name="address.street2"
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
                name="address.city"
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
                name="address.province"
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
                name="address.country"
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
                name="address.postalCode"
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

          <div className="space-y-4">
            <CardHeader>
              <CardTitle>Guardian Details</CardTitle>
            </CardHeader>
            {guardianFields.map((guardian, index) => (
              <CardContent
                key={guardian.id}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <FormField
                  control={form.control}
                  name={`guardians.${index}.id`}
                  render={({ field }) => <input type="hidden" {...field} />}
                />
                <FormField
                  control={form.control}
                  name={`guardians.${index}.firstName`}
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
                  name={`guardians.${index}.lastName`}
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
                  name={`guardians.${index}.email`}
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
                <FormField
                  control={form.control}
                  name={`guardians.${index}.phoneNumber`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Phone Number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`guardians.${index}.relation`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relation</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value) =>
                            form.setValue(`guardians.${index}.relation`, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Relation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Father">Father</SelectItem>
                            <SelectItem value="Mother">Mother</SelectItem>
                            <SelectItem value="Guardian">Guardian</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {guardianFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeGuardian(index)}
                  >
                    Remove Guardian
                  </Button>
                )}
              </CardContent>
            ))}
            <CardContent>
              <Button
                type="button"
                onClick={() =>
                  addGuardian({
                    id: "",
                    firstName: "",
                    lastName: "",
                    email: "",
                    phoneNumber: "",
                    relation: "",
                  })
                }
              >
                Add Guardian
              </Button>
            </CardContent>
          </div>

          <div className="flex justify-end px-5 py-5">
            <Button
              type="submit"
              className="w-auto bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Updating Student...</span>
                </div>
              ) : (
                <span>Update Student</span>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default EditStudentForm;
