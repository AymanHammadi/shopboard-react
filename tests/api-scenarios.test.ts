import { createServer } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { apiScenarioMiddleware } from '../tooling/api-scenarios';

const server = createServer((request, response) => {
  apiScenarioMiddleware(request, response, () => {
    response.end(request.url);
  });
});
let baseUrl: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (address === null || typeof address === 'string')
    throw new Error('Missing test server address');
  baseUrl = `http://127.0.0.1:${String(address.port)}`;
});

afterAll(
  () =>
    new Promise<void>((resolve, reject) =>
      server.close((error) => {
        if (error !== undefined) reject(error);
        else resolve();
      }),
    ),
);

describe('development API scenarios', () => {
  it('delays forwarding for 3000ms and keeps the requested product and query', async () => {
    const start = performance.now();
    const response = await fetch(
      `${baseUrl}/api/delay/3000/products/1?select=title`,
    );
    expect(performance.now() - start).toBeGreaterThanOrEqual(2950);
    expect(await response.text()).toBe('/api/products/1?select=title');
  });

  it('returns the requested HTTP failure for catalog and detail requests', async () => {
    for (const path of ['/products', '/products/1']) {
      expect((await fetch(`${baseUrl}/api/fail/500${path}`)).status).toBe(500);
    }
  });

  it('returns an empty catalog and a missing detail without proxying products', async () => {
    const catalog = await fetch(`${baseUrl}/api/empty/products`);
    expect(await catalog.json()).toEqual({ products: [], total: 0 });
    expect((await fetch(`${baseUrl}/api/empty/products/1`)).status).toBe(404);
  });

  it('leaves application routes alone', async () => {
    const response = await fetch(`${baseUrl}/checkout`);
    expect(await response.text()).toBe('/checkout');
  });
});
