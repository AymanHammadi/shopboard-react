import { beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from '../src/modules/products/components/ProductCard';
import { ProductImage } from '../src/shared/components/ProductImage';
import { QuantityControl } from '../src/shared/components/QuantityControl';
import { AuthForm } from '../src/modules/auth/components/AuthForm';
import { CartProvider } from '../src/modules/cart/components/CartProvider';
import { authActions } from '../src/modules/auth/auth.state';
import { mascara, perfume } from './fixtures';

beforeEach(() => {
  localStorage.clear();
  act(() => {
    authActions.signOut();
  });
});

describe('reusable components', () => {
  it('adds a product and announces the cart quantity', async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <ProductCard product={mascara} />
        </CartProvider>
      </MemoryRouter>,
    );
    await userEvent.click(
      screen.getByRole('button', { name: `Add to cart: ${mascara.title}` }),
    );
    expect(screen.getByRole('status')).toHaveTextContent('1 in your cart');
    expect(screen.getByRole('link', { name: mascara.title })).toHaveAttribute(
      'href',
      '/products/1',
    );
  });
  it('disables a sold-out product without rendering a stray zero', () => {
    const { container } = render(
      <MemoryRouter>
        <CartProvider>
          <ProductCard product={perfume} />
        </CartProvider>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('button', { name: `Out of stock: ${perfume.title}` }),
    ).toBeDisabled();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(container.textContent).not.toMatch(/^0/);
  });
  it('updates the quantity immediately and enforces stock', async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <ProductCard product={{ ...mascara, stock: 1 }} />
        </CartProvider>
      </MemoryRouter>,
    );
    await userEvent.click(
      screen.getByRole('button', { name: `Add to cart: ${mascara.title}` }),
    );
    expect(
      screen.getByRole('button', {
        name: `Stock limit reached: ${mascara.title}`,
      }),
    ).toBeDisabled();
  });
  it('disables minimum and maximum quantity buttons', () => {
    render(
      <QuantityControl
        name="Mascara"
        value={1}
        max={1}
        onChange={() => undefined}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Decrease quantity of Mascara' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Increase quantity of Mascara' }),
    ).toBeDisabled();
  });
  it('shows an accessible image failure instead of an unrelated fallback', () => {
    render(
      <ProductImage src="https://example.com/missing.webp" alt="Mascara" />,
    );
    const image = screen.getByRole('img', { name: 'Mascara' });
    fireEvent.error(image);
    expect(
      screen.getByRole('img', { name: 'Mascara: image unavailable' }),
    ).toBeVisible();
  });
  it('validates on submit, focuses the first invalid field, and clears corrected errors', async () => {
    render(
      <MemoryRouter>
        <AuthForm mode="signup" />
      </MemoryRouter>,
    );
    expect(
      screen.queryByText('Enter a valid email address.'),
    ).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Create account' }),
    );
    expect(screen.getByLabelText('Full name')).toHaveFocus();
    expect(screen.getByText('Enter a valid email address.')).toBeVisible();
    await userEvent.type(screen.getByLabelText('Full name'), 'Alex Doe');
    expect(
      screen.queryByText('Enter your full name (at least 2 characters).'),
    ).not.toBeInTheDocument();
  });
});
