import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().nonempty('Email or Username is required'),
  password: z.string().nonempty('Password is required'),
});
