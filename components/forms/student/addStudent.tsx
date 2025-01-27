"use client";

import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentFormSchema } from "@/schemas/student/studentFormSchema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/common/DatePicker";
import { createStudent } from "@/lib/actions/student/addStudent";
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

  const onSubmit = async (data: any) => {
    // Convert dates to ISO strings
    if (data.admissionDate) {
      data.admissionDate = data.admissionDate.toISOString();
    }
    if (data.dateOfBirth) {
      data.dateOfBirth = data.dateOfBirth.toISOString();
    }

    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (typeof data[key] === "object" && !Array.isArray(data[key])) {
          Object.keys(data[key]).forEach((subKey) => {
            formData.append(`${key}.${subKey}`, data[key][subKey]);
          });
        } else if (Array.isArray(data[key])) {
          data[key].forEach((item, index) => {
            Object.keys(item).forEach((subKey) => {
              formData.append(`${key}[${index}].${subKey}`, item[subKey]);
            });
          });
        } else {
          formData.append(key, data[key]);
        }
      });

      await createStudent(formData);
      toast({
        title: "Student created successfully",
        description: "success",
      });
      form.reset();
    } catch (error) {
      console.error("Error during form submission:", error);
      toast({
        title: "Failed to create student",
        description: "error",
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
