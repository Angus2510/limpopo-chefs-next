import { z } from "zod";

const questionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  questionType: z.string().min(1, "Question type is required"),
  mark: z.string().default("1"),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  options: z
    .array(
      z.object({
        value: z.string().optional(),
        columnA: z.string().optional(),
        columnB: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});

export const testFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["test", "task"]),
  intakeGroups: z.array(z.string()).min(1, "Select at least one intake group"),
  outcomes: z.array(z.string()).min(1, "Select at least one outcome"),
  duration: z.object({
    hours: z.string(),
    minutes: z.string(),
  }),
  testDateTime: z.string().min(1, "Test date and time is required"),
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required"),
});
