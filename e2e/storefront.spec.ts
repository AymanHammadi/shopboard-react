import { expect, test } from '@playwright/test';
import { apiProducts, mascara } from '../tests/fixtures';

test.beforeEach(async ({ page }) => {
  await page.request.post('http://127.0.0.1:5198/__scenario', { data: {} });
  await page.route('https://dummyjson.com/products**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/products') {
      await route.fulfill({
        json: { products: apiProducts, total: apiProducts.length },
      });
      return;
    }
    const id = Number(url.pathname.split('/').at(-1));
    const product = apiProducts.find((item) => item.id === id);
    await route.fulfill(
      product === undefined
        ? { status: 404, json: { message: 'Not found' } }
        : { json: product },
    );
  });
  await page.route('https://cdn.dummyjson.com/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#e8ebe6"/></svg>',
    }),
  );
});

test('search, category, sorting, default order and no match', async ({
  page,
}) => {
  await page.goto('/');
  const names = page.locator('.product-card h3');
  await expect(names).toHaveText([
    'Essence Mascara',
    'Green Chair',
    'Fresh Fragrance',
  ]);
  await page.getByLabel('Sort by').selectOption('price-asc');
  await expect(names).toHaveText([
    'Fresh Fragrance',
    'Essence Mascara',
    'Green Chair',
  ]);
  await page.getByLabel('Sort by').selectOption('default');
  await expect(names).toHaveText([
    'Essence Mascara',
    'Green Chair',
    'Fresh Fragrance',
  ]);
  await page.getByLabel('Category', { exact: true }).selectOption('beauty');
  await page.getByLabel('Search products').fill('everyday');
  await expect(names).toHaveText(['Essence Mascara']);
  await page.getByLabel('Search products').fill('not-a-product');
  await expect(
    page.getByRole('heading', { name: 'No products match.' }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Search products')).toHaveValue('not-a-product');
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(names).toHaveCount(3);
});

test('cart updates immediately, survives refresh, removes and clears', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Add to cart: Essence Mascara', exact: true })
    .click();
  await page.getByRole('link', { name: 'Cart, 1 item', exact: true }).click();
  await page
    .getByRole('button', { name: 'Increase quantity of Essence Mascara' })
    .click();
  await page
    .getByRole('button', { name: 'Increase quantity of Essence Mascara' })
    .click();
  await expect(
    page.getByLabel('Quantity of Essence Mascara', { exact: true }),
  ).toHaveText('3');
  await expect(page.getByLabel('Line total for Essence Mascara')).toHaveText(
    '$29.97',
  );
  await page.reload();
  await expect(
    page.getByLabel('Quantity of Essence Mascara', { exact: true }),
  ).toHaveText('3');
  await page
    .getByRole('button', { name: 'Decrease quantity of Essence Mascara' })
    .click();
  await expect(page.getByLabel('Line total for Essence Mascara')).toHaveText(
    '$19.98',
  );
  await page.getByRole('button', { name: 'Remove Essence Mascara' }).click();
  await expect(page.locator('h1')).toBeFocused();
  await expect(
    page.getByRole('heading', { name: 'Your cart is empty' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Explore products' }).click();
  await page
    .getByRole('button', { name: 'Add to cart: Green Chair', exact: true })
    .click();
  await page.getByRole('link', { name: 'Cart, 1 item', exact: true }).click();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Clear cart' }).click();
  await expect(
    page.getByLabel('Quantity of Green Chair', { exact: true }),
  ).toHaveText('1');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Clear cart' }).click();
  await expect(
    page.getByRole('heading', { name: 'Your cart is empty' }),
  ).toBeVisible();
});

test('product details, stock cap and missing product routes', async ({
  page,
}) => {
  await page.goto('/products/1');
  await expect(
    page.getByRole('heading', { name: 'Essence Mascara' }),
  ).toBeVisible();
  await expect(page.locator('title')).toHaveCount(1);
  await expect(page).toHaveTitle('Essence Mascara | ShopBoard');
  const increase = page.getByRole('button', {
    name: 'Increase quantity of Essence Mascara',
  });
  for (let count = 0; count < 3; count += 1) await increase.click();
  await expect(increase).toBeDisabled();
  await page
    .getByRole('button', { name: 'Add to cart: Essence Mascara', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Stock limit reached: Essence Mascara' }),
  ).toBeDisabled();
  await page.goto('/products/abc');
  await expect(
    page.getByRole('heading', { name: 'Product not found' }),
  ).toBeVisible();
  await expect(page).toHaveTitle('Product not found | ShopBoard');
  await page.goto('/products/99999');
  await expect(
    page.getByRole('heading', { name: 'Product not found' }),
  ).toBeVisible();
  await expect(page).toHaveTitle('Product not found | ShopBoard');
  await page.goto('/missing');
  await expect(
    page.getByRole('heading', { name: 'Page not found' }),
  ).toBeVisible();
});

test('signup and login persist only a profile, retain the guest cart', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Add to cart: Essence Mascara', exact: true })
    .click();
  await page.getByRole('link', { name: 'Log in', exact: true }).click();
  await page.getByRole('link', { name: 'Create an account' }).click();
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await page.getByLabel('Full name').fill('Alex Doe');
  await page.getByLabel('Email address').fill('alex@example.com');
  await page
    .getByLabel('Password', { exact: true })
    .fill('not-stored-password');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(
    page.getByRole('button', { name: 'Log out Alex Doe' }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Log out Alex Doe' }),
  ).toBeVisible();
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    'not-stored-password',
  );
  await page.getByRole('button', { name: 'Log out Alex Doe' }).click();
  await expect(
    page.getByRole('link', { name: 'Cart, 1 item', exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Log in', exact: true }).click();
  await page.getByLabel('Email address').fill('alex@example.com');
  await page.getByLabel('Password', { exact: true }).fill('another-password');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Log out alex', exact: true }),
  ).toBeVisible();
});

test('loading, error retry and genuinely empty catalog', async ({ page }) => {
  await page.request.post('http://127.0.0.1:5198/__scenario', {
    data: { status: 500, delay: 1500 },
  });
  await page.route('https://dummyjson.com/products?**', (route) =>
    route.fulfill({ status: 500, json: {} }),
  );
  await page.goto('/', { waitUntil: 'commit' });
  await expect(
    page.getByRole('status', { name: 'Loading products' }),
  ).toBeVisible();
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.locator('h1')).toContainText('Good finds.');
  await expect(
    page.getByRole('heading', { name: 'Products couldn’t load' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Cart, 0 items', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(
    page.getByRole('heading', { name: 'Products couldn’t load' }),
  ).toBeVisible();
  await page.route('https://dummyjson.com/products?**', (route) =>
    route.fulfill({ json: { products: [], total: 0 } }),
  );
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(
    page.getByRole('heading', { name: 'No products available' }),
  ).toBeVisible();
});

test('product errors retry inside the page without losing the cart', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Add to cart: Essence Mascara', exact: true })
    .click();
  let shouldFail = true;
  await page.request.post('http://127.0.0.1:5198/__scenario', {
    data: { detailStatus: 500 },
  });
  await page.route('https://dummyjson.com/products/1', (route) =>
    route.fulfill(
      shouldFail ? { status: 500, json: {} } : { json: apiProducts[0] },
    ),
  );
  await page
    .getByRole('link', { name: 'Essence Mascara', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Product couldn’t load' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Back to the shop' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Cart, 1 item', exact: true }),
  ).toBeVisible();
  shouldFail = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(
    page.getByRole('heading', { name: 'Essence Mascara' }),
  ).toBeVisible();
  await expect(page).toHaveTitle('Essence Mascara | ShopBoard');
});

test('App Router navigation preserves the shared layout', async ({ page }) => {
  const routeRequests: string[] = [];
  page.on('request', (request) => {
    if (request.headers().rsc === '1') {
      routeRequests.push(new URL(request.url()).pathname);
    }
  });
  await page.goto('/');
  await expect(page.locator('.product-card')).toHaveCount(3);
  const header = await page.getByRole('banner').elementHandle();
  if (header === null) throw new Error('Missing shared header');
  await page.getByRole('link', { name: 'Cart, 0 items', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Your cart is empty' }),
  ).toBeVisible();
  await expect(page).toHaveURL('/cart');
  expect(routeRequests).toContain('/cart');
  expect(await header.evaluate((element) => element.isConnected)).toBe(true);
});

test('API scenarios are available only during development', async ({
  page,
  baseURL,
}) => {
  if (process.env.SHOPBOARD_E2E_PRODUCTION === '1') {
    for (const path of [
      '/api/products',
      '/api/fail/500/products',
      '/api/empty/products',
      '/api/delay/50/products',
    ]) {
      const response = await page.request.get(path);
      expect(response.status()).toBe(404);
    }
    return;
  }
  let mode = 'fail/500';
  await page.request.post('http://127.0.0.1:5198/__scenario', {
    data: { status: 500 },
  });
  await page.route('https://dummyjson.com/products?**', async (route) => {
    const response = await route.fetch({
      url: `${baseURL}/api/${mode}/products`,
    });
    await route.fulfill({ response });
  });
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Products couldn’t load' }),
  ).toBeVisible();
  mode = 'empty';
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(
    page.getByRole('heading', { name: 'No products available' }),
  ).toBeVisible();
});

test.describe('server rendering', () => {
  test.use({ javaScriptEnabled: false });

  test('includes products in server HTML without JavaScript and returns a real 404 for unknown routes', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Good finds.');
    await expect(page.locator('.product-card h3')).toHaveText([
      'Essence Mascara',
      'Green Chair',
      'Fresh Fragrance',
    ]);
    await page.goto('/?category=beauty&search=everyday');
    await expect(page.locator('.product-card h3')).toHaveText([
      'Essence Mascara',
    ]);
    const detailResponse = await page.goto('/products/1');
    expect(await detailResponse?.text()).toContain('<h1>Essence Mascara</h1>');
    expect(await detailResponse?.text()).toContain(
      '<title>Essence Mascara | ShopBoard</title>',
    );
    const response = await page.goto('/missing');
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { name: 'Page not found' }),
    ).toBeVisible();
  });
});

test('a slow catalog does not block navigating to the cart', async ({
  page,
}) => {
  await page.request.post('http://127.0.0.1:5198/__scenario', {
    data: { delay: 3000 },
  });
  await page.goto('/', { waitUntil: 'commit' });
  await expect(
    page.getByRole('status', { name: 'Loading products' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Cart, 0 items', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Your cart is empty' }),
  ).toBeVisible();
});

test('corrupt or blocked storage does not crash the cart', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('shopboard:cart:v1', '{invalid}');
  });
  await page.goto('/cart');
  await expect(page.locator('.storage-notice')).toContainText('Cart:');
  await expect(
    page.getByRole('heading', { name: 'Your cart is empty' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Explore products' }).click();
  await page
    .getByRole('button', { name: 'Add to cart: Essence Mascara', exact: true })
    .click();
  await expect(page.locator('.storage-notice')).toHaveCount(0);
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error('Storage blocked');
    };
  });
  await page
    .getByRole('button', { name: 'Add to cart: Essence Mascara', exact: true })
    .click();
  await expect(page.locator('.storage-notice')).toContainText(
    'could not be saved',
  );
  await expect(
    page.getByRole('link', { name: 'Cart, 2 items', exact: true }),
  ).toBeVisible();
});

test('layout fits the viewport and the console has no React errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      errors.push(message.text());
  });
  for (const path of [
    '/',
    '/products/1',
    '/cart',
    '/checkout',
    '/login',
    '/signup',
  ]) {
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('checkout validates, confirms without payment, and clears the persistent cart', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      errors.push(message.text());
  });
  await page.goto('/checkout');
  await expect(
    page.getByRole('heading', { name: 'Your cart is empty' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Explore products' }).click();
  await page
    .getByRole('button', { name: 'Add to cart: Essence Mascara', exact: true })
    .click();
  await page.getByRole('link', { name: 'Cart, 1 item', exact: true }).click();
  await page.getByRole('link', { name: 'Checkout', exact: true }).click();
  await expect(page).toHaveURL('/checkout');
  await expect(page.getByRole('heading', { name: 'Your order' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your order' })).toBeVisible();
  await page.getByRole('button', { name: 'Confirm order' }).click();
  await expect(page.getByLabel('Full name')).toBeFocused();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole('link', { name: 'Cart, 1 item', exact: true }),
  ).toBeVisible();
  await page.getByLabel('Full name').fill('Alex Doe');
  await page.getByLabel('Email address').fill('alex@example.com');
  await page.getByLabel('Street address').fill('12 Garden Street');
  await page.getByLabel('City').fill('London');
  await page.getByLabel('Postal code').fill('SW1A 1AA');
  await page.getByLabel('Country').fill('United Kingdom');
  expect(
    await page
      .getByLabel('Country')
      .evaluate((node) => getComputedStyle(node).fontSize),
  ).toBe('16px');
  await page.getByLabel('Country').press('Enter');
  await expect(
    page.getByRole('heading', { name: 'Order confirmed' }),
  ).toBeFocused();
  await expect(page).toHaveTitle('Order confirmed | ShopBoard');
  await expect(page.locator('title')).toHaveCount(1);
  await expect(page.getByText(/1 item, totaling \$9.99/)).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Cart, 0 items', exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    '12 Garden Street',
  );
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Your cart is empty' }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('checkout restores the profile and cart after server hydration', async ({
  page,
}) => {
  await page.addInitScript(
    ({ product }) => {
      localStorage.setItem(
        'shopboard:profile:v1',
        JSON.stringify({ name: 'Alex Doe', email: 'alex@example.com' }),
      );
      localStorage.setItem(
        'shopboard:cart:v1',
        JSON.stringify([{ product, quantity: 1 }]),
      );
    },
    { product: mascara },
  );
  await page.goto('/checkout');
  await expect(page.getByRole('heading', { name: 'Your order' })).toBeVisible();
  await expect(page.getByLabel('Full name')).toHaveValue('Alex Doe');
  await expect(page.getByLabel('Email address')).toHaveValue(
    'alex@example.com',
  );
});

test('pagination stays local and resets when filters change', async ({
  page,
}) => {
  const catalog = Array.from({ length: 25 }, (_, index) => ({
    ...apiProducts[0],
    id: index + 1,
    title: `Product ${String(index + 1)}`,
  }));
  await page.route('https://dummyjson.com/products?**', (route) =>
    route.fulfill({ json: { products: catalog, total: catalog.length } }),
  );
  await page.request.post('http://127.0.0.1:5198/__scenario', {
    data: { catalog },
  });
  await page.goto('/');
  await expect(page.locator('.product-card')).toHaveCount(12);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('.product-card h3').first()).toHaveText(
    'Product 13',
  );
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page.getByLabel('Search products').fill('Product 1');
  await expect(page.locator('.product-card h3').first()).toHaveText(
    'Product 1',
  );
  await expect(page).not.toHaveURL(/page=/);
});
