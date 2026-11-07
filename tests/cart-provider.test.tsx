import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider } from '../src/modules/cart/components/CartProvider';
import { useCart } from '../src/modules/cart/cart.state';
import { cartTotals } from '../src/modules/cart/cart.logic';
import { mascara } from './fixtures';

function CartCount() {
  const { value } = useCart();
  return (
    <output aria-label="Cart quantity">{cartTotals(value).quantity}</output>
  );
}

function CartActions() {
  const { actions } = useCart();
  return (
    <>
      <button
        onClick={() => {
          actions.add(mascara);
          actions.add(mascara);
        }}
      >
        Add two
      </button>
      <button onClick={actions.clear}>Clear</button>
    </>
  );
}

beforeEach(() => localStorage.clear());

describe('cart Context', () => {
  it('shares one cart between siblings and restores it after remounting', async () => {
    const tree = (
      <CartProvider>
        <CartCount />
        <CartActions />
      </CartProvider>
    );
    const view = render(tree);
    await userEvent.click(screen.getByRole('button', { name: 'Add two' }));
    expect(screen.getByLabelText('Cart quantity')).toHaveTextContent('2');
    view.unmount();
    render(tree);
    expect(screen.getByLabelText('Cart quantity')).toHaveTextContent('2');
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByLabelText('Cart quantity')).toHaveTextContent('0');
    expect(localStorage.getItem('shopboard:cart:v1')).toBe('[]');
  });

  it('does not leak in-memory state between separate providers', async () => {
    const view = render(
      <CartProvider>
        <CartActions />
      </CartProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add two' }));
    view.unmount();
    localStorage.clear();
    render(
      <CartProvider>
        <CartCount />
      </CartProvider>,
    );
    expect(screen.getByLabelText('Cart quantity')).toHaveTextContent('0');
  });
});
