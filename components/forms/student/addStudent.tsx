"use client";

import React, { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentFormSchema } from "@/schemas/student/studentFormSchema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/common/DatePicker";
import Image from "next/image";
import { createStudent } from "@/lib/actions/student/addStudent";
import { uploadAvatar } from "@/lib/actions/uploads/uploadAvatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
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
import { Label } from "@/components/ui/label";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";

interface IntakeGroup {
  id: string;
  title: string;
}

interface Campus {
  id: string;
  title: string;
}

interface Accommodation {
  id: string;
  title: string;
}

interface Qualification {
  id: string;
  title: string;
}

interface StudentFormData {
  admissionDate: Date | undefined; // Make dates optional
  dateOfBirth: Date | undefined;
  intakeGroup: string;
  campus: string;
  qualification: string;
  accommodation: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  mobileNumber: string;
  gender: string;
  homeLanguage: string;
  idNumber: string;
  street1: string;
  street2?: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  guardians: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    relation: string;
  }[];
  [key: string]: any;
}

interface NewStudentFormProps {
  intakeGroups: IntakeGroup[];
  campuses: Campus[];
  accommodations: Accommodation[];
  qualifications: Qualification[];
}

const NewStudentForm: React.FC<NewStudentFormProps> = ({
  intakeGroups,
  campuses,
  accommodations,
  qualifications,
}) => {
  const form = useForm({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      admissionNumber: "",
      cityAndGuildNumber: "",
      intakeGroup: "",
      campus: "",
      qualification: "",
      accommodation: "",
      admissionDate: undefined,
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: undefined,
      idNumber: "",
      email: "",
      mobileNumber: "",
      gender: "",
      homeLanguage: "",
      street1: "",
      street2: "",
      city: "",
      province: "",
      country: "",
      postalCode: "",
      guardians: [
        {
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          relation: "",
        },
      ],
    },
  });

  const { toast } = useToast();
  const [currentIntakeGroups, setCurrentIntakeGroups] = useState(intakeGroups);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const refreshIntakeGroups = async () => {
    const freshIntakeGroups = await getAllIntakeGroups();
    setCurrentIntakeGroups(freshIntakeGroups);
  };

  const {
    fields: guardianFields,
    append: addGuardian,
    remove: removeGuardian,
  } = useFieldArray({
    control: form.control,
    name: "guardians",
  });

  const onChangeIntakeGroup = (value: string) => {
    form.setValue("intakeGroup", value);
  };

  const onChangeCampus = (value: string) => {
    form.setValue("campus", value);
  };

  const onChangeQualification = (value: string) => {
    form.setValue("qualification", value);
  };

  const onChangeAccommodation = (value: string) => {
    form.setValue("accommodation", value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setAvatarFile(file);
      const imageUrl = URL.createObjectURL(file);
      setAvatarPreview(imageUrl);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();

      // Just append the dates as strings
      formData.append("admissionDate", data.admissionDate?.toString() || "");
      formData.append("dateOfBirth", data.dateOfBirth?.toString() || "");

      // Handle all other fields
      Object.keys(data).forEach((key) => {
        if (
          key !== "avatar" &&
          key !== "admissionDate" &&
          key !== "dateOfBirth"
        ) {
          if (Array.isArray(data[key])) {
            data[key].forEach((item: any, index: number) => {
              Object.keys(item).forEach((subKey) => {
                formData.append(`${key}[${index}].${subKey}`, item[subKey]);
              });
            });
          } else if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key].toString());
          }
        }
      });

      // Handle avatar last
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      await createStudent(formData);
      toast({
        title: "Student created successfully",
        description: "Student data has been successfully submitted.",
      });
      form.reset();
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Failed to create student",
        description: "There was an error submitting the form.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* General Information */}
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
                    <FormLabel>Student Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Student Number" />
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
                        onOpenChange={() => refreshIntakeGroups()} // This will fetch fresh data when dropdown opens
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Intake Group" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentIntakeGroups.map((group) => (
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
          {/* Personal Information */}
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
                    ref={fileInputRef}
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

          {/* Address Information */}
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

          {/* Guardian Details */}
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
                {guardianFields.length > 0 && (
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
              Add
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default NewStudentForm;
