// 'use server';

// import prisma from '@/lib/db';
// import { editStaffFormSchema } from '@/schemas/staff/editStaffFormSchema';

// export async function updateStaff(formData: FormData) {
//   try {
//     // Log the received form data for debugging
//     const formEntries = Object.fromEntries(formData.entries());
//     console.log('Received Form Data:', formEntries);

//     const roles = Object.keys(formEntries)
//       .filter((key) => key.startsWith('roles[') || key === 'roles[]')
//       .map((key) => formEntries[key])
//       .flat() // Flatten in case of arrays
//       .filter(
//         (role): role is string => typeof role === 'string' && role.trim() !== ''
//       ) // Filter out any empty or null values
//       .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

//     // Validate and parse the form data using the schema
//     const validatedData = editStaffFormSchema.parse({
//       username: formEntries.username,
//       email: formEntries.email,
//       firstName: formEntries.firstName,
//       lastName: formEntries.lastName,
//       dateOfBirth: formEntries.dateOfBirth
//         ? new Date(formEntries.dateOfBirth as string)
//         : undefined,
//       idNumber: formEntries.idNumber,
//       mobileNumber: formEntries.mobileNumber,
//       homeLanguage: formEntries.homeLanguage,
//       position: formEntries.position,
//       department: formEntries.department,
//       designation: formEntries.designation,
//       gender: formEntries.gender,
//       address: {
//         street1: formEntries['address.street1'],
//         street2: formEntries['address.street2'],
//         city: formEntries['address.city'],
//         province: formEntries['address.province'],
//         country: formEntries['address.country'],
//         postalCode: formEntries['address.postalCode'],
//       },
//       roles: roles.length > 0 ? roles : [],
//     });

//     const {
//       username,
//       email,
//       firstName,
//       lastName,
//       dateOfBirth,
//       idNumber,
//       mobileNumber,
//       homeLanguage,
//       position,
//       department,
//       designation,
//       gender,
//       address,
//     } = validatedData;

//     const profileData = {
//       firstName,
//       lastName,
//       dateOfBirth,
//       mobileNumber,
//       idNumber,
//       homeLanguage,
//       position,
//       department,
//       designation,
//       gender,
//       address: {
//         street1: address?.street1 || '',
//         street2: address?.street2 || '',
//         city: address?.city || '',
//         province: address?.province || '',
//         country: address?.country || '',
//         postalCode: address?.postalCode || '',
//       },
//     };

//     const updateData = {
//       username,
//       email,
//       profile: {
//         update: profileData,
//       },
//     };

//     // Step 1: Find or create a UserRole for the staff member
//     await prisma.userRole.upsert({
//       where: {
//         userId: formEntries.id as string,
//       },
//       update: {
//         roleIds: roles,
//       },
//       create: {
//         userId: formEntries.id as string,
//         roleIds: roles, // Creating a new UserRole with the provided role IDs
//         userType: 'Staff', // You can adjust or remove this if necessary
//       },
//     });

//     // Step 2: Update staff data
//     const updatedStaff = await prisma.staff.update({
//       where: { id: formEntries.id as string },
//       data: updateData,
//     });

//     console.log('Staff updated successfully:', updatedStaff);
//     return updatedStaff;
//   } catch (error) {
//     console.error('Error updating staff:', error);
//     throw new Error('Failed to update staff');
//   }
// }
