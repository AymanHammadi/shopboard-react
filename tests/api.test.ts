import { describe, expect, it, vi } from 'vitest';
import { ApiError, getJson } from '../src/shared/api/client';
import {
  fetchProduct,
  fetchProducts,
} from '../src/modules/products/products.api';
import { apiProducts } from './fixtures';

describe('product API boundary', () => {
  it('loads all selected fields and maps dollars to cents', async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ products: apiProducts, total: 3 }));
    vi.stubGlobal('fetch', request);
    const products = await fetchProducts(new AbortController().signal);
    expect(products[0]?.priceCents).toBe(999);
    expect(request.mock.calls[0]?.[0]).toContain('limit=0&select=');
    expect(products[0]).not.toHaveProperty('price');
  });
  it('loads and validates a single product', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(Response.json(apiProducts[0])),
    );
    const details = await fetchProduct(1, new AbortController().signal);
    expect(details.id).toBe(1);
    expect(details.images).toHaveLength(1);
  });
  it('rejects non-OK responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          Response.json({ message: 'failure' }, { status: 500 }),
        ),
    );
    await expect(
      getJson('/products', new AbortController().signal),
    ).rejects.toBeInstanceOf(ApiError);
  });
  it('uses the configured base URL including its scenario prefix', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(Response.json({}));
    vi.stubGlobal('fetch', request);
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', '/api/fail/500/');
    try {
      await getJson('/products/1', new AbortController().signal);
      expect(request.mock.calls[0]?.[0]).toBe('/api/fail/500/products/1');
    } finally {
      vi.unstubAllEnvs();
    }
  });
  it('accepts a genuinely empty catalog', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(Response.json({ products: [], total: 0 })),
    );
    await expect(fetchProducts(new AbortController().signal)).resolves.toEqual(
      [],
    );
  });
  it('rejects incomplete and malformed catalogs', async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json({ products: apiProducts, total: 30 }),
      )
      .mockResolvedValueOnce(
        Response.json({ products: [{ id: 'wrong' }], total: 1 }),
      );
    vi.stubGlobal('fetch', request);
    await expect(fetchProducts(new AbortController().signal)).rejects.toThrow(
      'incomplete',
    );
    await expect(fetchProducts(new AbortController().signal)).rejects.toThrow();
  });
});
