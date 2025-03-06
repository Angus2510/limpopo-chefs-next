import * as z from "zod";

export const staffFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().nullable(),
  gender: z.string().nullable(),
  idNumber: z.string().nullable(),
  mobileNumber: z.string().nullable(),
  designation: z.string().nullable(),
  employeeId: z.string().nullable(),
  emergencyContact: z.string().nullable(),
  maritalStatus: z.string().nullable(),
  address: z
    .object({
      street1: z.string(),
    })
    .nullable(),
  roles: z.array(z.string()).min(1, "At least one role is required"),
});
