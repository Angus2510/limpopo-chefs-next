import { z } from "zod";

export const editStudentFormSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .nonempty("Email is required"),
  admissionNumber: z.string().nonempty("Admission Number is required"),
  profile: z.object({
    firstName: z.string().nonempty("First Name is required"),
    lastName: z.string().nonempty("Last Name is required"),
    middleName: z.string().optional(),
    idNumber: z.string().nonempty("ID Number is required"),
    gender: z.string().nonempty("Gender is required"),
    mobileNumber: z.string().nonempty("Mobile Number is required"),
    homeLanguage: z.string().optional(),
    cityAndGuildNumber: z.string().optional(),
    address: z.object({
      street1: z.string().nonempty("Street Address 1 is required"),
      street2: z.string().optional(),
      city: z.string().nonempty("City is required"),
      province: z.string().nonempty("Province is required"),
      country: z.string().nonempty("Country is required"),
      postalCode: z.string().nonempty("Postal Code is required"),
    }),
  }),
  campus: z.array(z.string()).min(1, "Campus is required"),
  intakeGroup: z.array(z.string()).min(1, "Intake Group is required"),
  qualification: z.array(z.string()).min(1, "Qualification is required"),
  accommodation: z.string().optional(),
  guardians: z
    .array(
      z.object({
        id: z.string().optional(),
        firstName: z.string().nonempty("First Name is required"),
        lastName: z.string().nonempty("Last Name is required"),
        email: z
          .string()
          .email("Invalid email address")
          .nonempty("Email is required"),
        mobileNumber: z.string().nonempty("Mobile Number is required"),
        relation: z.string().nonempty("Relation is required"),
        studentId: z.string().optional(),
        userType: z.string().optional().default("Guardian"),
      })
    )
    .max(2, "You can add up to 2 guardians"),
});

export type EditStudentFormData = z.infer<typeof editStudentFormSchema>;
