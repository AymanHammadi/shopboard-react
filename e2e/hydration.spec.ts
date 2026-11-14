import { expect, test } from '@playwright/test';

test('product metadata and content share one server inventory request', async ({
  request,
}) => {
  await request.post('http://127.0.0.1:5198/__scenario', { data: {} });
  const response = await request.get('/products/1');
  expect(await response.text()).toContain(
    '<title>Essence Mascara | ShopBoard</title>',
  );
  const counts = await request.get('http://127.0.0.1:5198/__requests');
  expect(await counts.json()).toEqual({ detailRequests: 1 });
});

test('purchase controls wait for hydration while product content remains visible', async ({
  page,
}) => {
  await page.request.post('http://127.0.0.1:5198/__scenario', { data: {} });
  let release: (() => void) | undefined;
  const scripts = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/_next/static/**/*.js', async (route) => {
    await scripts;
    await route.continue();
  });
  await page.route('https://cdn.dummyjson.com/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg"/>',
    }),
  );
  if (release === undefined) throw new Error('Missing script gate');
  try {
    await page.goto('/', { waitUntil: 'commit' });
    await expect(page.locator('.product-card h3').first()).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: 'Add to cart: Essence Mascara',
        exact: true,
      }),
    ).toBeDisabled();
  } finally {
    release();
  }
  await page
    .getByRole('button', { name: 'Add to cart: Essence Mascara', exact: true })
    .click();
  await expect(
    page.getByRole('link', { name: 'Cart, 1 item', exact: true }),
  ).toBeVisible();
});

test('simulated authentication cannot submit before its browser handler is ready', async ({
  page,
}) => {
  let release: (() => void) | undefined;
  const scripts = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/_next/static/**/*.js', async (route) => {
    await scripts;
    await route.continue();
  });
  if (release === undefined) throw new Error('Missing script gate');
  try {
    await page.goto('/login', { waitUntil: 'commit' });
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Log in', exact: true }),
    ).toBeDisabled();
  } finally {
    release();
  }
  await expect(
    page.getByRole('button', { name: 'Log in', exact: true }),
  ).toBeEnabled();
});

test('hydrates server data without duplicate browser requests and keeps filters local', async ({
  page,
}) => {
  await page.request.post('http://127.0.0.1:5198/__scenario', { data: {} });
  const requests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).hostname === 'dummyjson.com')
      requests.push(request.url());
  });
  await page.route('https://cdn.dummyjson.com/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg"/>',
    }),
  );
  await page.goto('/?category=beauty');
  await expect(page.locator('.product-card h3')).toHaveText([
    'Essence Mascara',
  ]);
  await page.getByLabel('Category', { exact: true }).selectOption('all');
  await expect(page.locator('.product-card')).toHaveCount(3);
  await page.getByLabel('Search products').fill('chair');
  await expect(page.locator('.product-card h3')).toHaveText(['Green Chair']);
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page
    .getByRole('link', { name: 'Essence Mascara', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Essence Mascara' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Back to the shop' }).click();
  await expect(page.locator('.product-card')).toHaveCount(3);
  expect(requests).toEqual([]);
});
