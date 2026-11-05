import { z } from 'zod';
import { productSchema } from '../products/products.types';

export const cartItemSchema = z
  .object({
    product: productSchema,
    quantity: z.number().int().positive(),
  })
  .refine((item) => item.quantity <= item.product.stock);

export const cartSchema = z
  .array(cartItemSchema)
  .refine(
    (items) =>
      new Set(items.map((item) => item.product.id)).size === items.length,
  );

export interface CartItem {
  readonly product: Readonly<z.infer<typeof productSchema>>;
  readonly quantity: number;
}

export type Cart = readonly CartItem[];
