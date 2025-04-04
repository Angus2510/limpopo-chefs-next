// src/schemas/studentFormSchema.ts
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const studentFormSchema = z.object({
  admissionNumber: z.string().nonempty("Admission Number is required"),
  cityAndGuildNumber: z.string().optional(),
  intakeGroup: z.string().nonempty("Intake Group is required"),
  campus: z.string().nonempty("Campus is required"),
  qualification: z.string().nonempty("Qualification is required"),
  accommodation: z.string().optional(),
  admissionDate: z.coerce.date().optional(),
  firstName: z.string().nonempty("First Name is required"),
  middleName: z.string().optional(),
  lastName: z.string().nonempty("Last Name is required"),
  avatar: z
    .any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    )
    .optional(),
  dateOfBirth: z.coerce.date().optional(),
  idNumber: z.string().nonempty("ID Number is required"),
  email: z
    .string()
    .email("Invalid email address")
    .nonempty("Email is required"),
  mobileNumber: z.string().nonempty("Mobile Number is required"),
  gender: z.string().nonempty("Gender is required"),
  homeLanguage: z.string().optional(),
  street1: z.string().nonempty("Street Address 1 is required"),
  street2: z.string().optional(),
  city: z.string().nonempty("City is required"),
  province: z.string().nonempty("Province is required"),
  country: z.string().nonempty("Country is required"),
  postalCode: z.string().nonempty("Postal Code is required"),
  guardians: z
    .array(
      z.object({
        firstName: z.string().nonempty("First Name is required"),
        lastName: z.string().nonempty("Last Name is required"),
        email: z
          .string()
          .email("Invalid email address")
          .nonempty("Email is required"),
        phoneNumber: z.string().nonempty("Phone Number is required"),
        relation: z.string().nonempty("Relation is required"),
      })
    )
    .max(2, "You can add up to 2 guardians"),
});
