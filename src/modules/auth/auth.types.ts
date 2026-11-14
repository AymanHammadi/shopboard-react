import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
});

export type Profile = Readonly<z.infer<typeof profileSchema>>;

export const loginSchema = z.object({
  name: z.string(),
  email: z.string().trim().pipe(z.email('Enter a valid email address.')),
  password: z.string().min(8, 'Use at least 8 characters.'),
});

export const signupSchema = loginSchema.extend({
  name: z
    .string()
    .trim()
    .min(2, 'Enter your full name (at least 2 characters).'),
});

export type AuthFields = z.infer<typeof loginSchema>;
