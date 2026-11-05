import { z } from 'zod';

export const categorySchema = z.enum([
  'beauty',
  'fragrances',
  'furniture',
  'groceries',
  'home-decoration',
  'kitchen-accessories',
  'laptops',
  'mens-shirts',
  'mens-shoes',
  'mens-watches',
  'mobile-accessories',
  'motorcycle',
  'skin-care',
  'smartphones',
  'sports-accessories',
  'sunglasses',
  'tablets',
  'tops',
  'vehicle',
  'womens-bags',
  'womens-dresses',
  'womens-jewellery',
  'womens-shoes',
  'womens-watches',
]);

export type Category = z.infer<typeof categorySchema>;

export const productSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string(),
  category: categorySchema,
  priceCents: z.number().int().nonnegative(),
  rating: z.number().min(0).max(5),
  stock: z.number().int().nonnegative(),
  thumbnail: z.url(),
});

export type Product = Readonly<z.infer<typeof productSchema>>;

export interface ProductDetails extends Product {
  readonly images: readonly [string, ...string[]];
  readonly brand: string | undefined;
  readonly shippingInformation: string;
  readonly returnPolicy: string;
  readonly warrantyInformation: string;
}

export const sortSchema = z.enum([
  'default',
  'price-asc',
  'price-desc',
  'rating',
  'name',
]);
export type ProductSort = z.infer<typeof sortSchema>;

export interface ProductFilters {
  readonly search: string;
  readonly category: Category | 'all';
  readonly sort: ProductSort;
}
