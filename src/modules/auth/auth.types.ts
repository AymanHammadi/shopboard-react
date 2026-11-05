import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
});

export type Profile = Readonly<z.infer<typeof profileSchema>>;

export interface AuthFields {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

export interface AuthErrors {
  readonly name?: string;
  readonly email?: string;
  readonly password?: string;
}
