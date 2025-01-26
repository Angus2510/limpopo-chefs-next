import { z } from 'zod';

export const editStaffFormSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address').optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.date().optional(),
  idNumber: z.string().optional(),
  mobileNumber: z.string().optional(),
  homeLanguage: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  address: z
    .object({
      street1: z.string().optional(),
      street2: z.string().optional(),
      city: z.string().optional(),
      province: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
    })
    .optional(),
  roles: z.array(z.string()).optional(), // Array of role IDs
});
