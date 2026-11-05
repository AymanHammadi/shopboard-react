import type { Product } from '../src/modules/products/products.types';

export const mascara: Product = {
  id: 1,
  title: 'Essence Mascara',
  description: 'Long-lasting mascara for everyday use.',
  category: 'beauty',
  priceCents: 999,
  rating: 4.2,
  stock: 4,
  thumbnail:
    'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp',
};

export const chair: Product = {
  ...mascara,
  id: 2,
  title: 'Green Chair',
  description: 'An everyday chair for the home.',
  category: 'furniture',
  priceCents: 12999,
  rating: 4.8,
  stock: 10,
};

export const perfume: Product = {
  ...mascara,
  id: 3,
  title: 'Fresh Fragrance',
  description: 'A fresh fragrance.',
  category: 'fragrances',
  priceCents: 599,
  rating: 3.5,
  stock: 0,
};

export const products = [mascara, chair, perfume];

export const apiProducts = products.map((product) => ({
  id: product.id,
  title: product.title,
  description: product.description,
  category: product.category,
  price: product.priceCents / 100,
  rating: product.rating,
  stock: product.stock,
  thumbnail: product.thumbnail,
  images: [product.thumbnail],
  brand: 'Essence',
  shippingInformation: 'Ships in 3–5 business days',
  warrantyInformation: '1 year warranty',
  returnPolicy: '30 days return policy',
}));
