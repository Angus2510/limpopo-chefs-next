// "use client";

// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { editStaffFormSchema } from "@/schemas/staff/editStaffFormSchema";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import DatePicker from "@/components/common/DatePicker";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import { updateStaff } from "@/lib/actions/staff/updateStaff";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { MultiSelect } from "@/components/common/multiselect";

// interface Role {
//   id: string;
//   name: string;
// }

// interface EditStaffFormProps {
//   staff: any;
//   roles: Role[];
//   userRoles: string[];
// }

// const EditStaffForm: React.FC<EditStaffFormProps> = ({ staff, roles, userRoles }) => {
//   const form = useForm({
//     resolver: zodResolver(editStaffFormSchema),
//     defaultValues: {
//       username: staff.username || "",
//       email: staff.email || "",
//       firstName: staff.profile.firstName || "",
//       lastName: staff.profile.lastName || "",
//       dateOfBirth: staff.profile.dateOfBirth ? new Date(staff.profile.dateOfBirth) : undefined,
//       mobileNumber: staff.profile.mobileNumber || "",
//       homeLanguage: staff.profile.homeLanguage || "",
//       position: staff.profile.position || "",
//       idNumber: staff.profile.idNumber || "",
//       department: staff.profile.department || "",
//       designation: staff.profile.designation || "",
//       gender: staff.profile.gender || "",
//       address: {
//         street1: staff.profile.address?.street1 || "",
//         street2: staff.profile.address?.street2 || "",
//         city: staff.profile.address?.city || "",
//         province: staff.profile.address?.province || "",
//         country: staff.profile.address?.country || "",
//         postalCode: staff.profile.address?.postalCode || "",
//       },
//       roles: userRoles || [], // Initialize with user's current roles
//     },
//   });

//   const [selectedRoles, setSelectedRoles] = useState<string[]>(userRoles || []);

//   const handleRoleChange = (newRoles: string[]) => {
//     setSelectedRoles(newRoles);
//   };

//   const onSubmit = async (data: any) => {
//     try {
//       console.log('Selected Roles:', selectedRoles);

//       const formData = new FormData();

//       formData.append('id', staff.id); // Add staff ID to form data

//       // Add other form data
//       Object.keys(data).forEach(key => {
//         if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
//           Object.keys(data[key]).forEach(subKey => {
//             formData.append(`${key}.${subKey}`, data[key][subKey]);
//           });
//         } else if (Array.isArray(data[key])) {
//           data[key].forEach((value: string) => formData.append(`${key}[]`, value));
//         } else {
//           formData.append(key, data[key]);
//         }
//       });

//       selectedRoles.forEach((role: string, index: number) => {
//         formData.append(`roles[${index}]`, role);
//       });

//       await updateStaff(formData); // Assuming updateStaff is a server action that handles the update
//       alert("Staff updated successfully.");
//       form.reset();
//     } catch (error) {
//       console.error('Error during form submission:', error);
//       alert("Failed to update staff. Please try again.");
//     }
//   };

//   return (
//     <Card>
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//           <div className="space-y-4">
//             <CardHeader>
//               <CardTitle>General Information</CardTitle>
//             </CardHeader>
//             <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="username"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Username</FormLabel>
//                     <FormControl>
//                       <Input {...field} placeholder="Username" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="email"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Email</FormLabel>
//                     <FormControl>
//                       <Input {...field} type="email" placeholder="Email" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="firstName"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>First Name</FormLabel>
//                     <FormControl>
//                       <Input {...field} placeholder="First Name" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="lastName"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Last Name</FormLabel>
//                     <FormControl>
//                       <Input {...field} placeholder="Last Name" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="dateOfBirth"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Date of Birth</FormLabel>
//                     <DatePicker control={form.control} name="dateOfBirth" label="Date of Birth" />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="mobileNumber"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Mobile Number</FormLabel>
//                     <FormControl>
//                       <Input {...field} placeholder="Mobile Number" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="gender"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Gender</FormLabel>
//                     <FormControl>
//                       <Select
//                         value={field.value}
//                         onValueChange={(value) => form.setValue("gender", value)}
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select Gender" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="Male">Male</SelectItem>
//                           <SelectItem value="Female">Female</SelectItem>
//                           <SelectItem value="Other">Other</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//                <FormField
//                 control={form.control}
//                 name="idNumber"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>ID/Passport Number</FormLabel>
//                     <FormControl>
//                       <Input {...field} placeholder="ID/Passport Number" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//                 <FormField
//                 control={form.control}
//                 name="homeLanguage"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Home Language</FormLabel>
//                     <FormControl>
//                       <Input {...field} placeholder="Home Language" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </CardContent>
//           </div>
//   {/* Address Information Section */}
//   <div className="space-y-4">
//             <CardHeader>
//               <CardTitle>Address Information</CardTitle>
//             </CardHeader>
//             <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="address.street1"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Street Address 1</FormLabel>
//                     <FormControl>
//                       <Input {...field} placeholder="Street Address 1" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="address.street2"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Street Address 2</FormLabel>
//                     <FormControl>
//                       <Input {...field} placeholder="Street Address 2" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="address.city"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>City</FormLabel>
//                     <FormControl>
//                       <Input {...field} placeholder="City" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="address.province"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Province</FormLabel>
//                     <FormControl>
//                       <Input {...field} placeholder="Province" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="address.country"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Country</FormLabel>
//                     <FormControl>
//                       <Input {...field} placeholder="Country" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="address.postalCode"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Postal Code</FormLabel>
//                     <FormControl>
//                       <Input {...field} placeholder="Postal Code" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </CardContent>
//           </div>

//           {/* Role and Position Information */}
//           <div className="space-y-4">
//             <CardHeader>
//               <CardTitle>Position Information</CardTitle>
//             </CardHeader>
//             <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="position"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Position</FormLabel>
//                     <FormControl>
//                       <Input {...field} placeholder="Position" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="department"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Department</FormLabel>
//                     <FormControl>
//                       <Input {...field} placeholder="Department" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="designation"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Designation</FormLabel>
//                     <FormControl>
//                       <Input {...field} placeholder="Designation" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </CardContent>
//           </div>

//           <div className="space-y-4">
//             <CardHeader>
//               <CardTitle>Roles</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <MultiSelect
//                 options={roles.map((role) => ({
//                   value: role.id,
//                   label: role.name,
//                 }))}
//                 onValueChange={handleRoleChange}
//                 defaultValue={selectedRoles}
//                 placeholder="Select roles"
//               />
//             </CardContent>
//           </div>

//           <div className="flex justify-end px-5 py-5">
//             <Button type="submit" className="w-auto">
//               Update
//             </Button>
//           </div>
//         </form>
//       </Form>
//     </Card>
//   );
// };

// export default EditStaffForm;
