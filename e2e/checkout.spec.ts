import { expect, test } from '@playwright/test';
import { apiProducts, mascara } from '../tests/fixtures';

const details = {
  fullName: 'Alex Doe',
  email: 'alex@example.com',
  address: '12 Garden Street',
  city: 'London',
  postalCode: 'SW1A 1AA',
  country: 'United Kingdom',
};

test.beforeEach(async ({ request }) => {
  await request.post('http://127.0.0.1:5198/__scenario', { data: {} });
});

test('checkout endpoint validates requests and checks authoritative stock in both server modes', async ({
  request,
}) => {
  const order = { ...details, lines: [{ productId: 1, quantity: 2 }] };
  const invalid = await request.post('/api/checkout', {
    data: { ...order, subtotalCents: 1 },
  });
  expect(invalid.status()).toBe(400);
  const duplicate = await request.post('/api/checkout', {
    data: { ...order, lines: [...order.lines, ...order.lines] },
  });
  expect(duplicate.status()).toBe(400);
  const stock = await request.post('/api/checkout', {
    data: { ...order, lines: [{ productId: 1, quantity: 5 }] },
  });
  expect(stock.status()).toBe(409);
  const malformed = await request.post('/api/checkout', {
    data: '{bad',
    headers: { 'Content-Type': 'application/json' },
  });
  expect(malformed.status()).toBe(400);
  const success = await request.post('/api/checkout', { data: order });
  expect(success.status()).toBe(201);
  expect(await success.json()).toMatchObject({
    fullName: details.fullName,
    quantity: 2,
    subtotalCents: 1998,
  });
});

test('checkout preserves failed orders, locks pending requests, and confirms fresh prices', async ({
  page,
}) => {
  await page.addInitScript((product) => {
    localStorage.setItem(
      'shopboard:cart:v1',
      JSON.stringify([{ product: { ...product, priceCents: 1 }, quantity: 1 }]),
    );
  }, mascara);
  await page.goto('/checkout');
  await page.getByLabel('Full name').fill(details.fullName);
  await page.getByLabel('Email address').fill(details.email);
  await page.getByLabel('Street address').fill(details.address);
  await page.getByLabel('City').fill(details.city);
  await page.getByLabel('Postal code').fill(details.postalCode);
  await page.getByLabel('Country').fill(details.country);
  await page.request.post('http://127.0.0.1:5198/__scenario', {
    data: { status: 500 },
  });
  await page.getByRole('button', { name: 'Confirm order' }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText(
    'Your order could not be confirmed.',
  );
  await expect(page.getByLabel('Street address')).toHaveValue(details.address);
  await expect(
    page.getByRole('link', { name: 'Cart, 1 item', exact: true }),
  ).toBeVisible();
  await page.request.post('http://127.0.0.1:5198/__scenario', {
    data: {
      delay: 1000,
      catalog: apiProducts.map((product) => ({ ...product, price: 12 })),
    },
  });
  const requests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/checkout')
      requests.push(request.postData() ?? '');
  });
  await page.getByRole('button', { name: 'Confirm order' }).click();
  await expect(
    page.getByRole('button', { name: 'Confirming order…' }),
  ).toBeDisabled();
  await page.locator('form').dispatchEvent('submit');
  await expect(
    page.getByRole('heading', { name: 'Order confirmed' }),
  ).toBeFocused();
  await expect(page.getByText(/1 item, totaling \$12.00/)).toBeVisible();
  expect(requests).toEqual([
    JSON.stringify({ ...details, lines: [{ productId: 1, quantity: 1 }] }),
  ]);
  expect(
    await page.evaluate(() => localStorage.getItem('shopboard:cart:v1')),
  ).toBe('[]');
});
