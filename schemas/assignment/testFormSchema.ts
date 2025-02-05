import { z } from "zod";

export const testFormSchema = z.object({
  title: z.string().nonempty({ message: "Title is required" }),
  type: z.string().nonempty({ message: "Type is required" }),

  availableFrom: z.coerce.date(), // Ensures proper date format
  availableUntil: z.any().optional(), // Keeping it as `Json?` in Prisma

  campus: z
    .array(z.string())
    .nonempty({ message: "At least one campus is required" }),

  duration: z
    .number()
    .min(1, { message: "Duration must be at least 1 minute" }),

  individualStudents: z.array(z.string()).optional(),
  intakeGroups: z.array(z.string()).optional(),

  lecturer: z.string().nonempty({ message: "Lecturer ID is required" }), // Matches ObjectId

  outcome: z.array(z.string()).optional(), // Outcome references

  password: z.string().optional(), // Not required if no password needed

  questions: z
    .array(
      z.object({
        id: z.string(),
        text: z.string().nonempty({ message: "Question text is required" }),
        correctAnswer: z.string(),
        points: z.number().min(1, { message: "Points must be at least 1" }),
      })
    )
    .optional(),

  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
