'use client';

import React, { useState } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { staffFormSchema } from '@/schemas/staff/addStaffFormSchema'; // Adjust the path as necessary
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import DatePicker from '@/components/common/DatePicker';
import { MultiSelect } from "@/components/common/multiselect";
import { createStaff } from "@/lib/actions/staff/addStaff";

interface Role {
  id: string;
  name: string;
}

interface AddStaffFormProps {
  roles: Role[];
}

const AddStaffForm: React.FC<AddStaffFormProps> = ({ roles }) => {
  const form = useForm({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      username: '',
      firstName: '',
      lastName: '',
      dateOfBirth: undefined,
      idNumber: '',
      email: '',
      homeLanguage: '',
      gender:"",
      position: '',
      department: '',
      designation: '',
      mobileNumber: '',
      address: {
        street1: "",
        street2: "",
        city: "",
        province:"",
        country:  "",
        postalCode:  "",
      },
      roles: [],
    },
  });

  const { toast } = useToast();

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const handleRoleChange = (newRoles: string[]) => {
    setSelectedRoles(newRoles);
  };

  const onSubmit = async (data: any) => {
    console.log('Form data before submission:', data);
  if (data.dateOfBirth) {
        data.dateOfBirth = data.dateOfBirth.toISOString();
  }
    try {
      // Your submit logic here
      console.log('Form data before submission:', data);
      // Call your API to create staff
      const formData = new FormData();

       // Add other form data
       Object.keys(data).forEach(key => {
        if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
          Object.keys(data[key]).forEach(subKey => {
            formData.append(`${key}.${subKey}`, data[key][subKey]);
          });
        } else if (Array.isArray(data[key])) {
          data[key].forEach((value: string) => formData.append(`${key}[]`, value));
        } else {
          formData.append(key, data[key]);
        }
      });
      
      selectedRoles.forEach((role: string, index: number) => {
        formData.append(`roles[${index}]`, role);
      });

      await createStaff(formData);

      toast({
        title: "Staff created successfully",
        description: "Success",
      });

      form.reset();
    } catch (error) {
      console.error('Error during form submission:', error);
      toast({
        title: "Failed to create staff",
        description: "Error",
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
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
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
            </CardContent>
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

          {/* Role and Position Information */}
          <div className="space-y-4">
            <CardHeader>
              <CardTitle>Position Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Position" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Department" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Designation" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </div>

          <div className="space-y-4">
            <CardHeader>
              <CardTitle>Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiSelect
                options={roles.map((role) => ({
                  value: role.id,
                  label: role.name,
                }))}
                onValueChange={handleRoleChange}
                defaultValue={selectedRoles}
                placeholder="Select roles"
              />
            </CardContent>
          </div>
          <div className="flex justify-end px-5 py-5">
          <Button type="submit" >Submit</Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default AddStaffForm;
