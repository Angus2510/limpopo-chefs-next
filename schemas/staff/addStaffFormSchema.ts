import { z } from "zod";

export const staffFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  idNumber: z.string().optional(),
  mobileNumber: z.string().optional(),
  designation: z.string().optional(),
  employeeId: z.string().optional(),
  emergencyContact: z.string().optional(),
  maritalStatus: z.string().optional(),
  address: z
    .object({
      street1: z.string().optional(),
    })
    .optional(),
  roles: z.array(z.string()),
});
