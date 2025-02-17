"use client";

import React, { useState } from "react";
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
  guardians = [],
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with proper type checking
  const form = useForm<{
    admissionNumber: string;
    cityAndGuildNumber: string;
    intakeGroup: string;
    campus: string;
    qualification: string;
    accommodation: string;
    admissionDate: Date | undefined;
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: Date | undefined;
    idNumber: string;
    email: string;
    mobileNumber: string;
    gender: string;
    homeLanguage: string;
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
  }>({
    resolver: zodResolver(editStudentFormSchema),
    defaultValues: {
      admissionNumber: student.admissionNumber || "",
      cityAndGuildNumber: student.profile.cityAndGuildNumber || "",
      intakeGroup: student.intakeGroup[0] || "",
      campus: student.campus[0] || "",
      qualification: student.qualification?.[0] || "",
      accommodation: student.accommodation || "",
      admissionDate: student.profile.admissionDate
        ? new Date(student.profile.admissionDate)
        : undefined,
      firstName: student.profile.firstName || "",
      middleName: student.profile.middleName || "",
      lastName: student.profile.lastName || "",
      dateOfBirth: student.profile.dateOfBirth
        ? new Date(student.profile.dateOfBirth)
        : undefined,
      idNumber: student.profile.idNumber || "",
      email: student.email || "",
      mobileNumber: student.profile.mobileNumber || "",
      gender: student.profile.gender || "",
      homeLanguage: student.profile.homeLanguage || "",
      address: {
        street1: student.profile.address?.street1 || "",
        street2: student.profile.address?.street2 || "",
        city: student.profile.address?.city || "",
        province: student.profile.address?.province || "",
        country: student.profile.address?.country || "",
        postalCode: student.profile.address?.postalCode || "",
      },
      guardians: guardians.map((g) => ({
        id: g.id,
        firstName: g.firstName,
        lastName: g.lastName,
        email: g.email,
        phoneNumber: g.mobileNumber,
        relation: g.relation,
      })),
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

  // Form submission handler
  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      // Format dates
      if (data.admissionDate) {
        data.admissionDate = data.admissionDate.toISOString();
      }
      if (data.dateOfBirth) {
        data.dateOfBirth = data.dateOfBirth.toISOString();
      }

      // Create FormData
      const formData = new FormData();
      formData.append("id", student.id);

      // Append avatar if it exists
      if (data.avatar) {
        formData.append("avatar", data.avatar);
      }

      // Append all other fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === "avatar") return; // Skip avatar as it's already handled

        if (
          typeof value === "object" &&
          !Array.isArray(value) &&
          value !== null
        ) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (subValue) {
              formData.append(`${key}.${subKey}`, String(subValue));
            }
          });
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            Object.entries(item).forEach(([subKey, subValue]) => {
              if (subValue) {
                formData.append(`${key}[${index}].${subKey}`, String(subValue));
              }
            });
          });
        } else if (value) {
          formData.append(key, String(value));
        }
      });

      // Submit form
      await updateStudent(formData);

      toast({
        title: "Success",
        description: "Student information updated successfully",
      });
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: "Failed to update student information",
        variant: "destructive",
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
            <Button type="submit" className="w-auto">
              Update
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default EditStudentForm;
