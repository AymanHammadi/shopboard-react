import { expect, test } from '@playwright/test';
import { apiProducts } from '../tests/fixtures';

test.beforeEach(async ({ page }) => {
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
  await page.goto('/products/99999');
  await expect(
    page.getByRole('heading', { name: 'Product not found' }),
  ).toBeVisible();
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
  let shouldFail = true;
  let release: (() => void) | undefined;
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('https://dummyjson.com/products?**', async (route) => {
    const fail = shouldFail;
    if (fail) {
      await waiting;
      await route.fulfill({
        status: 500,
        json: { message: 'Server unavailable' },
      });
    } else {
      await route.fulfill({ json: { products: [], total: 0 } });
    }
  });
  await page.goto('/');
  await expect(
    page.getByRole('status', { name: 'Loading products' }),
  ).toBeVisible();
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.locator('h1')).toContainText('Good finds.');
  if (release === undefined)
    throw new Error('The delayed response was not initialized.');
  release();
  await expect(
    page.getByRole('heading', { name: 'Products couldn’t load' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Cart, 0 items', exact: true }),
  ).toBeVisible();
  shouldFail = false;
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

test('page modules are requested only when their routes open', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) =>
    requests.push(new URL(request.url()).pathname),
  );
  await page.goto('/');
  await expect(page.locator('.product-card')).toHaveCount(3);
  expect(requests.some((path) => path.endsWith('/CartPage.tsx'))).toBe(false);
  expect(requests.some((path) => path.endsWith('/AuthPage.tsx'))).toBe(false);
  expect(requests.some((path) => path.endsWith('/ProductPage.tsx'))).toBe(
    false,
  );
  await page.getByRole('link', { name: 'Cart, 0 items', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Your cart is empty' }),
  ).toBeVisible();
  expect(requests.some((path) => path.endsWith('/CartPage.tsx'))).toBe(true);
  expect(requests.some((path) => path.endsWith('/AuthPage.tsx'))).toBe(false);
});

test('corrupt or blocked storage does not crash the cart', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('shopboard:cart:v1', '{invalid}');
  });
  await page.goto('/cart');
  await expect(page.getByRole('alert')).toContainText('Cart:');
  await expect(
    page.getByRole('heading', { name: 'Your cart is empty' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Explore products' }).click();
  await page
    .getByRole('button', { name: 'Add to cart: Essence Mascara', exact: true })
    .click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error('Storage blocked');
    };
  });
  await page
    .getByRole('button', { name: 'Add to cart: Essence Mascara', exact: true })
    .click();
  await expect(page.getByRole('alert')).toContainText('could not be saved');
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
    '/login',
    '/signup',
    '/missing',
  ]) {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
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
