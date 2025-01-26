// schemas/assignment/testFormSchema.ts
import { z } from 'zod';

export const testFormSchema = z.object({
  title: z.string().nonempty({ message: 'Title is required' }),
  description: z.string().optional(),
  type: z.string().nonempty({ message: 'Type is required' }),
  questions: z
    .array(
      z.object({
        id: z.string(),
        text: z.string().nonempty({ message: 'Question text is required' }),
        correctAnswer: z.string(),
        points: z.number().min(1, { message: 'Points must be at least 1' }),
      })
    )
    .optional(),
});
