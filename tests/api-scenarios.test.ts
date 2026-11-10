import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveApiScenario } from '../tooling/api-scenarios';
import { GET } from '../src/app/api/[...path]/route';

beforeEach(() => vi.stubEnv('NODE_ENV', 'development'));

describe('development API scenarios', () => {
  it('preserves delayed product paths and query parameters and caps the delay', () => {
    expect(
      resolveApiScenario(
        new URL('http://localhost/api/delay/3000/products/1?select=title'),
      ),
    ).toEqual({
      path: '/products/1?select=title',
      delay: 3000,
      response: null,
    });
    expect(
      resolveApiScenario(new URL('http://localhost/api/delay/99999/products'))
        ?.delay,
    ).toBe(10_000);
  });

  it('returns the requested HTTP failure for catalog and detail requests', async () => {
    for (const path of ['/products', '/products/1']) {
      expect(
        (await GET(new Request(`http://localhost/api/fail/500${path}`))).status,
      ).toBe(500);
    }
  });

  it('returns an empty catalog and a missing detail without proxying products', async () => {
    const request = vi.spyOn(globalThis, 'fetch');
    const catalog = await GET(
      new Request('http://localhost/api/empty/products'),
    );
    expect(await catalog.json()).toEqual({ products: [], total: 0 });
    expect(
      (await GET(new Request('http://localhost/api/empty/products/1'))).status,
    ).toBe(404);
    expect(request).not.toHaveBeenCalled();
  });

  it('proxies product requests to DummyJSON even when the public base URL is a scenario', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', '/api/delay/3000');
    const request = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(Response.json({ products: [], total: 0 }));
    const response = await GET(
      new Request('http://localhost/api/products?limit=0'),
    );
    expect(response.status).toBe(200);
    expect(request).toHaveBeenCalledWith(
      'https://dummyjson.com/products?limit=0',
      expect.any(Object),
    );
  });

  it('does not provide scenario endpoints in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(
      (await GET(new Request('http://localhost/api/fail/500/products'))).status,
    ).toBe(404);
  });

  it('waits before forwarding a delayed request and preserves its query', async () => {
    const request = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(Response.json({ id: 1 }));
    const start = performance.now();
    const response = await GET(
      new Request('http://localhost/api/delay/50/products/1?select=title'),
    );
    expect(performance.now() - start).toBeGreaterThanOrEqual(40);
    expect(response.status).toBe(200);
    expect(request).toHaveBeenCalledWith(
      'https://dummyjson.com/products/1?select=title',
      expect.any(Object),
    );
  });

  it('keeps upstream errors instead of substituting inventory', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({ message: 'Not found' }, { status: 404 }),
    );
    const response = await GET(
      new Request('http://localhost/api/products/999'),
    );
    expect(response.status).toBe(404);
  });

  it('rejects application routes and unsupported proxy targets', () => {
    for (const path of ['/checkout', '/api/users', '/api/products/1/other']) {
      expect(resolveApiScenario(new URL(`http://localhost${path}`))).toBeNull();
    }
  });
});
