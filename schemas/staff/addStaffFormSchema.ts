import * as z from "zod";

export const staffFormSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  dateOfBirth: z.string().optional(),
  idNumber: z.string().min(6, "ID/Passport number is required"),
  email: z.string().email("Invalid email address"),
  homeLanguage: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  position: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  mobileNumber: z.string().min(10, "Mobile number is required"),
  address: z.object({
    street1: z.string().min(1, "Street address is required"),
    street2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    province: z.string().min(1, "Province is required"),
    country: z.string().min(1, "Country is required"),
    postalCode: z.string().min(1, "Postal code is required"),
  }),
  roles: z.array(z.string()).optional(),
});

export type StaffFormValues = z.infer<typeof staffFormSchema>;
