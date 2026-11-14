import 'server-only';

import { headers } from 'next/headers';
import { ApiError } from '../../shared/api/client';
import { fetchProduct, fetchProducts } from './products.api';

export async function productApiBaseUrl() {
  const base =
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    'https://dummyjson.com';
  if (base.startsWith('/') && process.env.NODE_ENV === 'development') {
    const host = (await headers()).get('host');
    if (host === null) throw new Error('Missing development server host.');
    return new URL(base, `http://${host}`).href;
  }
  return base;
}

export async function loadProducts(signal: AbortSignal) {
  return fetchProducts(signal, await productApiBaseUrl());
}

export async function loadProduct(id: number, signal: AbortSignal) {
  try {
    return await fetchProduct(id, signal, await productApiBaseUrl());
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
