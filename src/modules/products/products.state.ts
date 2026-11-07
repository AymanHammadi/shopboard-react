import { useSuspenseQuery } from '@tanstack/react-query';
import { fetchProduct, fetchProducts } from './products.api';
import { ApiError } from '../../shared/api/client';

export function useProducts() {
  const query = useSuspenseQuery({
    queryKey: ['products'],
    queryFn: ({ signal }) => fetchProducts(signal),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
  if (query.error !== null && query.isFetching === false) throw query.error;
  return query;
}

export function useProduct(id: number) {
  const query = useSuspenseQuery({
    queryKey: ['product', id],
    queryFn: async ({ signal }) => {
      try {
        return await fetchProduct(id, signal);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
  if (query.error !== null && query.isFetching === false) throw query.error;
  return query;
}
