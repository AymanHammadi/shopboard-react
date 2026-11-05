import { useQuery } from '@tanstack/react-query';
import { fetchProduct, fetchProducts } from './products.api';
import { ApiError } from '../../shared/api/client';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: ({ signal }) => fetchProducts(signal),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
}

export function useProduct(id: number | null) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: ({ signal }) => {
      if (id === null) throw new ApiError(404);
      return fetchProduct(id, signal);
    },
    enabled: id !== null,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
