import * as z from 'zod';

export const learningMaterialSchema = z.object({
  title: z.string().nonempty('Title is required'),
  description: z.string().optional(),
  intakeGroup: z
    .array(z.string())
    .min(1, 'At least one intake group is required'),
  file: z.instanceof(File).refine((file) => file?.size > 0, 'File is required'),
});
