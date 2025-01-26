import { z } from 'zod';

export const staffFormSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.date().optional(),
  idNumber: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  email: z.string().email('Invalid email address'),
  homeLanguage: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  mobileNumber: z.string().optional(),
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
  roles: z.array(z.string()).optional(),
});
