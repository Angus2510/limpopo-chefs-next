import { z } from 'zod';

export const editStudentFormSchema = z.object({
  admissionNumber: z.string().nonempty('Admission Number is required'),
  cityAndGuildNumber: z.string().optional(),
  intakeGroup: z.string().nonempty('Intake Group is required'),
  campus: z.string().nonempty('Campus is required'),
  qualification: z.string().nonempty('Qualification is required'),
  accommodation: z.string().optional(),
  admissionDate: z.date().optional(),
  firstName: z.string().nonempty('First Name is required'),
  middleName: z.string().optional(),
  lastName: z.string().nonempty('Last Name is required'),
  dateOfBirth: z.date().optional(),
  idNumber: z.string().nonempty('ID Number is required'),
  email: z
    .string()
    .email('Invalid email address')
    .nonempty('Email is required'),
  mobileNumber: z.string().nonempty('Mobile Number is required'),
  gender: z.string().nonempty('Gender is required'),
  homeLanguage: z.string().optional(),
  street1: z.string().nonempty('Street Address 1 is required'),
  street2: z.string().optional(),
  city: z.string().nonempty('City is required'),
  province: z.string().nonempty('Province is required'),
  country: z.string().nonempty('Country is required'),
  postalCode: z.string().nonempty('Postal Code is required'),
  guardians: z
    .array(
      z.object({
        id: z.string().optional(),
        firstName: z.string().nonempty('First Name is required'),
        lastName: z.string().nonempty('Last Name is required'),
        email: z
          .string()
          .email('Invalid email address')
          .nonempty('Email is required'),
        phoneNumber: z.string().nonempty('Phone Number is required'),
        relation: z.string().nonempty('Relation is required'),
      })
    )
    .max(2, 'You can add up to 2 guardians'),
});
