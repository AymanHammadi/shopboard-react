import { z } from 'zod';

export const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Enter your full name (at least 2 characters).')
    .max(100, 'Keep your name under 100 characters.'),
  email: z.string().trim().pipe(z.email('Enter a valid email address.')),
  address: z
    .string()
    .trim()
    .min(5, 'Enter your street address (at least 5 characters).')
    .max(200, 'Keep your address under 200 characters.'),
  city: z
    .string()
    .trim()
    .min(2, 'Enter your city.')
    .max(100, 'Keep your city under 100 characters.'),
  postalCode: z
    .string()
    .trim()
    .min(2, 'Enter your postal code.')
    .max(20, 'Keep your postal code under 20 characters.'),
  country: z
    .string()
    .trim()
    .min(2, 'Enter your country.')
    .max(100, 'Keep your country under 100 characters.'),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;

export interface OrderReceipt {
  readonly fullName: string;
  readonly quantity: number;
  readonly subtotalCents: number;
}
