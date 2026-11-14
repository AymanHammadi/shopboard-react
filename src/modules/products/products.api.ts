import { z } from 'zod';
import { getJson } from '../../shared/api/client';
import { toCents } from '../../shared/money';
import { categorySchema } from './products.types';
import type { Product, ProductDetails } from './products.types';

const apiProductSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string(),
  category: categorySchema,
  price: z.number().finite().nonnegative(),
  rating: z.number().min(0).max(5),
  stock: z.number().int().nonnegative(),
  thumbnail: z.url(),
});

const catalogSchema = z.object({
  products: z.array(apiProductSchema),
  total: z.number().int().nonnegative(),
});

const detailsSchema = apiProductSchema.extend({
  images: z.tuple([z.url()]).rest(z.url()),
  brand: z.string().optional(),
  shippingInformation: z.string(),
  returnPolicy: z.string(),
  warrantyInformation: z.string(),
});

function mapProduct(product: z.infer<typeof apiProductSchema>): Product {
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    category: product.category,
    priceCents: toCents(product.price),
    rating: product.rating,
    stock: product.stock,
    thumbnail: product.thumbnail,
  };
}

export async function fetchProducts(
  signal: AbortSignal,
  baseUrl?: string,
): Promise<readonly Product[]> {
  const data = await getJson(
    '/products?limit=0&select=title,description,category,price,rating,stock,thumbnail',
    signal,
    baseUrl,
  );
  const catalog = catalogSchema.parse(data);
  if (catalog.total !== catalog.products.length) {
    throw new Error('The catalog response is incomplete.');
  }
  return catalog.products.map(mapProduct);
}

export async function fetchProduct(
  id: number,
  signal: AbortSignal,
  baseUrl?: string,
): Promise<ProductDetails> {
  const data = detailsSchema.parse(
    await getJson(`/products/${String(id)}`, signal, baseUrl),
  );
  return {
    ...mapProduct(data),
    images: data.images,
    brand: data.brand,
    shippingInformation: data.shippingInformation,
    returnPolicy: data.returnPolicy,
    warrantyInformation: data.warrantyInformation,
  };
}
