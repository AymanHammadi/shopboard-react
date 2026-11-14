import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider } from '../src/modules/cart/components/CartProvider';
import { AuthProvider } from '../src/modules/auth/components/AuthProvider';
import { CheckoutPage } from '../src/modules/checkout/pages/CheckoutPage';
import { CheckoutForm } from '../src/modules/checkout/components/CheckoutForm';
import { checkoutSchema } from '../src/modules/checkout/checkout.types';
import { mascara } from './fixtures';

const validDetails = {
  fullName: 'Alex Doe',
  email: 'alex@example.com',
  address: '12 Garden Street',
  city: 'London',
  postalCode: 'SW1A 1AA',
  country: 'United Kingdom',
};

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        orderId: 'b6ad633f-277e-4c2b-a752-98d68bdd3e86',
        fullName: validDetails.fullName,
        quantity: 2,
        subtotalCents: 1998,
      }),
    ),
  );
});

describe('checkout schema', () => {
  it('trims values and accepts international addresses', () => {
    expect(
      checkoutSchema.parse({ ...validDetails, fullName: ' Alex Doe ' }),
    ).toEqual(validDetails);
  });

  it.each(['fullName', 'email', 'address', 'city', 'postalCode', 'country'])(
    'rejects an empty %s in the one schema',
    (field) => {
      expect(
        checkoutSchema.safeParse({ ...validDetails, [field]: ' ' }).success,
      ).toBe(false);
    },
  );

  it('rejects a malformed email', () => {
    expect(
      checkoutSchema.safeParse({ ...validDetails, email: 'alex' }).success,
    ).toBe(false);
  });
});

describe('checkout', () => {
  it('prefills contact details from the provider-owned profile', () => {
    localStorage.setItem(
      'shopboard:profile:v1',
      JSON.stringify({ name: 'Alex Doe', email: 'alex@example.com' }),
    );
    render(<CheckoutForm onComplete={() => undefined} />, {
      wrapper: AuthProvider,
    });
    expect(screen.getByLabelText('Full name')).toHaveValue('Alex Doe');
    expect(screen.getByLabelText('Email address')).toHaveValue(
      'alex@example.com',
    );
  });
  it('does not offer a form when the cart is empty', () => {
    render(
      <CartProvider>
        <CheckoutPage />
      </CartProvider>,
      { wrapper: AuthProvider },
    );
    expect(
      screen.getByText('Add something to your cart before checking out.'),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Confirm order' }),
    ).not.toBeInTheDocument();
  });

  it('keeps invalid orders in the cart, focuses errors, then confirms and persists clearing', async () => {
    localStorage.setItem(
      'shopboard:cart:v1',
      JSON.stringify([{ product: mascara, quantity: 2 }]),
    );
    render(
      <CartProvider>
        <CheckoutPage />
      </CartProvider>,
      { wrapper: AuthProvider },
    );
    const user = userEvent.setup();
    expect(
      screen.queryByText('Enter a valid email address.'),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Confirm order' }));
    expect(screen.getByLabelText('Full name')).toHaveFocus();
    expect(screen.getByLabelText('Email address')).toHaveAccessibleDescription(
      'Enter a valid email address.',
    );
    expect(localStorage.getItem('shopboard:cart:v1')).toContain(
      'Essence Mascara',
    );
    await user.type(screen.getByLabelText('Full name'), validDetails.fullName);
    expect(
      screen.queryByText('Enter your full name (at least 2 characters).'),
    ).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('Email address'), validDetails.email);
    await user.type(
      screen.getByLabelText('Street address'),
      validDetails.address,
    );
    await user.type(screen.getByLabelText('City'), validDetails.city);
    await user.type(
      screen.getByLabelText('Postal code'),
      validDetails.postalCode,
    );
    await user.type(
      screen.getByLabelText('Country'),
      `${validDetails.country}{Enter}`,
    );
    expect(
      await screen.findByRole('heading', { name: 'Order confirmed' }),
    ).toHaveFocus();
    expect(
      screen.getByText(/Your order has 2 items, totaling \$19.98/),
    ).toBeVisible();
    expect(localStorage.getItem('shopboard:cart:v1')).toBe('[]');
    expect(JSON.stringify(localStorage)).not.toContain(validDetails.address);
  });

  it('guards duplicate submissions while validation is pending', async () => {
    const complete = vi.fn();
    const view = render(<CheckoutForm onComplete={complete} />, {
      wrapper: AuthProvider,
    });
    for (const [label, value] of [
      ['Full name', validDetails.fullName],
      ['Email address', validDetails.email],
      ['Street address', validDetails.address],
      ['City', validDetails.city],
      ['Postal code', validDetails.postalCode],
      ['Country', validDetails.country],
    ]) {
      if (label === undefined || value === undefined)
        throw new Error('Missing test field');
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    }
    const form = view.container.querySelector('form');
    if (form === null) throw new Error('Checkout form is missing');
    fireEvent.submit(form);
    fireEvent.submit(form);
    await waitFor(() => expect(complete).toHaveBeenCalledOnce());
  });

  it('keeps the form and cart after a backend failure and permits retry', async () => {
    localStorage.setItem(
      'shopboard:cart:v1',
      JSON.stringify([{ product: mascara, quantity: 2 }]),
    );
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json(
          { message: 'Stock changed. Please edit your cart.' },
          { status: 409 },
        ),
      )
      .mockResolvedValueOnce(
        Response.json({
          orderId: 'b6ad633f-277e-4c2b-a752-98d68bdd3e86',
          fullName: validDetails.fullName,
          quantity: 2,
          subtotalCents: 2400,
        }),
      );
    vi.stubGlobal('fetch', request);
    const view = render(
      <CartProvider>
        <CheckoutPage />
      </CartProvider>,
      { wrapper: AuthProvider },
    );
    for (const [name, value] of Object.entries(validDetails)) {
      const input = view.container.querySelector(`input[name="${name}"]`);
      if (input === null) throw new Error('Missing checkout field');
      fireEvent.change(input, { target: { value } });
    }
    await userEvent.click(
      screen.getByRole('button', { name: 'Confirm order' }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Stock changed.',
    );
    expect(localStorage.getItem('shopboard:cart:v1')).toContain(
      'Essence Mascara',
    );
    expect(screen.getByLabelText('Street address')).toHaveValue(
      validDetails.address,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Confirm order' }),
    );
    expect(await screen.findByText(/totaling \$24.00/)).toBeVisible();
    expect(request).toHaveBeenCalledTimes(2);
    const options = request.mock.calls[0]?.[1];
    expect(options?.body).toBe(
      JSON.stringify({
        ...validDetails,
        lines: [{ productId: 1, quantity: 2 }],
      }),
    );
    expect(localStorage.getItem('shopboard:cart:v1')).toBe('[]');
  });

  it('locks the request until confirmation returns', async () => {
    let resolveOrder: (() => void) | undefined;
    const complete = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveOrder = resolve;
        }),
    );
    const view = render(<CheckoutForm onComplete={complete} />, {
      wrapper: AuthProvider,
    });
    for (const [name, value] of Object.entries(validDetails)) {
      const input = view.container.querySelector(`input[name="${name}"]`);
      if (input === null) throw new Error('Missing checkout field');
      fireEvent.change(input, { target: { value } });
    }
    const form = view.container.querySelector('form');
    if (form === null) throw new Error('Missing form');
    fireEvent.submit(form);
    await waitFor(() => expect(complete).toHaveBeenCalledOnce());
    fireEvent.submit(form);
    expect(
      screen.getByRole('button', { name: 'Confirming order…' }),
    ).toBeDisabled();
    expect(complete).toHaveBeenCalledOnce();
    if (resolveOrder === undefined) throw new Error('Missing pending order');
    resolveOrder();
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Confirm order' }),
      ).toBeDisabled(),
    );
  });
});
