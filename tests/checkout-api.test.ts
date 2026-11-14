import { describe, expect, it, vi } from 'vitest';
import { POST } from '../src/app/api/checkout/route';
import { placeOrder } from '../src/modules/checkout/checkout.api';
import { orderReceiptSchema } from '../src/modules/checkout/checkout.types';
import { removePurchasedItems } from '../src/modules/cart/cart.logic';
import { apiProducts, mascara, chair } from './fixtures';

vi.mock('server-only', () => ({}));

const order = {
  fullName: 'Alex Doe',
  email: 'alex@example.com',
  address: '12 Garden Street',
  city: 'London',
  postalCode: 'SW1A 1AA',
  country: 'United Kingdom',
  lines: [{ productId: 1, quantity: 2 }],
};
function request(body: unknown) {
  return new Request('http://localhost/api/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
function inventory(catalog = apiProducts) {
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValue(
      Response.json({ products: catalog, total: catalog.length }),
    );
  vi.stubGlobal('fetch', fetcher);
  return fetcher;
}

describe('demo checkout endpoint', () => {
  it('prices from freshly fetched inventory and returns a validated receipt', async () => {
    const fetcher = inventory(
      apiProducts.map((product) => ({ ...product, price: 12 })),
    );
    const response = await POST(request(order));
    expect(response.status).toBe(201);
    expect(orderReceiptSchema.parse(await response.json())).toMatchObject({
      fullName: 'Alex Doe',
      quantity: 2,
      subtotalCents: 2400,
    });
    expect(fetcher.mock.calls[0]?.[1]?.cache).toBe('no-store');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it.each([
    { ...order, fullName: '' },
    { ...order, email: 'bad' },
    { ...order, address: '' },
    { ...order, lines: [] },
    { ...order, lines: [{ productId: 1, quantity: 0 }] },
    { ...order, lines: [{ productId: 1, quantity: 1.5 }] },
    { ...order, lines: [{ productId: 1, quantity: 1001 }] },
    { ...order, lines: [{ productId: '1', quantity: 1 }] },
    { ...order, lines: [{ productId: 1, quantity: 1, priceCents: 1 }] },
    { ...order, subtotalCents: 1 },
    { ...order, lines: [...order.lines, ...order.lines] },
  ])(
    'rejects invalid or price-tampered requests before fetching',
    async (body) => {
      const fetcher = inventory();
      expect((await POST(request(body))).status).toBe(400);
      expect(fetcher).not.toHaveBeenCalled();
    },
  );

  it('rejects malformed JSON', async () => {
    expect(
      (
        await POST(
          new Request('http://localhost/api/checkout', {
            method: 'POST',
            body: '{bad',
          }),
        )
      ).status,
    ).toBe(400);
  });

  it.each([
    { productId: 1, quantity: 5 },
    { productId: 3, quantity: 1 },
    { productId: 99, quantity: 1 },
  ])('rejects stock and missing-product conflicts', async (line) => {
    inventory();
    expect((await POST(request({ ...order, lines: [line] }))).status).toBe(409);
  });

  it.each([
    Response.json({}, { status: 500 }),
    Response.json({ products: [{ bad: true }], total: 1 }),
  ])(
    'fails closed when inventory is unavailable or malformed',
    async (response) => {
      vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(response));
      expect((await POST(request(order))).status).toBe(502);
    },
  );

  it('does not remove cart additions made while an order was pending', () => {
    const purchased = [{ product: mascara, quantity: 2 }];
    const current = [
      { product: mascara, quantity: 3 },
      { product: chair, quantity: 1 },
    ];
    expect(removePurchasedItems(current, purchased)).toEqual([
      { product: mascara, quantity: 1 },
      { product: chair, quantity: 1 },
    ]);
    expect(current[0]?.quantity).toBe(3);
  });
});

describe('checkout response validation', () => {
  it('rejects a malformed receipt instead of treating the request as completed', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(Response.json({ subtotalCents: 1 })),
    );
    await expect(placeOrder(order)).rejects.toThrow(
      'Your order could not be confirmed.',
    );
  });
});
